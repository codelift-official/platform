import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

globalThis.WebSocket = class {};

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceKey || !dbUrl) {
  console.error('❌ Missing env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

// Admin user to preserve
let ADMIN_ID = null;

async function fetchAdminId() {
  const { rows } = await client.query(
    "select id, email, username, role from public.users where email = 'codelift.official@gmail.com' or username = 'rishabh' limit 1"
  );
  if (!rows.length) throw new Error('No target admin user (rishabh / codelift.official@gmail.com) found. Aborting.');
  ADMIN_ID = rows[0].id;
  console.log(`✅ Admin user preserved: ${rows[0].username} (${rows[0].email}) [ID: ${ADMIN_ID}]`);
}

async function deleteStorageFiles() {
  console.log('\n🗑️  Deleting storage files...');

  for (const bucket of ['submissions', 'certificates', 'avatars']) {
    let allFiles = [];
    let offset = 0;
    const limit = 1000;

    while (true) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list('', { limit, offset });

      if (error) {
        console.warn(`   ⚠️  Could not list ${bucket}:`, error.message);
        break;
      }
      if (!data || data.length === 0) break;

      allFiles.push(...data.map((f) => f.name));
      if (data.length < limit) break;
      offset += limit;
    }

    if (allFiles.length > 0) {
      const { error } = await supabase.storage.from(bucket).remove(allFiles);
      if (error) console.warn(`   ⚠️  Failed to remove from ${bucket}:`, error.message);
      else console.log(`   ✅ ${bucket}: removed ${allFiles.length} files`);
    } else {
      console.log(`   ⏭️  ${bucket}: empty`);
    }
  }
}

async function deleteTableData() {
  console.log('\n🗑️  Deleting table data in FK-safe order...');

  const tablesInOrder = [
    'test_attempts',
    'submissions',
    'problem_attempts',
    'certificates',
    'enrollments',
    'payments',
    'fees',
    'coupons',
    'batch_courses',
    'batch_tests',
    'batch_assignments',
    'test_questions',
    'tests',
    'assignments',
    'course_topics',
    'course_modules',
    'courses',
    'categories',
    'students',
    'batches',
    'certificate_templates',
    'completed_batches',
  ];

  for (const table of tablesInOrder) {
    try {
      const res = await client.query(`DELETE FROM public.${table};`);
      console.log(`   ✅ ${table}: deleted ${res.rowCount ?? 'all'} rows`);
    } catch (err) {
      console.warn(`   ⚠️  ${table}: ${err.message}`);
    }
  }

  // Also remove non-admin users from public.users table
  if (ADMIN_ID) {
    const userRes = await client.query("DELETE FROM public.users WHERE id != $1;", [ADMIN_ID]);
    console.log(`   ✅ users: deleted ${userRes.rowCount ?? 0} non-admin user rows (preserved admin)`);
  }
}

async function deleteAuthUsers() {
  console.log('\n🗑️  Deleting non-admin auth users...');

  try {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (!error && data?.users) {
      let deleted = 0;
      for (const user of data.users) {
        if (user.id === ADMIN_ID || user.email === 'codelift.official@gmail.com') {
          console.log(`   🛡️  Preserving admin auth user: ${user.email} (${user.id})`);
          continue;
        }
        const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
        if (delErr) console.warn(`   ⚠️  ${user.email}: ${delErr.message}`);
        else deleted++;
      }
      console.log(`   ✅ Deleted ${deleted} non-admin auth users via admin API (kept admin)`);
      return;
    }
    console.warn(`   ⚠️  GoTrue listUsers returned note: ${error?.message || 'deferred'}, using direct auth.users query`);
  } catch (err) {
    console.warn('   ⚠️  GoTrue admin API deferred, using direct auth.users SQL delete');
  }

  const authRes = await client.query(
    "DELETE FROM auth.users WHERE id != $1 AND email != 'codelift.official@gmail.com';",
    [ADMIN_ID]
  );
  console.log(`   ✅ Deleted ${authRes.rowCount ?? 0} non-admin auth users from auth.users (preserved admin)`);
}

async function verifyCleanup() {
  console.log('\n📊 Verifying cleanup...');
  const checks = [
    'students', 'batches', 'categories', 'courses', 'course_modules', 'course_topics',
    'batch_courses', 'batch_tests', 'batch_assignments',
    'tests', 'test_questions', 'test_attempts', 'assignments', 'submissions',
    'fees', 'payments', 'coupons', 'enrollments', 'certificates',
    'certificate_templates', 'problem_attempts', 'completed_batches',
  ];

  const results = [];
  for (const table of checks) {
    const res = await client.query(`SELECT count(*)::int as cnt FROM public.${table};`);
    results.push({ table, count: res.rows[0].cnt });
  }

  console.table(results);

  const anyNonZero = results.some((r) => r.count > 0);
  if (anyNonZero) {
    console.warn('\n⚠️  Some tables are not empty. Review the table above.');
  } else {
    console.log('\n✅ All specified data tables are empty.');
  }

  // Verify admin is preserved in public.users
  const { rows: adminCheck } = await client.query("SELECT id, email, username, role FROM public.users;");
  console.log('\n👤 Public users preserved:', adminCheck);

  // Verify admin in auth.users
  try {
    const { rows: remainingAuth } = await client.query("SELECT id, email FROM auth.users;");
    console.log('\n🔐 Auth users preserved:', remainingAuth);
  } catch (authErr) {
    console.warn('\n⚠️ Could not query auth.users directly:', authErr.message);
  }
}

async function main() {
  console.log('⚠️  FULL DATABASE CLEANUP');
  console.log('   Preserving: admin user (rishabh / codelift.official@gmail.com) + schema');
  console.log('   Deleting: everything else\n');

  await client.connect();
  await fetchAdminId();

  await deleteStorageFiles();
  await deleteTableData();
  await deleteAuthUsers();
  await verifyCleanup();

  await client.end();
  console.log('\n🎉 Cleanup complete.');
}

main().catch((err) => {
  console.error('\n❌ Cleanup failed:', err);
  process.exit(1);
});
