import { supabase, isSupabaseConfigured } from './supabaseClient.js';

// ==============================================================================
// TYPED CUSTOM ERRORS
// ==============================================================================
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

function handleSupabaseError(error, defaultMsg = 'Database operation failed') {
  if (!error) return;
  console.error(`[SupabaseDataService] ${defaultMsg}:`, error);
  if (error.code === 'PGRST116') {
    throw new NotFoundError(error.message);
  }
  if (error.code === '23505') {
    throw new ConflictError(error.message);
  }
  if (error.code === '42501') {
    throw new UnauthorizedError('Access denied by Row Level Security policy');
  }
  throw new AppError(error.message || defaultMsg);
}

export function isValidUUID(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function genUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function checkConfigured() {
  return typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : Boolean(isSupabaseConfigured);
}

// ==============================================================================
// COHORT & ELECTIVE COURSES RESOLUTION
// ==============================================================================
export async function getStaticCohortCourses() {
  // When Supabase is configured, do not load static fake cohort courses; Supabase is the sole source of truth
  if (isSupabaseConfigured) {
    return [];
  }
  try {
    if (typeof window === 'undefined') {
      try {
        const nodeImport = (mod) => new Function('m', 'return import(m)')(mod);
        const fs = await nodeImport('fs');
        const path = await nodeImport('path');
        const cohortDir = path.resolve(process.cwd(), 'public', 'courses', 'cohort');
        const indexPath = path.join(cohortDir, 'index.json');
        if (fs.existsSync(indexPath)) {
          const cohortIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
          if (Array.isArray(cohortIndex?.slugs)) {
            const loaded = cohortIndex.slugs.map((slug) => {
              const courseFile = path.join(cohortDir, `${slug}.json`);
              if (fs.existsSync(courseFile)) {
                const data = JSON.parse(fs.readFileSync(courseFile, 'utf8'));
                return {
                  ...data,
                  courseType: 'cohort',
                  course_type: 'cohort',
                  isCohort: true,
                  isPublished: true,
                  isApproved: true
                };
              }
              return null;
            }).filter(Boolean);
            if (loaded.length > 0) return loaded;
          }
        }
      } catch {
        // Fall back to browser fetch below
      }
    }
    const basePath = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/platform/';
    const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const res = await fetch(`${cleanBase}courses/cohort/index.json`);
    if (!res.ok) return [];
    const cohortIndex = await res.json();
    if (!cohortIndex?.slugs) return [];
    const courses = await Promise.all(
      cohortIndex.slugs.map(async (slug) => {
        try {
          const r = await fetch(`${cleanBase}courses/cohort/${slug}.json`);
          if (!r.ok) return null;
          const data = await r.json();
          return {
            ...data,
            courseType: 'cohort',
            course_type: 'cohort',
            isCohort: true,
            isPublished: true,
            isApproved: true
          };
        } catch (e) {
          console.warn(`[supabaseDataService] Could not load cohort course ${slug}:`, e);
          return null;
        }
      })
    );
    return courses.filter(Boolean);
  } catch (err) {
    console.warn('[supabaseDataService] Error loading static cohort courses:', err);
    return [];
  }
}

export async function getAllCourses() {
  if (isSupabaseConfigured) {
    const { data: rawCourses, error } = await supabase
      .from('courses')
      .select('*');

    if (error) {
      console.warn('[supabaseDataService] Failed to fetch courses from Supabase:', error);
      return [];
    }

    return (rawCourses || []).map((c) => ({
      ...c,
      courseType: c.course_type || 'elective',
      course_type: c.course_type || 'elective',
      isCohort: c.course_type === 'cohort' || Boolean(c.is_cohort),
      price: Number(c.price || 0),
      isFree: Boolean(c.is_free),
      isPublished: Boolean(c.is_published),
      isApproved: Boolean(c.is_approved)
    }));
  }

  const cohortCourses = await getStaticCohortCourses();
  const { data: electiveRaw, error } = await supabase
    .from('courses')
    .select('*')
    .eq('course_type', 'elective');

  if (error) {
    console.warn('[supabaseDataService] Failed to fetch elective courses from Supabase:', error);
  }

  const cohortIds = new Set(cohortCourses.map((c) => c.id || c.slug));
  const cohortSlugs = new Set(cohortCourses.map((c) => c.slug).filter(Boolean));

  const electiveCourses = (electiveRaw || [])
    .filter((c) => !cohortIds.has(c.id) && !cohortSlugs.has(c.slug))
    .map((c) => ({
      ...c,
      courseType: 'elective',
      course_type: 'elective',
      isCohort: false,
      price: Number(c.price || 0),
      isFree: Boolean(c.is_free),
      isPublished: Boolean(c.is_published),
      isApproved: Boolean(c.is_approved)
    }));

  return [...cohortCourses, ...electiveCourses];
}

// ==============================================================================
// FETCH ALL DATA (PARALLEL HYDRATION)
// ==============================================================================
export async function fetchAllData() {
  if (!isSupabaseConfigured) {
    return {};
  }
  try {
    const [
      cohortCourses,
      usersRes,
      studentsRes,
      categoriesRes,
      coursesRes,
      modulesRes,
      topicsRes,
      batchCoursesRes,
      enrollmentsRes,
      couponsRes,
      paymentsRes,
      batchesRes,
      batchTestsRes,
      feesRes,
      testsRes,
      questionsRes,
      attemptsRes,
      assignmentsRes,
      batchAssignmentsRes,
      submissionsRes,
      certificatesRes,
      templatesRes,
      completedBatchesRes,
      problemAttemptsRes
    ] = await Promise.all([
      getStaticCohortCourses(),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('course_modules').select('*').order('order_index', { ascending: true }).limit(5000),
      supabase.from('course_topics').select('*').order('order_index', { ascending: true }).limit(10000),
      supabase.from('batch_courses').select('*'),
      supabase.from('enrollments').select('*').order('enrolled_at', { ascending: false }),
      supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('batches').select('*').order('created_at', { ascending: false }),
      supabase.from('batch_tests').select('*'),
      supabase.from('fees').select('*').order('created_at', { ascending: false }),
      supabase.from('tests').select('*').order('created_at', { ascending: false }),
      supabase.from('test_questions').select('*').order('order_index', { ascending: true }),
      supabase.from('test_attempts').select('*').order('submitted_at', { ascending: false }),
      supabase.from('assignments').select('*').order('created_at', { ascending: false }),
      supabase.from('batch_assignments').select('*'),
      supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('certificates').select('*').order('issued_at', { ascending: false }),
      supabase.from('certificate_templates').select('*').order('created_at', { ascending: false }),
      supabase.from('completed_batches').select('*').order('completed_at', { ascending: false }),
      supabase.from('problem_attempts').select('*').order('attempted_at', { ascending: false })
    ]);

    // Check for errors (ignore empty data or RLS restrictions)
    const rawUsers = usersRes.data || [];
    const rawStudents = studentsRes.data || [];
    const rawCategories = categoriesRes.data || [];
    const rawCourses = coursesRes.data || [];
    const rawModules = modulesRes.data || [];
    const rawTopics = topicsRes.data || [];
    const rawBatchCourses = batchCoursesRes.data || [];
    const rawEnrollments = enrollmentsRes.data || [];
    const rawCoupons = couponsRes.data || [];
    const rawPayments = paymentsRes.data || [];
    const rawBatches = batchesRes.data || [];
    const rawBatchTests = batchTestsRes.data || [];
    const rawFees = feesRes.data || [];
    const rawTests = testsRes.data || [];
    const rawQuestions = questionsRes.data || [];
    const rawAttempts = attemptsRes.data || [];
    const rawAssignments = assignmentsRes.data || [];
    const rawBatchAssignments = batchAssignmentsRes.data || [];
    const rawSubmissions = submissionsRes.data || [];
    const rawCertificates = certificatesRes.data || [];
    const rawTemplates = templatesRes.data || [];
    const rawCompletedBatches = completedBatchesRes.data || [];
    const rawProblemAttempts = problemAttemptsRes.data || [];

    // Reassemble Batches
    const batches = rawBatches.map((b) => {
      const dbCourseIds = rawBatchCourses.filter((bc) => bc.batch_id === b.id).map((bc) => bc.course_id);
      const staticCohortCourseIds = cohortCourses
        .filter((c) => c.batchId === b.id || (Array.isArray(c.batchIds) && c.batchIds.includes(b.id)))
        .map((c) => c.id);
      const courseIds = Array.from(new Set([...dbCourseIds, ...staticCohortCourseIds]));
      const testIds = rawBatchTests.filter((bt) => bt.batch_id === b.id).map((bt) => bt.test_id);
      return {
        id: b.id,
        name: b.name,
        description: b.description || '',
        capacity: Number(b.capacity || 30),
        feeAmount: Number(b.fee_amount || 0),
        fee: Number(b.fee_amount || 0),
        startDate: b.start_date,
        isActive: Boolean(b.is_active),
        isCompleted: Boolean(b.is_completed),
        completedAt: b.completed_at,
        archivedStudents: b.archived_students || [],
        courseIds,
        testIds
      };
    });

    // Reassemble Elective Courses from Supabase
    const electiveCourses = rawCourses.map((c) => {
      const courseBatchIds = rawBatchCourses.filter((bc) => bc.course_id === c.id).map((bc) => bc.batch_id);
      const modules = rawModules
        .filter((m) => m.course_id === c.id)
        .map((m) => ({
          id: m.id,
          title: m.title,
          quizQuestions: Array.isArray(m.quiz_questions) ? m.quiz_questions : (Array.isArray(m.quizQuestions) ? m.quizQuestions : []),
          topics: rawTopics
            .filter((t) => t.module_id === m.id)
            .map((t) => ({
              id: t.id,
              title: t.title,
              contentMd: t.content_md || t.contentMd || '',
              quizQuestions: Array.isArray(t.quiz_questions) ? t.quiz_questions : (Array.isArray(t.quizQuestions) ? t.quizQuestions : [])
            }))
        }));

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description || '',
        categoryId: c.category_id,
        courseType: c.course_type || 'elective',
        course_type: c.course_type || 'elective',
        isCohort: false,
        price: Number(c.price || 0),
        isFree: Boolean(c.is_free),
        isPublished: Boolean(c.is_published),
        isApproved: Boolean(c.is_approved),
        thumbnail: c.thumbnail || '',
        promoVideo: c.promo_video || '',
        rating: Number(c.rating || 5),
        numReviews: Number(c.num_reviews || 0),
        studentsEnrolled: Number(c.students_enrolled || 0),
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        batchIds: courseBatchIds,
        batchId: courseBatchIds[0] || null,
        modules
      };
    });

    // Merge static cohort courses + dynamic elective courses (cohort courses take precedence)
    const cohortIds = new Set(cohortCourses.map((c) => c.id || c.slug));
    const cohortSlugs = new Set(cohortCourses.map((c) => c.slug).filter(Boolean));
    const nonDuplicateElectives = electiveCourses.filter(
      (ec) => !cohortIds.has(ec.id) && !cohortSlugs.has(ec.slug)
    );
    const augmentedCohortCourses = cohortCourses.map((c) => {
      const dbBatchIds = rawBatchCourses
        .filter((bc) => bc.course_id === c.id || (c.slug && bc.course_id === c.slug))
        .map((bc) => bc.batch_id);
      const initialBatchIds = Array.isArray(c.batchIds) ? c.batchIds : (c.batchId ? [c.batchId] : []);
      const combinedBatchIds = Array.from(new Set([...initialBatchIds, ...dbBatchIds]));
      return {
        ...c,
        batchIds: combinedBatchIds,
        batchId: combinedBatchIds[0] || null
      };
    });
    const courses = [...augmentedCohortCourses, ...nonDuplicateElectives];

    // Reassemble Tests
    const tests = rawTests.map((t) => {
      const assignedBatchIds = rawBatchTests.filter((bt) => bt.test_id === t.id).map((bt) => bt.batch_id);
      const questions = rawQuestions
        .filter((q) => q.test_id === t.id)
        .map((q) => ({
          id: q.id,
          text: q.text,
          question: q.text,
          options: q.options || [],
          correctAnswer: Number(q.correct_answer),
          explanation: q.explanation || ''
        }));

      return {
        id: t.id,
        title: t.title,
        description: t.description || '',
        timeLimit: Number(t.time_limit || 30),
        passingPercentage: Number(t.passing_percentage || 70),
        allowRetake: Boolean(t.allow_retake),
        assignedBatchIds,
        batchIds: assignedBatchIds,
        createdAt: t.created_at,
        questions
      };
    });

    // Reassemble Assignments
    const assignments = rawAssignments.map((a) => {
      const batchIds = rawBatchAssignments.filter((ba) => ba.assignment_id === a.id).map((ba) => ba.batch_id);
      return {
        id: a.id,
        title: a.title,
        description: a.description || '',
        deadline: a.deadline,
        maxMarks: Number(a.max_marks || 100),
        type: a.type || 'PROJECT',
        batchIds,
        createdAt: a.created_at
      };
    });

    // Reassemble Students
    const students = rawStudents.map((s) => ({
      id: s.id,
      legacyId: s.legacy_id,
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      batchId: s.batch_id || '',
      enrolledDate: s.enrolled_date,
      totalFee: Number(s.total_fee || 0),
      paidFee: Number(s.paid_fee || 0),
      feeStatus: s.fee_status || 'PENDING',
      isGraduated: Boolean(s.is_graduated),
      isActive: Boolean(s.is_active),
      reset_requested: Boolean(s.reset_requested), // password reset flag
      completedBatchIds: s.completed_batch_ids || [],
      progress: s.progress || {},
      quizAttempts: s.quiz_attempts || s.quizAttempts || {},
      baseFee: Number(s.base_fee || 0),
      concessionAmount: Number(s.concession_amount || 0),
      concessionReason: s.concession_reason || '',
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));

    // Reassemble Fees
    const fees = rawFees.map((f) => ({
      id: f.id,
      studentId: f.student_id,
      amount: Number(f.amount || 0),
      paidAt: f.paid_at,
      dueDate: f.due_date,
      mode: f.mode || 'UPI',
      status: f.status || 'PENDING',
      paymentProof: f.payment_proof || null,
      paymentNote: f.payment_note || null,
      createdAt: f.created_at
    }));

    // Reassemble Submissions
    const submissions = rawSubmissions.map((sub) => ({
      id: sub.id,
      studentId: sub.student_id,
      assignmentId: sub.assignment_id,
      batchId: sub.batch_id,
      fileUrls: sub.file_urls || [],
      notes: sub.notes || '',
      submittedAt: sub.submitted_at,
      grade: sub.grade !== null ? Number(sub.grade) : null,
      feedback: sub.feedback || null,
      createdAt: sub.created_at
    }));

    // Reassemble Certificates
    const certificates = rawCertificates.map((cert) => ({
      id: cert.id,
      studentId: cert.student_id,
      studentName: cert.student_name,
      courseName: cert.course_name,
      issuedAt: cert.issued_at,
      certificateId: cert.certificate_id,
      isIssued: Boolean(cert.is_issued),
      isRevoked: Boolean(cert.is_revoked),
      instituteName: cert.institute_name || '',
      signatoryName: cert.signatory_name || '',
      signatoryTitle: cert.signatory_title || '',
      certTitle: cert.cert_title || '',
      pdfUrl: cert.pdf_url || null,
      createdAt: cert.created_at
    }));

    // Reassemble Certificate Templates
    const certificateTemplates = rawTemplates.map((tmpl) => ({
      id: tmpl.id,
      name: tmpl.name,
      isActive: Boolean(tmpl.is_active),
      instituteName: tmpl.institute_name || '',
      signatoryName: tmpl.signatory_name || '',
      signatoryTitle: tmpl.signatory_title || '',
      certTitle: tmpl.cert_title || '',
      design: tmpl.design || {},
      createdAt: tmpl.created_at
    }));

    // Reassemble Test Attempts
    const testAttempts = rawAttempts.map((att) => ({
      id: att.id,
      studentId: att.student_id,
      testId: att.test_id,
      batchId: att.batch_id,
      answers: att.answers || [],
      score: Number(att.score || 0),
      totalQuestions: Number(att.total_questions || 0),
      submittedAt: att.submitted_at,
      createdAt: att.created_at
    }));

    // Reassemble Payments
    const payments = rawPayments.map((p) => ({
      id: p.id,
      enrollmentId: p.enrollment_id,
      studentId: p.student_id,
      studentName: p.student_name,
      courseId: p.course_id,
      courseTitle: p.course_title,
      amount: Number(p.amount || 0),
      mode: p.mode,
      status: p.status,
      paymentProof: p.payment_proof,
      paymentNote: p.payment_note,
      verifiedBy: p.verified_by,
      verifiedAt: p.verified_at,
      createdAt: p.created_at
    }));

    // Reassemble Enrollments
    const enrollments = rawEnrollments.map((enr) => ({
      id: enr.id,
      studentId: enr.student_id,
      courseId: enr.course_id,
      couponId: enr.coupon_id,
      status: enr.status,
      paymentProof: enr.payment_proof,
      paymentNote: enr.payment_note,
      verifiedBy: enr.verified_by,
      verifiedAt: enr.verified_at,
      amount: Number(enr.amount || 0),
      discountApplied: Number(enr.discount_applied || 0),
      enrolledAt: enr.enrolled_at,
      completedAt: enr.completed_at,
      createdAt: enr.created_at
    }));

    // Reassemble Users
    const users = rawUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      role: u.role,
      isActive: Boolean(u.is_active),
      bio: u.bio,
      profilePicture: u.profile_picture,
      skills: u.skills || [],
      joinedAt: u.created_at,
      approvedAt: u.approved_at
    }));

    // Categories
    const categories = rawCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description
    }));

    // Coupons
    const coupons = rawCoupons.map((cpn) => ({
      id: cpn.id,
      code: cpn.code,
      type: cpn.type,
      value: Number(cpn.value || 0),
      expiry: cpn.expiry,
      usageLimit: Number(cpn.usage_limit || 100),
      usedCount: Number(cpn.used_count || 0),
      courseIds: cpn.course_ids || [],
      createdBy: cpn.created_by,
      usedBy: cpn.used_by,
      createdAt: cpn.created_at
    }));

    // Problem Attempts
    const problemAttempts = rawProblemAttempts.map((pa) => ({
      id: pa.id,
      studentId: pa.student_id,
      problemId: pa.problem_id,
      codeSubmitted: pa.code_submitted,
      passed: Boolean(pa.passed),
      score: Number(pa.score || 0),
      testResults: pa.test_results || [],
      attemptedAt: pa.attempted_at,
      timeTaken: Number(pa.time_taken || 0),
      hintsUsed: Number(pa.hints_used || 0),
      status: pa.status,
      createdAt: pa.created_at
    }));

    // Completed Batches
    const completedBatches = rawCompletedBatches.map((cb) => ({
      id: cb.id,
      originalBatchId: cb.original_batch_id,
      name: cb.name,
      description: cb.description,
      startDate: cb.start_date,
      endDate: cb.end_date,
      completedAt: cb.completed_at,
      studentIds: cb.student_ids || [],
      testIds: cb.test_ids || [],
      assignmentIds: cb.assignment_ids || [],
      snapshot: cb.snapshot || null
    }));

    // Optional Coding Arena Tables in Supabase
    let codingProblems = [];
    let codingAttempts = [];
    try {
      const [cpRes, caRes] = await Promise.all([
        supabase.from('coding_problems').select('*').order('order_index', { ascending: true }),
        supabase.from('coding_attempts').select('*').order('attempted_at', { ascending: false })
      ]);
      if (cpRes?.data?.length) {
        codingProblems = cpRes.data.map(cp => ({
          id: cp.id,
          title: cp.title,
          description: cp.description || '',
          difficulty: cp.difficulty || 'Easy',
          category: cp.category || 'Lists',
          orderIndex: Number(cp.order_index || 1),
          xp: Number(cp.xp || 50),
          hints: cp.hints || [],
          starterCode: cp.starter_code || '',
          testCases: cp.test_cases || [],
          hiddenTestCases: cp.hidden_test_cases || []
        }));
      }
      if (caRes?.data?.length) {
        codingAttempts = caRes.data.map(ca => ({
          id: ca.id,
          studentId: ca.student_id,
          problemId: ca.problem_id,
          code: ca.code || '',
          passed: Boolean(ca.passed),
          xpEarned: Number(ca.xp_earned || 0),
          visibleResults: ca.visible_results || [],
          hiddenResultsSummary: ca.hidden_results_summary || {},
          attemptedAt: ca.attempted_at
        }));
      }
    } catch {
      // Ignored if tables do not exist yet in Supabase
    }

    return {
      users,
      students,
      categories,
      courses,
      enrollments,
      coupons,
      payments,
      batches,
      fees,
      tests,
      testAttempts,
      assignments,
      submissions,
      certificates,
      certificateTemplates,
      completedBatches,
      problemAttempts,
      codingProblems,
      codingAttempts
    };
  } catch (err) {
    console.error('[SupabaseDataService] fetchAllData failed:', err);
    throw err;
  }
}

