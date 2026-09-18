import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.VITE_SUPABASE_URL;
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!rawUrl || !rawKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(rawUrl, rawKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function reconcile() {
  console.log('===============================================================');
  console.log('🔄 CODELIFT SUPABASE DATA RECONCILIATION & SANITIZATION');
  console.log('===============================================================');

  // ── 1. CLEAN DANGLING BATCH COURSES & RECONCILE CANONICAL LINKS ───────────────
  console.log('\n🔵 STEP 1: Cleaning up dangling batch_courses & establishing canonical links...');
  const danglingIds = ['course-1789190352628-3yecm8q', 'course-1789190371628-0spumsi'];
  for (const deadId of danglingIds) {
    const { error: delErr } = await supabase
      .from('batch_courses')
      .delete()
      .eq('course_id', deadId);
    if (!delErr) {
      console.log(`  ✓ Removed dangling course ID from batch_courses: ${deadId}`);
    }
  }

  // Canonical cohort links
  const canonicalLinks = [
    { batch_id: 'batch-fswd-morning', course_id: 'course-fswd' },
    { batch_id: 'batch-fswd-morning', course_id: 'course-python-free' },
    { batch_id: 'batch-fswd-evening', course_id: 'course-fswd' },
    { batch_id: 'batch-da-weekend', course_id: 'course-da' },
    { batch_id: 'batch-da-weekend', course_id: 'course-python-free' }
  ];

  for (const link of canonicalLinks) {
    const { error: linkErr } = await supabase
      .from('batch_courses')
      .upsert(link, { onConflict: 'batch_id,course_id' });
    if (linkErr) {
      console.warn(`  ⚠️ Failed to link ${link.batch_id} -> ${link.course_id}:`, linkErr.message);
    } else {
      console.log(`  ✓ Verified batch course link: ${link.batch_id} <-> ${link.course_id}`);
    }
  }

  // ── 2. SEED DYNAMIC ELECTIVE COURSES IN SUPABASE ─────────────────────────────
  console.log('\n🔵 STEP 2: Seeding dynamic elective courses into Supabase...');
  const coursesPath = path.resolve(process.cwd(), 'data', 'courses.json');
  const rawCourses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

  const categoryMap = {
    'python-core-beginner-to-intermediate': 'cat-data',
    'python-advanced-data-algorithms-libraries': 'cat-data',
    'data-analyst-complete-course': 'cat-data',
    'frontend-development-complete-course': 'cat-web',
    'problem-solving-mastery': 'cat-web'
  };

  let totalModules = 0;
  let totalTopics = 0;

  for (const c of rawCourses) {
    const courseId = c.id || c.slug;
    const catId = categoryMap[c.slug] || 'cat-web';

    const { error: courseErr } = await supabase
      .from('courses')
      .upsert(
        {
          id: courseId,
          title: c.title,
          slug: c.slug || courseId,
          description: c.description || '',
          category_id: catId,
          price: Number(c.price || 0),
          is_free: Boolean(c.isFree),
          is_published: c.isPublished !== false,
          is_approved: true,
          thumbnail: c.thumbnail || '',
          rating: Number(c.rating || 5.0),
          num_reviews: Number(c.numReviews || 0),
          students_enrolled: Number(c.studentsEnrolled || 0),
          course_type: 'elective',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (courseErr) {
      console.error(`  ❌ Error upserting course ${courseId}:`, courseErr.message);
      continue;
    }
    console.log(`  ✓ Upserted elective course: ${c.title} (${courseId})`);

    // Modules and Topics
    if (Array.isArray(c.modules)) {
      for (let mIdx = 0; mIdx < c.modules.length; mIdx++) {
        const mod = c.modules[mIdx];
        const modId = mod.id || `${courseId}-m${mIdx + 1}`;
        totalModules++;

        const { error: modErr } = await supabase
          .from('course_modules')
          .upsert(
            {
              id: modId,
              course_id: courseId,
              title: mod.title,
              order_index: mIdx
            },
            { onConflict: 'id' }
          );

        if (modErr) {
          console.error(`    ❌ Error upserting module ${modId}:`, modErr.message);
          continue;
        }

        if (Array.isArray(mod.topics)) {
          for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
            const topic = mod.topics[tIdx];
            const topicId = topic.id || `${modId}-t${tIdx + 1}`;
            totalTopics++;

            const { error: topErr } = await supabase
              .from('course_topics')
              .upsert(
                {
                  id: topicId,
                  module_id: modId,
                  title: topic.title,
                  content_md: topic.contentMd || '',
                  order_index: tIdx
                },
                { onConflict: 'id' }
              );

            if (topErr) {
              console.error(`      ❌ Error upserting topic ${topicId}:`, topErr.message);
            }
          }
        }
      }
    }
  }

  console.log(`  ✓ Finished upserting ${rawCourses.length} elective courses, ${totalModules} modules, and ${totalTopics} topics.`);

  // ── 3. RESTORE MISSING ENROLLMENTS ───────────────────────────────────────────
  console.log('\n🔵 STEP 3: Restoring student enrollments...');
  const { data: studentsData } = await supabase.from('students').select('id, legacy_id');
  const studentMap = new Map();
  (studentsData || []).forEach((s) => {
    if (s.legacy_id) studentMap.set(s.legacy_id, s.id);
    studentMap.set(s.id, s.id);
  });

  const enrollmentsToRestore = [
    {
      id: 'enr-1',
      student_id: studentMap.get('stu-1'),
      course_id: 'course-fswd',
      status: 'PAID',
      payment_proof: 'https://images.unsplash.com/photo-1556742049-0a67daf40955?w=500',
      payment_note: 'UPI Ref #98765432101',
      verified_by: 'admin',
      verified_at: '2026-01-16T10:00:00.000Z',
      amount: 2499,
      discount_applied: 0,
      enrolled_at: '2026-01-15T00:00:00.000Z'
    },
    {
      id: 'enr-2',
      student_id: studentMap.get('stu-2'),
      course_id: 'course-da',
      status: 'PAID',
      payment_proof: 'https://images.unsplash.com/photo-1556742049-0a67daf40955?w=500',
      payment_note: 'Bank Transfer Ref ',
      verified_by: 'admin',
      verified_at: '2026-02-02T11:30:00.000Z',
      amount: 1799,
      discount_applied: 200,
      enrolled_at: '2026-02-01T00:00:00.000Z'
    },
    {
      id: 'enr-3',
      student_id: studentMap.get('stu-1'),
      course_id: 'course-python-free',
      status: 'FREE',
      payment_proof: null,
      payment_note: null,
      verified_by: null,
      verified_at: null,
      amount: 0,
      discount_applied: 0,
      enrolled_at: '2026-02-10T00:00:00.000Z'
    }
  ];

  for (const enr of enrollmentsToRestore) {
    if (!enr.student_id) {
      console.warn(`  ⚠️ Could not find student UUID for enrollment ${enr.id}`);
      continue;
    }
    const { error: enrErr } = await supabase
      .from('enrollments')
      .upsert(enr, { onConflict: 'id' });
    if (enrErr) {
      console.error(`  ❌ Error restoring enrollment ${enr.id}:`, enrErr.message);
    } else {
      console.log(`  ✓ Restored enrollment: ${enr.id} (Student: ${enr.student_id} -> Course: ${enr.course_id})`);
    }
  }

  // ── 4. INTEGRITY AUDIT ───────────────────────────────────────────────────────
  console.log('\n🔵 STEP 4: Final Supabase Data Integrity Audit...');
  const auditTables = [
    'courses',
    'course_modules',
    'course_topics',
    'batches',
    'batch_courses',
    'students',
    'enrollments',
    'payments',
    'fees'
  ];

  console.log('---------------------------------------------------------------');
  for (const tbl of auditTables) {
    const { data, count, error } = await supabase.from(tbl).select('*', { count: 'exact' });
    if (error) {
      console.log(`  ❌ ${tbl.padEnd(16)}: ERROR (${error.message})`);
    } else {
      console.log(`  ✅ ${tbl.padEnd(16)}: ${data.length} records`);
    }
  }
  console.log('---------------------------------------------------------------');
  console.log('🎉 Supabase data reconciliation completed successfully!\n');
}

reconcile();
