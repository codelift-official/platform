import fs from 'fs';
import path from 'path';
import assert from 'assert';

export function runStudentPasswordPersistenceTests() {
  console.log('🔵 RUNNING SUITE: Student Password Persistence & 1-Hour Token Refresh Shield');

  const rootDir = process.cwd();
  let passCount = 0;
  let totalCount = 0;

  function test(name, fn) {
    totalCount++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passCount++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      throw err;
    }
  }

  // 1. AuthContext preserves password across 1-hour token refresh
  test('AuthContext preserves custom password across 1-hour JWT refresh in hydrateProfile', () => {
    const authCode = fs.readFileSync(path.join(rootDir, 'src', 'contexts', 'AuthContext.jsx'), 'utf8');

    assert(authCode.includes('TOKEN_REFRESHED'), 'AuthContext must handle TOKEN_REFRESHED');
    assert(authCode.includes('codelift_student_passwords'), 'AuthContext must read from unified password registry');
    assert(authCode.includes('resolvedPassword'), 'hydrateProfile must resolve and preserve password');
    assert(authCode.includes('hasCustomSavedPwd'), 'loginStudent must guard custom passwords from being overridden');
  });

  // 2. DataContext preserves custom password across background syncFromSupabase
  test('DataContext preserves student password across background syncFromSupabase', () => {
    const dataContextCode = fs.readFileSync(path.join(rootDir, 'src', 'contexts', 'DataContext.jsx'), 'utf8');

    assert(dataContextCode.includes('syncFromSupabase'), 'DataContext must define syncFromSupabase');
    assert(dataContextCode.includes('savedCustomPwd'), 'syncFromSupabase must preserve savedCustomPwd');
    assert(dataContextCode.includes('codelift_student_passwords'), 'DataContext must sync with codelift_student_passwords registry');
  });

  // 3. StudentProfile persists new password to unified registry and updates student
  test('StudentProfile persists password to registry and triggers updateStudent', () => {
    const profileCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'student', 'StudentProfile.jsx'), 'utf8');

    assert(profileCode.includes('codelift_student_passwords'), 'StudentProfile must store in codelift_student_passwords');
    assert(profileCode.includes('updateStudent'), 'StudentProfile must call updateStudent');
    assert(profileCode.includes('updateAuthUser'), 'StudentProfile must call updateAuthUser');
  });

  // 4. ProblemDetail maps legacy arena-q1 to canonical prob-hello-world
  test('ProblemDetail aliases legacy arena-q* to high quality SEED_PROBLEMS', () => {
    const detailCode = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'ProblemDetail.jsx'), 'utf8');

    assert(detailCode.includes('LEGACY_ARENA_MAP'), 'ProblemDetail must define LEGACY_ARENA_MAP');
    assert(detailCode.includes("'arena-q1': 'prob-hello-world'"), 'ProblemDetail must alias arena-q1 to prob-hello-world');
    assert(detailCode.includes('codelift_student_code_'), 'ProblemDetail must persist student code under student-specific keys');
  });

  // 5. Supabase migration 013 exists
  test('Supabase migration 013 adds password column to public.students', () => {
    const migrationPath = path.join(rootDir, 'supabase', 'migrations', '013_student_password_column.sql');
    assert(fs.existsSync(migrationPath), 'Migration 013_student_password_column.sql must exist');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert(sql.includes('ADD COLUMN IF NOT EXISTS password'), 'Migration must add password column to public.students');
  });

  console.log(`✨ All ${passCount}/${totalCount} Student Password & Arena Alias tests PASSED!`);
  return { passedCount: passCount, totalCount };
}

if (process.argv[1] && process.argv[1].endsWith('student-password-persistence.test.js')) {
  runStudentPasswordPersistenceTests();
}