// ==============================================================================
// STUDENT MUTATIONS
// ==============================================================================
let isQuizAttemptsColumnSupported = true;

export async function addStudent(studentData) {
  const assignedId = isValidUUID(studentData.id) ? studentData.id : genUUID();
  const insertPayload = {
    id: assignedId,
    legacy_id: studentData.legacyId || studentData.legacy_id || (!isValidUUID(studentData.id) ? studentData.id : null),
    name: studentData.name,
    email: studentData.email,
    phone: studentData.phone || '',
    batch_id: studentData.batchId || null,
    enrolled_date: studentData.enrolledDate || new Date().toISOString(),
    total_fee: Number(studentData.totalFee || 0),
    paid_fee: Number(studentData.paidFee || 0),
    fee_status: studentData.feeStatus || 'PENDING',
    is_graduated: Boolean(studentData.isGraduated),
    is_active: studentData.isActive !== false,
    completed_batch_ids: studentData.completedBatchIds || [],
    progress: studentData.progress || {},
    base_fee: Number(studentData.baseFee || 0),
    concession_amount: Number(studentData.concessionAmount || 0),
    concession_reason: studentData.concessionReason || '',
    reset_requested: Boolean(studentData.reset_requested)
  };

  const quizAttempts = studentData.quizAttempts || studentData.quiz_attempts;
  if (isQuizAttemptsColumnSupported && quizAttempts && Object.keys(quizAttempts).length > 0) {
    insertPayload.quiz_attempts = quizAttempts;
  }

  let { data, error } = await supabase
    .from('students')
    .insert(insertPayload)
    .select()
    .single();

  if (error && (error.code === 'PGRST204' || (error.message && error.message.includes('quiz_attempts')))) {
    console.warn('[supabaseDataService] students.quiz_attempts column missing in schema cache; retrying insert without quiz_attempts');
    isQuizAttemptsColumnSupported = false;
    delete insertPayload.quiz_attempts;
    const retry = await supabase
      .from('students')
      .insert(insertPayload)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) handleSupabaseError(error, 'Failed to add student');
  return data;
}

