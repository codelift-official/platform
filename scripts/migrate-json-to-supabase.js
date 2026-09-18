import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import { fileURLToPath } from 'url';

// ── 1. LOAD ENVIRONMENT VARIABLES ─────────────────────────────────────────────
export function loadEnv() {
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

// Deterministic UUID generator (v5 style) ensuring reproducible idempotent IDs
function toUUID(str) {
  if (str && str.length === 36 && str.includes('-') && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  const hash = crypto.createHash('sha1').update(`codelift-seed-${str}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

// ── 2. READ SEED JSON FILES ───────────────────────────────────────────────────
function readJSON(file) {
  const p = path.resolve(process.cwd(), 'data', file);
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.warn(`[Migration] Could not parse ${file}:`, e.message);
    return [];
  }
}

// ── 3. MAIN MIGRATION PROCEDURE ───────────────────────────────────────────────
export async function runJsonSeedMigration(existingClient = null, options = {}) {
  console.log('===============================================================');
  console.log('🚀 CODELIFT SUPABASE POSTGRESQL SEED & JSON DATA MIGRATION');
  console.log('===============================================================');

  loadEnv();
  const databaseUrl = process.env.DATABASE_URL;

  let client = existingClient;
  let shouldClose = false;

  if (!client) {
    if (!databaseUrl) {
      console.error('❌ Error: DATABASE_URL is required in .env.local to run the migration script.');
      console.error('Format: DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres');
      process.exit(1);
    }
    client = new pg.Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    shouldClose = true;
    console.log('✅ Connected successfully to Supabase PostgreSQL database.');
  }

  try {
    // Step 1: DDL schema migration is managed via Supabase CLI migrations
    console.log('\n🔵 STEP 1: Schema DDL already applied via Supabase CLI migrations.');

    // Step 2: Read JSON collections
    console.log('\n🔵 STEP 2: Loading seed JSON files from /data/...');
    const users = readJSON('users.json');
    const students = readJSON('students.json');
    const categories = readJSON('categories.json');
    const batches = readJSON('batches.json');
    const courses = readJSON('courses.json');
    const tests = readJSON('tests.json');
    const attempts = readJSON('attempts.json');
    const assignments = readJSON('assignments.json');
    const submissions = readJSON('submissions.json');
    const fees = readJSON('fees.json');
    const payments = readJSON('payments.json');
    const coupons = readJSON('coupons.json');
    const enrollments = readJSON('enrollments.json');
    const certificates = readJSON('certificates.json');
    const certificateTemplates = readJSON('certificateTemplates.json');
    const reviews = readJSON('reviews.json');
    const discussions = readJSON('discussions.json');
    const notifications = readJSON('notifications.json');
    const problemAttempts = readJSON('problemAttempts.json');
    const completedBatches = readJSON('completedBatches.json');

    // Build Student & User Legacy ID Mapping to UUIDs
    const studentIdMap = new Map();
    const userIdMap = new Map();

    const adminDefaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || process.env.SEED_DEFAULT_PASSWORD;
    if (!adminDefaultPassword) {
      console.error('❌ Missing ADMIN_DEFAULT_PASSWORD or SEED_DEFAULT_PASSWORD in .env.local');
      process.exit(1);
    }
    const studentDefaultPassword = 'password';
    // Blowfish hash for default password or direct crypt via pgcrypto
    await client.query(`create extension if not exists pgcrypto;`);

    // Step 3: Populate Auth Users & Users table
    console.log('\n🔵 STEP 3: Migrating Users & Admin accounts...');
    for (const u of users) {
      // Check if user already exists in auth.users by email
      const existingAuth = await client.query(
        `SELECT id FROM auth.users WHERE lower(email) = lower($1) LIMIT 1;`,
        [u.email]
      );
      let uId;
      if (existingAuth.rows.length > 0) {
        uId = existingAuth.rows[0].id;
      } else {
        uId = toUUID(u.id || u.email);
        await client.query(
          `INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
           VALUES ($1, '00000000-0000-0000-0000-000000000000', $2, crypt($3, gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', $4, now(), now())
           ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;`,
          [uId, u.email, adminDefaultPassword, JSON.stringify({ name: u.name, role: u.role || 'admin', email_verified: true })]
        );
      }
      userIdMap.set(u.id, uId);
      userIdMap.set(u.email, uId);

      // Insert into public.users
      await client.query(
        `INSERT INTO public.users (id, email, name, phone, role, is_active, bio, profile_picture, skills, created_at, approved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           role = EXCLUDED.role,
           bio = EXCLUDED.bio;`,
        [
          uId,
          u.email,
          u.name,
          u.phone || '',
          u.role === 'admin' ? 'admin' : 'student',
          u.isActive !== false,
          u.bio || '',
          u.profilePicture || '',
          u.skills || [],
          u.joinedAt || new Date().toISOString(),
          u.approvedAt || new Date().toISOString()
        ]
      );
    }
    console.log(`  ✓ Inserted/Updated ${users.length} users in public.users.`);

    // Step 4: Populate Categories
    console.log('\n🔵 STEP 4: Migrating Categories...');
    for (const cat of categories) {
      await client.query(
        `INSERT INTO public.categories (id, name, slug, icon, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           icon = EXCLUDED.icon,
           description = EXCLUDED.description;`,
        [cat.id, cat.name, cat.slug, cat.icon, cat.description || '']
      );
    }
    console.log(`  ✓ Inserted/Updated ${categories.length} categories.`);

    // Step 5: Populate Batches
    console.log('\n🔵 STEP 5: Migrating Batches...');
    for (const b of batches) {
      await client.query(
        `INSERT INTO public.batches (id, name, description, capacity, fee_amount, start_date, is_active, is_completed, completed_at, archived_students)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           capacity = EXCLUDED.capacity,
           fee_amount = EXCLUDED.fee_amount;`,
        [
          b.id,
          b.name,
          b.description || '',
          b.capacity || 10,
          b.feeAmount || b.fee || 0,
          b.startDate || null,
          b.isActive !== false,
          Boolean(b.isCompleted),
          b.completedAt || null,
          JSON.stringify(b.archivedStudents || [])
        ]
      );
    }
    console.log(`  ✓ Inserted/Updated ${batches.length} cohorts/batches.`);

    // Step 6: Populate Students
    console.log('\n🔵 STEP 6: Migrating Students & auth.users links...');
    for (const s of students) {
      // Check if student already exists in auth.users by email
      const existingAuth = await client.query(
        `SELECT id FROM auth.users WHERE lower(email) = lower($1) LIMIT 1;`,
        [s.email]
      );
      let sId;
      if (existingAuth.rows.length > 0) {
        sId = existingAuth.rows[0].id;
        await client.query(
          `UPDATE auth.users SET encrypted_password = crypt($1, gen_salt('bf')), email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE id = $2;`,
          [studentDefaultPassword, sId]
        );
      } else {
        sId = toUUID(s.id || s.email);
        await client.query(
          `INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
           VALUES ($1, '00000000-0000-0000-0000-000000000000', $2, crypt($3, gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', $4, now(), now())
           ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;`,
          [sId, s.email, studentDefaultPassword, JSON.stringify({ name: s.name, role: 'student', email_verified: true })]
        );
      }
      studentIdMap.set(s.id, sId);
      studentIdMap.set(s.email, sId);

      // Upsert into public.students
      await client.query(
        `INSERT INTO public.students (id, legacy_id, name, email, phone, batch_id, enrolled_date, total_fee, paid_fee, fee_status, is_graduated, is_active, completed_batch_ids, progress)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           batch_id = EXCLUDED.batch_id,
           total_fee = EXCLUDED.total_fee,
           paid_fee = EXCLUDED.paid_fee,
           fee_status = EXCLUDED.fee_status,
           progress = EXCLUDED.progress;`,
        [
          sId,
          s.id,
          s.name,
          s.email,
          s.phone || '',
          s.batchId || null,
          s.enrolledDate || new Date().toISOString(),
          s.totalFee || 0,
          s.paidFee || 0,
          s.feeStatus || 'PENDING',
          Boolean(s.isGraduated),
          s.isActive !== false,
          s.completedBatchIds || [],
          JSON.stringify(s.progress || {})
        ]
      );
    }
    console.log(`  ✓ Inserted/Updated ${students.length} students in public.students.`);

    // Helper to resolve student UUID
    const getStudentUUID = (refId) => {
      if (!refId) return null;
      if (studentIdMap.has(refId)) return studentIdMap.get(refId);
      // If refId is already a valid UUID
      if (refId.length === 36 && refId.includes('-')) return refId;
      return null;
    };

    // Step 7: Populate Courses, Modules, Topics, and BatchCourses
    console.log('\n🔵 STEP 7: Migrating Courses, Modules, Topics & Joins...');
    let moduleCount = 0;
    let topicCount = 0;
    let batchCourseCount = 0;

    for (const c of courses) {
      const courseId = c.id || c.slug;
      // Calculate studentsEnrolled count dynamically from enrollments
      const enrolledCount = enrollments.filter((e) => e.courseId === courseId).length;

      await client.query(
        `INSERT INTO public.courses (id, title, slug, description, category_id, price, is_free, is_published, is_approved, thumbnail, promo_video, rating, num_reviews, students_enrolled, created_at, updated_at, course_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           category_id = EXCLUDED.category_id,
           price = EXCLUDED.price,
           students_enrolled = EXCLUDED.students_enrolled,
           course_type = EXCLUDED.course_type;`,
        [
          courseId,
          c.title,
          c.slug || courseId,
          c.description || '',
          c.categoryId || null,
          c.price || 0,
          Boolean(c.isFree),
          c.isPublished !== false,
          c.isApproved !== false,
          c.thumbnail || '',
          c.promoVideo || '',
          c.rating || 5.0,
          c.numReviews || 0,
          enrolledCount || c.studentsEnrolled || 0,
          c.createdAt || new Date().toISOString(),
          c.updatedAt || new Date().toISOString(),
          'elective'
        ]
      );

      // Modules & Topics
      if (Array.isArray(c.modules)) {
        for (let mIdx = 0; mIdx < c.modules.length; mIdx++) {
          const mod = c.modules[mIdx];
          const modId = mod.id || `${courseId}-m${mIdx + 1}`;
          moduleCount++;
          await client.query(
            `INSERT INTO public.course_modules (id, course_id, title, order_index)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;`,
            [modId, courseId, mod.title, mIdx]
          );

          if (Array.isArray(mod.topics)) {
            for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
              const topic = mod.topics[tIdx];
              const topicId = topic.id || `${modId}-t${tIdx + 1}`;
              topicCount++;
              await client.query(
                `INSERT INTO public.course_topics (id, module_id, title, content_md, order_index)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_md = EXCLUDED.content_md;`,
                [topicId, modId, topic.title, topic.contentMd || '', tIdx]
              );
            }
          }
        }
      }

      // BatchCourses join
      const bIds = c.batchIds || (c.batchId ? [c.batchId] : []);
      for (const bId of bIds) {
        batchCourseCount++;
        await client.query(
          `INSERT INTO public.batch_courses (batch_id, course_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING;`,
          [bId, courseId]
        );
      }
    }
    console.log(`  ✓ Inserted ${courses.length} courses, ${moduleCount} modules, ${topicCount} topics, and ${batchCourseCount} batch_courses links.`);

    // Step 8: Populate Tests & Questions
    console.log('\n🔵 STEP 8: Migrating Tests, Test Questions & BatchTests...');
    let questionCount = 0;
    for (const t of tests) {
      await client.query(
        `INSERT INTO public.tests (id, title, description, time_limit, passing_percentage, allow_retake, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;`,
        [
          t.id,
          t.title,
          t.description || '',
          t.timeLimit || 30,
          t.passingPercentage || 70,
          t.allowRetake !== false,
          t.createdAt || new Date().toISOString()
        ]
      );

      if (Array.isArray(t.questions)) {
        for (let qIdx = 0; qIdx < t.questions.length; qIdx++) {
          const q = t.questions[qIdx];
          questionCount++;
          await client.query(
            `INSERT INTO public.test_questions (id, test_id, text, options, correct_answer, explanation, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer;`,
            [
              q.id,
              t.id,
              q.text || q.question,
              JSON.stringify(q.options || []),
              Number(q.correctAnswer ?? q.correctIndex ?? 0),
              q.explanation || '',
              qIdx
            ]
          );
        }
      }

      const assignedBatches = t.assignedBatchIds || t.batchIds || [];
      for (const bId of assignedBatches) {
        await client.query(
          `INSERT INTO public.batch_tests (batch_id, test_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING;`,
          [bId, t.id]
        );
      }
    }
    console.log(`  ✓ Inserted ${tests.length} tests and ${questionCount} questions.`);

    // Step 9: Populate Test Attempts
    console.log('\n🔵 STEP 9: Migrating Test Attempts...');
    for (const att of attempts) {
      const sUuid = getStudentUUID(att.studentId);
      if (!sUuid) continue;
      await client.query(
        `INSERT INTO public.test_attempts (id, student_id, test_id, batch_id, answers, score, total_questions, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING;`,
        [
          att.id,
          sUuid,
          att.testId,
          att.batchId || null,
          JSON.stringify(att.answers || []),
          att.score || 0,
          att.totalQuestions || 0,
          att.submittedAt || new Date().toISOString()
        ]
      );
    }
    console.log(`  ✓ Inserted ${attempts.length} test attempts.`);

    // Step 10: Populate Assignments & Submissions
    console.log('\n🔵 STEP 10: Migrating Assignments & Submissions...');
    for (const a of assignments) {
      await client.query(
        `INSERT INTO public.assignments (id, title, description, deadline, max_marks, type, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;`,
        [
          a.id,
          a.title,
          a.description || '',
          a.deadline || null,
          a.maxMarks || 100,
          a.type || 'PROJECT',
          a.createdAt || new Date().toISOString()
        ]
      );

      const aBatches = a.batchIds || [];
      for (const bId of aBatches) {
        await client.query(
          `INSERT INTO public.batch_assignments (batch_id, assignment_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING;`,
          [bId, a.id]
        );
      }
    }

    for (const sub of submissions) {
      const sUuid = getStudentUUID(sub.studentId);
      if (!sUuid) continue;
      await client.query(
        `INSERT INTO public.submissions (id, student_id, assignment_id, batch_id, file_urls, notes, submitted_at, grade, feedback)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING;`,
        [
          sub.id,
          sUuid,
          sub.assignmentId,
          sub.batchId || null,
          JSON.stringify(sub.fileUrls || []),
          sub.notes || '',
          sub.submittedAt || new Date().toISOString(),
          sub.grade !== undefined ? sub.grade : null,
          sub.feedback || null
        ]
      );
    }
    console.log(`  ✓ Inserted ${assignments.length} assignments and ${submissions.length} submissions.`);

    // Step 11: Populate Coupons
    console.log('\n🔵 STEP 11: Migrating Coupons...');
    for (const cpn of coupons) {
      await client.query(
        `INSERT INTO public.coupons (id, code, type, value, expiry, usage_limit, used_count, course_ids, created_by, used_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, used_count = EXCLUDED.used_count;`,
        [
          cpn.id,
          cpn.code,
          cpn.type || 'flat',
          cpn.value || cpn.discount || 0,
          cpn.expiry || null,
          cpn.usageLimit || 100,
          cpn.usedCount || 0,
          JSON.stringify(cpn.courseIds || []),
          cpn.createdBy || null,
          cpn.usedBy || null
        ]
      );
    }
    console.log(`  ✓ Inserted ${coupons.length} coupons.`);

    // Step 12: Populate Enrollments, Fees & Payments
    console.log('\n🔵 STEP 12: Migrating Fees, Payments & Enrollments...');
    for (const enr of enrollments) {
      const sUuid = getStudentUUID(enr.studentId);
      if (!sUuid) continue;
      await client.query(
        `INSERT INTO public.enrollments (id, student_id, course_id, coupon_id, status, payment_proof, payment_note, verified_by, verified_at, amount, discount_applied, enrolled_at, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING;`,
        [
          enr.id,
          sUuid,
          enr.courseId,
          enr.couponId || null,
          enr.status || 'PENDING',
          enr.paymentProof || null,
          enr.paymentNote || null,
          enr.verifiedBy || null,
          enr.verifiedAt || null,
          enr.amount || 0,
          enr.discountApplied || 0,
          enr.enrolledAt || new Date().toISOString(),
          enr.completedAt || null
        ]
      );
    }

    for (const f of fees) {
      const sUuid = getStudentUUID(f.studentId);
      if (!sUuid) continue;
      await client.query(
        `INSERT INTO public.fees (id, student_id, amount, paid_at, due_date, mode, status, payment_proof, payment_note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING;`,
        [
          f.id,
          sUuid,
          f.amount || 0,
          f.paidAt || null,
          f.dueDate || null,
          f.mode || 'UPI',
          f.status || 'PENDING',
          f.paymentProof || null,
          f.paymentNote || null
        ]
      );
    }

    for (const p of payments) {
      const sUuid = getStudentUUID(p.studentId);
      if (!sUuid) continue;
      await client.query(
        `INSERT INTO public.payments (id, enrollment_id, student_id, student_name, course_id, course_title, amount, mode, status, payment_proof, payment_note, verified_by, verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING;`,
        [
          p.id,
          p.enrollmentId || null,
          sUuid,
          p.studentName || 'Student',
          p.courseId || null,
          p.courseTitle || '',
          p.amount || 0,
          p.mode || 'UPI',
          p.status || 'PENDING',
          p.paymentProof || null,
          p.paymentNote || null,
          p.verifiedBy || null,
          p.verifiedAt || null
        ]
      );
    }
    console.log(`  ✓ Inserted ${enrollments.length} enrollments, ${fees.length} fee records, and ${payments.length} payments.`);

    // Step 13: Populate Certificates & Templates
    console.log('\n🔵 STEP 13: Migrating Certificates & Templates...');
    for (const tmpl of certificateTemplates) {
      await client.query(
        `INSERT INTO public.certificate_templates (id, name, is_active, institute_name, signatory_name, signatory_title, cert_title, design)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, design = EXCLUDED.design;`,
        [
          tmpl.id,
          tmpl.name,
          Boolean(tmpl.isActive),
          tmpl.instituteName || 'CodeLift Engineering Academy',
          tmpl.signatoryName || 'Director',
          tmpl.signatoryTitle || 'Academic Affairs',
          tmpl.certTitle || 'CERTIFICATE OF COMPLETION',
          JSON.stringify(tmpl.design || {})
        ]
      );
    }

    for (const cert of certificates) {
      const sUuid = getStudentUUID(cert.studentId);
      if (!sUuid) continue;
      await client.query(
        `INSERT INTO public.certificates (id, student_id, student_name, course_name, issued_at, certificate_id, is_issued, is_revoked, institute_name, signatory_name, signatory_title, cert_title, pdf_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING;`,
        [
          cert.id,
          sUuid,
          cert.studentName,
          cert.courseName,
          cert.issuedAt || new Date().toISOString(),
          cert.certificateId,
          cert.isIssued !== false,
          Boolean(cert.isRevoked),
          cert.instituteName || '',
          cert.signatoryName || '',
          cert.signatoryTitle || '',
          cert.certTitle || '',
          cert.pdfUrl || null
        ]
      );
    }
    console.log(`  ✓ Inserted ${certificateTemplates.length} templates and ${certificates.length} certificates.`);

    // Step 14: Problem Attempts & Completed Batches
    console.log('\n🔵 STEP 14: Migrating Problem Attempts & Completed Batches...');

    for (const pa of problemAttempts) {
      const sUuid = getStudentUUID(pa.studentId);
      if (!sUuid) continue;
      await client.query(
        `INSERT INTO public.problem_attempts (id, student_id, problem_id, code_submitted, passed, score, test_results, time_taken, hints_used, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING;`,
        [
          pa.id,
          sUuid,
          pa.problemId,
          pa.codeSubmitted || '',
          Boolean(pa.passed),
          pa.score || 0,
          JSON.stringify(pa.testResults || []),
          pa.timeTaken || 0,
          pa.hintsUsed || 0,
          pa.status || 'Submitted'
        ]
      );
    }

    for (const cb of completedBatches) {
      await client.query(
        `INSERT INTO public.completed_batches (id, original_batch_id, name, description, start_date, end_date, completed_at, student_ids, test_ids, assignment_ids)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING;`,
        [
          cb.id,
          cb.originalBatchId || '',
          cb.name,
          cb.description || '',
          cb.startDate || null,
          cb.endDate || null,
          cb.completedAt || new Date().toISOString(),
          JSON.stringify(cb.studentIds || []),
          JSON.stringify(cb.testIds || []),
          JSON.stringify(cb.assignmentIds || [])
        ]
      );
    }
    console.log(`  ✓ Inserted ${problemAttempts.length} problem attempts and ${completedBatches.length} completed batches.`);

    console.log('\n===============================================================');
    console.log('🎉 ALL DATA MIGRATED TO SUPABASE POSTGRESQL SUCCESSFULLY!');
    console.log('===============================================================');
    return true;
  } catch (err) {
    console.error('\n❌ Migration failed with error:', err);
    throw err;
  } finally {
    if (shouldClose && client) {
      await client.end();
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runJsonSeedMigration().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  });
}