export async function updateStudent(studentId, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.batchId !== undefined) payload.batch_id = updates.batchId || null;
  if (updates.totalFee !== undefined) payload.total_fee = Number(updates.totalFee);
  if (updates.paidFee !== undefined) payload.paid_fee = Number(updates.paidFee);
  if (updates.feeStatus !== undefined) payload.fee_status = updates.feeStatus;
  if (updates.isGraduated !== undefined) payload.is_graduated = Boolean(updates.isGraduated);
  if (updates.isActive !== undefined) payload.is_active = Boolean(updates.isActive);
  if (updates.completedBatchIds !== undefined) payload.completed_batch_ids = updates.completedBatchIds;
  if (updates.progress !== undefined) payload.progress = updates.progress;
  if (isQuizAttemptsColumnSupported) {
    if (updates.quizAttempts !== undefined) payload.quiz_attempts = updates.quizAttempts;
    if (updates.quiz_attempts !== undefined) payload.quiz_attempts = updates.quiz_attempts;
  }
  if (updates.reset_requested !== undefined) payload.reset_requested = Boolean(updates.reset_requested);
  if (updates.baseFee !== undefined) payload.base_fee = Number(updates.baseFee);
  if (updates.concessionAmount !== undefined) payload.concession_amount = Number(updates.concessionAmount);
  if (updates.concessionReason !== undefined) payload.concession_reason = updates.concessionReason;

  if (Object.keys(payload).length === 0) return null;

  const isUUID = isValidUUID(studentId);
  const runUpdate = (p) => {
    const query = supabase.from('students').update(p);
    return isUUID
      ? query.eq('id', studentId)
      : query.or(`id.eq.${studentId},legacy_id.eq.${studentId}`);
  };

  let { data, error } = await runUpdate(payload).select().single();

  if (error && (error.code === 'PGRST204' || (error.message && error.message.includes('quiz_attempts')))) {
    console.warn('[supabaseDataService] students.quiz_attempts column missing in schema cache; retrying update without quiz_attempts');
    isQuizAttemptsColumnSupported = false;
    delete payload.quiz_attempts;
    if (Object.keys(payload).length > 0) {
      const retry = await runUpdate(payload).select().single();
      data = retry.data;
      error = retry.error;
    } else {
      return null;
    }
  }

  if (error) handleSupabaseError(error, 'Failed to update student');
  return data;
}

export async function deleteStudent(studentId) {
  const isUUID = isValidUUID(studentId);
  const query = supabase.from('students').delete();

  const { error } = await (isUUID
    ? query.eq('id', studentId)
    : query.or(`id.eq.${studentId},legacy_id.eq.${studentId}`));

  if (error) handleSupabaseError(error, 'Failed to delete student');
  return true;
}

// ==============================================================================
// BATCH MUTATIONS
// ==============================================================================
export async function addBatch(batchData) {
  const { data, error } = await supabase
    .from('batches')
    .insert({
      id: batchData.id,
      name: batchData.name,
      description: batchData.description || '',
      capacity: Number(batchData.capacity || 30),
      fee_amount: Number(batchData.feeAmount || batchData.fee || 0),
      start_date: batchData.startDate || null,
      is_active: batchData.isActive !== false,
      is_completed: Boolean(batchData.isCompleted),
      completed_at: batchData.completedAt || null,
      archived_students: batchData.archivedStudents || []
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to create batch');

  // Insert linked courses if provided
  if (Array.isArray(batchData.courseIds) && batchData.courseIds.length > 0) {
    const rows = batchData.courseIds.map((cId) => ({ batch_id: batchData.id, course_id: cId }));
    await supabase.from('batch_courses').insert(rows);
  }

  return data;
}

export async function updateBatch(batchId, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.capacity !== undefined) payload.capacity = Number(updates.capacity);
  if (updates.feeAmount !== undefined || updates.fee !== undefined) {
    payload.fee_amount = Number(updates.feeAmount || updates.fee);
  }
  if (updates.startDate !== undefined) payload.start_date = updates.startDate;
  if (updates.isActive !== undefined) payload.is_active = Boolean(updates.isActive);
  if (updates.isCompleted !== undefined) payload.is_completed = Boolean(updates.isCompleted);
  if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
  if (updates.archivedStudents !== undefined) payload.archived_students = updates.archivedStudents;

  if (Object.keys(payload).length > 0) {
    const { error } = await supabase.from('batches').update(payload).eq('id', batchId);
    if (error) handleSupabaseError(error, 'Failed to update batch');
  }

  // Update courseIds M:N links if given
  if (Array.isArray(updates.courseIds)) {
    await supabase.from('batch_courses').delete().eq('batch_id', batchId);
    if (updates.courseIds.length > 0) {
      const rows = updates.courseIds.map((cId) => ({ batch_id: batchId, course_id: cId }));
      await supabase.from('batch_courses').insert(rows);
    }
  }

  // Update testIds M:N links if given
  if (Array.isArray(updates.testIds)) {
    await supabase.from('batch_tests').delete().eq('batch_id', batchId);
    if (updates.testIds.length > 0) {
      const rows = updates.testIds.map((tId) => ({ batch_id: batchId, test_id: tId }));
      await supabase.from('batch_tests').insert(rows);
    }
  }

  return true;
}

export async function deleteBatch(batchId) {
  // 1. Delete associated junction records
  await supabase.from('batch_courses').delete().eq('batch_id', batchId);
  await supabase.from('batch_tests').delete().eq('batch_id', batchId);
  await supabase.from('batch_assignments').delete().eq('batch_id', batchId);

  // 2. Unassign students
  await supabase.from('students').update({ batch_id: null }).eq('batch_id', batchId);

  // 3. Delete batch record itself
  const { error } = await supabase.from('batches').delete().eq('id', batchId);
  if (error) handleSupabaseError(error, 'Failed to delete batch');
  return true;
}

export async function attachCourseToBatch(courseId, batchId) {
  const { error } = await supabase
    .from('batch_courses')
    .upsert({ batch_id: batchId, course_id: courseId }, { onConflict: 'batch_id,course_id' });
  if (error) handleSupabaseError(error, 'Failed to attach course to batch');
  return true;
}

export async function detachCourseFromBatch(courseId, batchId) {
  const { error } = await supabase
    .from('batch_courses')
    .delete()
    .eq('batch_id', batchId)
    .eq('course_id', courseId);
  if (error) handleSupabaseError(error, 'Failed to detach course from batch');
  return true;
}

export async function attachTestToBatch(testId, batchId) {
  const { error } = await supabase
    .from('batch_tests')
    .upsert({ batch_id: batchId, test_id: testId }, { onConflict: 'batch_id,test_id' });
  if (error) handleSupabaseError(error, 'Failed to attach test to batch');
  return true;
}

export async function detachTestFromBatch(testId, batchId) {
  const { error } = await supabase
    .from('batch_tests')
    .delete()
    .eq('batch_id', batchId)
    .eq('test_id', testId);
  if (error) handleSupabaseError(error, 'Failed to detach test from batch');
  return true;
}

// ==============================================================================
// COURSE MUTATIONS
// ==============================================================================
export async function addCourse(courseData) {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      id: courseData.id,
      title: courseData.title,
      slug: courseData.slug || courseData.id,
      description: courseData.description || '',
      category_id: courseData.categoryId || null,
      course_type: courseData.courseType || 'elective',
      price: Number(courseData.price || 0),
      is_free: Boolean(courseData.isFree),
      is_published: courseData.isPublished !== false,
      is_approved: courseData.isApproved !== false,
      thumbnail: courseData.thumbnail || '',
      promo_video: courseData.promoVideo || '',
      rating: Number(courseData.rating || 5),
      num_reviews: Number(courseData.numReviews || 0),
      students_enrolled: Number(courseData.studentsEnrolled || 0)
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to add course');

  // Insert modules and topics
  if (Array.isArray(courseData.modules) && courseData.modules.length > 0) {
    const moduleRows = courseData.modules.map((mod, mIdx) => ({
      id: mod.id,
      course_id: courseData.id,
      title: mod.title,
      order_index: mIdx,
      quiz_questions: Array.isArray(mod.quizQuestions) ? mod.quizQuestions : []
    }));
    const { error: modErr } = await supabase.from('course_modules').insert(moduleRows);
    if (modErr) handleSupabaseError(modErr, 'Failed to add course modules');

    const allTopicRows = [];
    for (let mIdx = 0; mIdx < courseData.modules.length; mIdx++) {
      const mod = courseData.modules[mIdx];
      if (Array.isArray(mod.topics)) {
        for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
          const t = mod.topics[tIdx];
          allTopicRows.push({
            id: t.id,
            module_id: mod.id,
            title: t.title,
            content_md: t.contentMd || t.content_md || '',
            order_index: tIdx,
            quiz_questions: Array.isArray(t.quizQuestions) ? t.quizQuestions : (Array.isArray(t.quiz_questions) ? t.quiz_questions : [])
          });
        }
      }
    }

    if (allTopicRows.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < allTopicRows.length; i += chunkSize) {
        const chunk = allTopicRows.slice(i, i + chunkSize);
        const { error: topErr } = await supabase.from('course_topics').insert(chunk);
        if (topErr) handleSupabaseError(topErr, 'Failed to add course topics');
      }
    }
  }

  // Insert batch relations
  const batchIds = courseData.batchIds || (courseData.batchId ? [courseData.batchId] : []);
  if (batchIds.length > 0) {
    const rows = batchIds.map((bId) => ({ batch_id: bId, course_id: courseData.id }));
    await supabase.from('batch_courses').insert(rows);
  }

  return data;
}

export async function updateCourse(courseId, updates) {
  const payload = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
  if (updates.courseType !== undefined) payload.course_type = updates.courseType;
  if (updates.price !== undefined) payload.price = Number(updates.price);
  if (updates.isFree !== undefined) payload.is_free = Boolean(updates.isFree);
  if (updates.isPublished !== undefined) payload.is_published = Boolean(updates.isPublished);
  if (updates.isApproved !== undefined) payload.is_approved = Boolean(updates.isApproved);
  if (updates.thumbnail !== undefined) payload.thumbnail = updates.thumbnail;
  if (updates.promoVideo !== undefined) payload.promo_video = updates.promoVideo;
  if (updates.rating !== undefined) payload.rating = Number(updates.rating);
  if (updates.numReviews !== undefined) payload.num_reviews = Number(updates.numReviews);
  if (updates.studentsEnrolled !== undefined) payload.students_enrolled = Number(updates.studentsEnrolled);

  if (Object.keys(payload).length > 0) {
    const { error } = await supabase.from('courses').update(payload).eq('id', courseId);
    if (error) handleSupabaseError(error, 'Failed to update course');
  }

  // If modules array passed, re-sync modules and topics
  if (Array.isArray(updates.modules)) {
    const { error: delModErr } = await supabase.from('course_modules').delete().eq('course_id', courseId);
    if (delModErr) handleSupabaseError(delModErr, 'Failed to clear previous course modules');

    if (updates.modules.length > 0) {
      const moduleRows = updates.modules.map((mod, mIdx) => ({
        id: mod.id,
        course_id: courseId,
        title: mod.title,
        order_index: mIdx,
        quiz_questions: Array.isArray(mod.quizQuestions) ? mod.quizQuestions : []
      }));
      const { error: modErr } = await supabase.from('course_modules').insert(moduleRows);
      if (modErr) handleSupabaseError(modErr, 'Failed to update course modules');

      const allTopicRows = [];
      for (let mIdx = 0; mIdx < updates.modules.length; mIdx++) {
        const mod = updates.modules[mIdx];
        if (Array.isArray(mod.topics)) {
          for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
            const t = mod.topics[tIdx];
            allTopicRows.push({
              id: t.id,
              module_id: mod.id,
              title: t.title,
              content_md: t.contentMd || t.content_md || '',
              order_index: tIdx,
              quiz_questions: Array.isArray(t.quizQuestions) ? t.quizQuestions : (Array.isArray(t.quiz_questions) ? t.quiz_questions : [])
            });
          }
        }
      }

      if (allTopicRows.length > 0) {
        const chunkSize = 50;
        for (let i = 0; i < allTopicRows.length; i += chunkSize) {
          const chunk = allTopicRows.slice(i, i + chunkSize);
          const { error: topErr } = await supabase.from('course_topics').insert(chunk);
          if (topErr) handleSupabaseError(topErr, 'Failed to update course topics');
        }
      }
    }
  }

  // Re-sync batch IDs
  if (Array.isArray(updates.batchIds)) {
    await supabase.from('batch_courses').delete().eq('course_id', courseId);
    if (updates.batchIds.length > 0) {
      const rows = updates.batchIds.map((bId) => ({ batch_id: bId, course_id: courseId }));
      await supabase.from('batch_courses').insert(rows);
    }
  }

  return true;
}

export async function deleteCourse(courseId) {
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) handleSupabaseError(error, 'Failed to delete course');
  return true;
}

export async function addCategory(categoryData) {
  const slug = (categoryData.slug || categoryData.name || 'cat')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const id = categoryData.id || `cat-${slug}`;

  const { data, error } = await supabase
    .from('categories')
    .upsert(
      {
        id,
        name: categoryData.name,
        slug,
        description: categoryData.description || '',
        icon: categoryData.icon || 'code'
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to add category');
  return data;
}

// ==============================================================================
// FEES & PAYMENTS
// ==============================================================================
export async function addFee(feeData) {
  const { data, error } = await supabase
    .from('fees')
    .insert({
      id: feeData.id,
      student_id: feeData.studentId,
      amount: Number(feeData.amount || 0),
      paid_at: feeData.paidAt || null,
      due_date: feeData.dueDate || null,
      mode: feeData.mode || 'UPI',
      status: feeData.status || 'PENDING',
      payment_proof: feeData.paymentProof || null,
      payment_note: feeData.paymentNote || null
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to add fee record');
  return data;
}

export async function updateFee(feeId, updates) {
  const payload = {};
  if (updates.amount !== undefined) payload.amount = Number(updates.amount);
  if (updates.paidAt !== undefined) payload.paid_at = updates.paidAt;
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
  if (updates.mode !== undefined) payload.mode = updates.mode;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.paymentProof !== undefined) payload.payment_proof = updates.paymentProof;
  if (updates.paymentNote !== undefined) payload.payment_note = updates.paymentNote;

  const { data, error } = await supabase.from('fees').update(payload).eq('id', feeId).select().single();
  if (error) handleSupabaseError(error, 'Failed to update fee record');
  return data;
}

export async function deleteFee(feeId) {
  const { error } = await supabase.from('fees').delete().eq('id', feeId);
  if (error) handleSupabaseError(error, 'Failed to delete fee record');
  return true;
}

// ==============================================================================
// TESTS & ATTEMPTS
// ==============================================================================
export async function addTest(testData) {
  const { data, error } = await supabase
    .from('tests')
    .insert({
      id: testData.id,
      title: testData.title,
      description: testData.description || '',
      time_limit: Number(testData.timeLimit || 30),
      passing_percentage: Number(testData.passingPercentage || 70),
      allow_retake: testData.allowRetake !== false
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to add test');

  if (Array.isArray(testData.questions)) {
    const qRows = testData.questions.map((q, idx) => ({
      id: q.id,
      test_id: testData.id,
      text: q.text || q.question,
      options: q.options || [],
      correct_answer: Number(q.correctAnswer ?? q.correctIndex ?? 0),
      explanation: q.explanation || '',
      order_index: idx
    }));
    if (qRows.length > 0) {
      await supabase.from('test_questions').insert(qRows);
    }
  }

  const batchIds = testData.assignedBatchIds || testData.batchIds || [];
  if (batchIds.length > 0) {
    const btRows = batchIds.map((bId) => ({ batch_id: bId, test_id: testData.id }));
    await supabase.from('batch_tests').insert(btRows);
  }

  return data;
}

export async function updateTest(testId, updates) {
  const payload = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.timeLimit !== undefined) payload.time_limit = Number(updates.timeLimit);
  if (updates.passingPercentage !== undefined) payload.passing_percentage = Number(updates.passingPercentage);
  if (updates.allowRetake !== undefined) payload.allow_retake = Boolean(updates.allowRetake);

  if (Object.keys(payload).length > 0) {
    const { error } = await supabase.from('tests').update(payload).eq('id', testId);
    if (error) handleSupabaseError(error, 'Failed to update test');
  }

  if (Array.isArray(updates.questions)) {
    await supabase.from('test_questions').delete().eq('test_id', testId);
    const qRows = updates.questions.map((q, idx) => ({
      id: q.id,
      test_id: testId,
      text: q.text || q.question,
      options: q.options || [],
      correct_answer: Number(q.correctAnswer ?? q.correctIndex ?? 0),
      explanation: q.explanation || '',
      order_index: idx
    }));
    if (qRows.length > 0) {
      await supabase.from('test_questions').insert(qRows);
    }
  }

  if (Array.isArray(updates.assignedBatchIds) || Array.isArray(updates.batchIds)) {
    const batchIds = updates.assignedBatchIds || updates.batchIds;
    await supabase.from('batch_tests').delete().eq('test_id', testId);
    if (batchIds.length > 0) {
      const rows = batchIds.map((bId) => ({ batch_id: bId, test_id: testId }));
      await supabase.from('batch_tests').insert(rows);
    }
  }

  return true;
}

export async function deleteTest(testId) {
  await supabase.from('test_attempts').delete().eq('test_id', testId);
  await supabase.from('batch_tests').delete().eq('test_id', testId);
  await supabase.from('test_questions').delete().eq('test_id', testId);
  const { error } = await supabase.from('tests').delete().eq('id', testId);
  if (error) handleSupabaseError(error, 'Failed to delete test');
  return true;
}

export async function submitTestAttempt(attemptData) {
  const { data, error } = await supabase
    .from('test_attempts')
    .insert({
      id: attemptData.id,
      student_id: attemptData.studentId,
      test_id: attemptData.testId,
      batch_id: attemptData.batchId || null,
      answers: attemptData.answers || [],
      score: Number(attemptData.score || 0),
      total_questions: Number(attemptData.totalQuestions || 0),
      submitted_at: attemptData.submittedAt || new Date().toISOString()
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to record test attempt');
  return data;
}

// ==============================================================================
// CERTIFICATES & REVIEWS
// ==============================================================================
export async function issueCertificate(certData) {
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      id: certData.id,
      student_id: certData.studentId,
      student_name: certData.studentName,
      course_name: certData.courseName,
      issued_at: certData.issuedAt || new Date().toISOString(),
      certificate_id: certData.certificateId,
      is_issued: certData.isIssued !== false,
      is_revoked: Boolean(certData.isRevoked),
      institute_name: certData.instituteName || '',
      signatory_name: certData.signatoryName || '',
      signatory_title: certData.signatoryTitle || '',
      cert_title: certData.certTitle || '',
      pdf_url: certData.pdfUrl || null
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to issue certificate');
  return data;
}

export async function revokeCertificate(certId) {
  const { data, error } = await supabase
    .from('certificates')
    .update({ is_revoked: true })
    .eq('id', certId)
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to revoke certificate');
  return data;
}

// ==============================================================================
// BATCH ARCHIVAL & CLEANUP
// ==============================================================================
export async function addCompletedBatch(completedBatchData) {
  const { data, error } = await supabase
    .from('completed_batches')
    .insert({
      id: completedBatchData.id || `cb-${Date.now()}`,
      original_batch_id: completedBatchData.originalBatchId || completedBatchData.original_batch_id,
      name: completedBatchData.name,
      description: completedBatchData.description || '',
      start_date: completedBatchData.startDate || completedBatchData.start_date || null,
      end_date: completedBatchData.endDate || completedBatchData.end_date || null,
      completed_at: completedBatchData.completedAt || completedBatchData.completed_at || new Date().toISOString(),
      student_ids: completedBatchData.studentIds || completedBatchData.student_ids || [],
      test_ids: completedBatchData.testIds || completedBatchData.test_ids || [],
      assignment_ids: completedBatchData.assignmentIds || completedBatchData.assignment_ids || [],
      snapshot: completedBatchData.snapshot || null
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to save completed batch');
  return data;
}

export async function deleteBatchCleanup(batchId) {
  // 1. Storage files cleanup
  try {
    const { data: files } = await supabase.storage.from('submissions').list(batchId);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${batchId}/${f.name}`);
      await supabase.storage.from('submissions').remove(paths);
    }
  } catch (storageErr) {
    console.warn('[Cleanup] Storage purge error:', storageErr);
  }

  // 2. Delete submissions for this batch
  await supabase.from('submissions').delete().eq('batch_id', batchId);

  // 3. Delete test attempts for this batch
  await supabase.from('test_attempts').delete().eq('batch_id', batchId);

  // 4. Delete batch-tests links
  await supabase.from('batch_tests').delete().eq('batch_id', batchId);

  // 5. Delete batch-courses links
  await supabase.from('batch_courses').delete().eq('batch_id', batchId);

  // 6. Delete assignments and batch_assignments for this batch
  await supabase.from('batch_assignments').delete().eq('batch_id', batchId);
  await supabase.from('assignments').delete().eq('batch_id', batchId);

  // 6.5 Unassign students from this batch
  await supabase.from('students').update({ batch_id: null }).eq('batch_id', batchId);

  // 7. Delete the batch record itself
  const { error } = await supabase.from('batches').delete().eq('id', batchId);
  if (error) handleSupabaseError(error, 'Failed to delete batch during cleanup');

  return true;
}

// ==============================================================================
// SUBMISSIONS & ASSIGNMENTS
// ==============================================================================
export async function addSubmission(submissionData) {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      id: submissionData.id,
      student_id: submissionData.studentId,
      assignment_id: submissionData.assignmentId,
      batch_id: submissionData.batchId || null,
      file_urls: submissionData.fileUrls || [],
      notes: submissionData.notes || '',
      submitted_at: submissionData.submittedAt || new Date().toISOString(),
      grade: submissionData.grade !== undefined ? submissionData.grade : null,
      feedback: submissionData.feedback || null
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to add submission');
  return data;
}

export async function gradeSubmission(submissionId, grade, feedback) {
  const { data, error } = await supabase
    .from('submissions')
    .update({ grade: Number(grade), feedback })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to grade submission');
  return data;
}

export async function addAssignment(assignmentData) {
  const assignmentId = assignmentData.id || genUUID();
  const insertPayload = {
    id: assignmentId,
    title: assignmentData.title,
    description: assignmentData.description || '',
    deadline: assignmentData.deadline || null,
    max_marks: Number(assignmentData.maxMarks || assignmentData.max_marks || 100),
    type: assignmentData.type || 'PROJECT'
  };

  const { data, error } = await supabase
    .from('assignments')
    .insert(insertPayload)
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to add assignment');

  const batchIds = Array.isArray(assignmentData.batchIds) ? assignmentData.batchIds : [];
  if (batchIds.length > 0) {
    const rows = batchIds.map((bId) => ({ batch_id: bId, assignment_id: assignmentId }));
    const { error: baError } = await supabase.from('batch_assignments').insert(rows);
    if (baError) console.error('[supabaseDataService] batch_assignments insert note:', baError.message);
  }

  return { ...insertPayload, batchIds };
}

export async function deleteAssignment(assignmentId) {
  // 1. Delete associated student submissions to avoid stale submission records
  await supabase.from('submissions').delete().eq('assignment_id', assignmentId);
  // 2. Delete junction links in batch_assignments
  await supabase.from('batch_assignments').delete().eq('assignment_id', assignmentId);
  // 3. Delete the assignment record itself
  const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);
  if (error) handleSupabaseError(error, 'Failed to delete assignment');
  return true;
}

export async function attachAssignmentToBatch(assignmentId, batchId) {
  const { error } = await supabase
    .from('batch_assignments')
    .upsert({ batch_id: batchId, assignment_id: assignmentId }, { onConflict: 'batch_id,assignment_id' });
  if (error) handleSupabaseError(error, 'Failed to attach assignment to batch');
  return true;
}

export async function detachAssignmentFromBatch(assignmentId, batchId) {
  const { error } = await supabase
    .from('batch_assignments')
    .delete()
    .eq('batch_id', batchId)
    .eq('assignment_id', assignmentId);
  if (error) handleSupabaseError(error, 'Failed to detach assignment from batch');
  return true;
}

export async function addEnrollment(enrollmentData) {
  const enrollmentId = enrollmentData.id || genUUID();
  const insertPayload = {
    id: enrollmentId,
    student_id: enrollmentData.studentId,
    course_id: enrollmentData.courseId,
    coupon_id: enrollmentData.couponId || null,
    status: enrollmentData.status || 'PENDING',
    amount: Number(enrollmentData.amount || 0),
    discount_applied: Number(enrollmentData.discountApplied || 0),
    enrolled_at: enrollmentData.enrolledAt || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('enrollments')
    .insert(insertPayload)
    .select()
    .single();

  if (error) handleSupabaseError(error, 'Failed to add enrollment');
  return data;
}

// ==============================================================================
// CODING ARENA & ATTEMPTS
// ==============================================================================
export async function addCodingAttempt(attemptData) {
  if (!checkConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('coding_attempts')
      .insert({
        id: attemptData.id,
        student_id: attemptData.studentId,
        problem_id: attemptData.problemId,
        code: attemptData.code || '',
        passed: Boolean(attemptData.passed),
        xp_earned: Number(attemptData.xpEarned || 0),
        visible_results: attemptData.visibleResults || [],
        hidden_results_summary: attemptData.hiddenResultsSummary || {},
        attempted_at: attemptData.attemptedAt || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('[SupabaseDataService] coding_attempts table sync deferred:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[SupabaseDataService] Could not sync coding attempt to Supabase:', err.message);
    return null;
  }
}

export async function saveCodingProblem(problemData) {
  if (!checkConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('coding_problems')
      .upsert({
        id: problemData.id,
        title: problemData.title,
        description: problemData.description || '',
        difficulty: problemData.difficulty || 'Easy',
        category: problemData.category || 'Lists',
        order_index: Number(problemData.orderIndex || 1),
        xp: Number(problemData.xp || 50),
        hints: problemData.hints || [],
        starter_code: problemData.starterCode || '',
        test_cases: problemData.testCases || [],
        hidden_test_cases: problemData.hiddenTestCases || []
      })
      .select()
      .single();

    if (error) {
      console.warn('[SupabaseDataService] coding_problems table sync deferred:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[SupabaseDataService] Could not sync coding problem to Supabase:', err.message);
    return null;
  }
}

export async function deleteCodingProblemSupabase(problemId) {
  if (!checkConfigured()) return null;
  try {
    const { error } = await supabase.from('coding_problems').delete().eq('id', problemId);
    if (error) console.warn('[SupabaseDataService] Delete coding problem from Supabase deferred:', error.message);
    return true;
  } catch (err) {
    console.warn('[SupabaseDataService] Could not delete coding problem from Supabase:', err.message);
    return null;
  }
}

// ==============================================================================
// FULL DATABASE EXPORT & RESTORE (ALL SUPABASE TABLES)
// ==============================================================================
export async function exportAllDatabaseData() {
  const result = {
    exportedAt: new Date().toISOString(),
    engine: 'supabase',
    tables: {}
  };

  if (!checkConfigured()) {
    return result;
  }

  const tableList = [
    'users',
    'students',
    'categories',
    'courses',
    'course_modules',
    'course_topics',
    'batches',
    'batch_courses',
    'batch_tests',
    'enrollments',
    'coupons',
    'payments',
    'fees',
    'tests',
    'test_questions',
    'test_attempts',
    'assignments',
    'batch_assignments',
    'submissions',
    'certificates',
    'certificate_templates',
    'completed_batches',
    'problem_attempts',
    'coding_problems',
    'coding_attempts',
    'error_logs'
  ];

  await Promise.all(
    tableList.map(async (tableName) => {
      try {
        const { data, error } = await supabase.from(tableName).select('*');
        if (!error && Array.isArray(data)) {
          result.tables[tableName] = data;
        } else {
          result.tables[tableName] = [];
        }
      } catch (err) {
        console.warn(`[SupabaseDataService] Table ${tableName} export deferred:`, err.message);
        result.tables[tableName] = [];
      }
    })
  );

  return result;
}

export async function importAllDatabaseData(tablesPayload) {
  if (!checkConfigured()) {
    console.warn('[SupabaseDataService] Supabase not configured; skipping remote upsert');
    return { success: true, restoredCount: 0, offline: true };
  }

  if (!tablesPayload || typeof tablesPayload !== 'object') {
    throw new Error('Invalid tables payload for import');
  }

  const summary = { success: true, tableCounts: {} };

  // Tables in dependency order
  const order = [
    'categories',
    'users',
    'batches',
    'students',
    'courses',
    'course_modules',
    'course_topics',
    'batch_courses',
    'enrollments',
    'coupons',
    'payments',
    'fees',
    'tests',
    'test_questions',
    'batch_tests',
    'test_attempts',
    'assignments',
    'batch_assignments',
    'submissions',
    'certificates',
    'certificate_templates',
    'completed_batches',
    'problem_attempts',
    'coding_problems',
    'coding_attempts',
    'error_logs'
  ];

  for (const tableName of order) {
    const records = tablesPayload[tableName];
    if (Array.isArray(records) && records.length > 0) {
      try {
        // Sanitize records for specific tables (e.g. students UUID)
        const sanitized = records.map((rec) => {
          if (tableName === 'students') {
            const hasUUID = isValidUUID(rec.id);
            return {
              ...rec,
              id: hasUUID ? rec.id : genUUID(),
              legacy_id: rec.legacy_id || (!hasUUID ? rec.id : null),
              batch_id: isValidUUID(rec.batch_id) ? rec.batch_id : null
            };
          }
          return rec;
        });

        const { error } = await supabase.from(tableName).upsert(sanitized);
        if (error) {
          console.warn(`[SupabaseDataService] Import upsert for ${tableName} had issue:`, error.message);
        } else {
          summary.tableCounts[tableName] = sanitized.length;
        }
      } catch (err) {
        console.warn(`[SupabaseDataService] Import for ${tableName} skipped:`, err.message);
      }
    }
  }

  return summary;
}


