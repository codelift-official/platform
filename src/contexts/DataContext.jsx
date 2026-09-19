import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import * as supabaseDataService from '../services/supabaseDataService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

// Seed Fallbacks for seamless offline/initial hydration
import usersSeed from '../../data/users.json';
import studentsSeed from '../../data/students.json';
import categoriesSeed from '../../data/categories.json';
import coursesSeed from '../../data/courses.json';
import enrollmentsSeed from '../../data/enrollments.json';
import couponsSeed from '../../data/coupons.json';
import paymentsSeed from '../../data/payments.json';
import batchesSeed from '../../data/batches.json';
import feesSeed from '../../data/fees.json';
import testsSeed from '../../data/tests.json';
import attemptsSeed from '../../data/attempts.json';
import assignmentsSeed from '../../data/assignments.json';
import submissionsSeed from '../../data/submissions.json';
import certificatesSeed from '../../data/certificates.json';
import certificateTemplatesSeed from '../../data/certificateTemplates.json';
import completedBatchesSeed from '../../data/completedBatches.json';
import problemAttemptsSeed from '../../data/problemAttempts.json';
import codingProblemsSeed from '../../data/codingProblems.json';
import codingAttemptsSeed from '../../data/codingAttempts.json';
import { SEED_PROBLEMS } from '../data/problemsSeed';

// Unified Code Arena problems seed with complete challenge set
export const unifiedCodingProblemsSeed = (SEED_PROBLEMS || []).map((p, idx) => ({
  id: p.id,
  title: p.title,
  category: p.category || 'Python',
  difficulty: p.difficulty || 'Easy',
  orderIndex: idx + 1,
  xp: p.xp || 50,
  description: p.description || '',
  starterCode: p.starterCode || '',
  hints: Array.isArray(p.hints) ? p.hints : [],
  testCases: Array.isArray(p.testCases) ? p.testCases : [],
  hiddenTestCases: Array.isArray(p.hiddenTestCases) ? p.hiddenTestCases : []
}));

const DataContext = createContext(null);

function isValidUUID(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function genUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function genId(prefix = '') {
  const p = prefix ? `${prefix}-` : '';
  return `${p}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_PLATFORM_SETTINGS = {
  revenueSplit: 100,
  paymentInstructions: 'UPI: codelift@upi | Bank Transfer: HDFC Bank A/C 98765432101, IFSC: HDFC0001234',
  instituteName: 'CodeLift Engineering Academy',
  signatoryName: 'Ashish Kumar',
  signatoryTitle: 'Director of Academic Affairs',
  featureFlags: {
    marketplaceEnabled: true,
    problemSolvingEnabled: true,
    autoCertificates: false
  }
};

function normalizeCourse(c) {
  if (!c) return c;
  const courseId = c.id || c.slug;
  const modules = (c.modules || []).map((m) => {
    const quizQuestions = Array.isArray(m.quizQuestions) ? m.quizQuestions : [];
    const topics = (m.topics || []).map((t) => ({
      ...t,
      quizQuestions: Array.isArray(t.quizQuestions) ? t.quizQuestions : []
    }));
    if (quizQuestions.length > 0 && topics.length > 0 && !topics.some((t) => t.quizQuestions.length > 0)) {
      topics[topics.length - 1].quizQuestions = quizQuestions;
    }
    return {
      ...m,
      topics,
      quizQuestions
    };
  });
  return {
    ...c,
    id: courseId,
    modules
  };
}

export function DataProvider({ children }) {
  // Collections State initialized with local seeds for instant render
  const [users, setUsers] = useState(usersSeed);
  const [students, setStudents] = useState(() => (isSupabaseConfigured ? [] : (studentsSeed || [])));
  const [isHydrated, setIsHydrated] = useState(!isSupabaseConfigured);
  // NOTE: passwordResetRequests is derived on-the-fly from students (reset_requested flag on Supabase).
  // No useState needed here — see the derived const below in this component.

  const [categories, setCategories] = useState(() => (isSupabaseConfigured ? [] : (categoriesSeed || [])));
  const [courses, setCourses] = useState(() => (isSupabaseConfigured ? [] : (coursesSeed || []).map(normalizeCourse)));
  const [enrollments, setEnrollments] = useState(() => (isSupabaseConfigured ? [] : (enrollmentsSeed || [])));
  const [coupons, setCoupons] = useState(() => (isSupabaseConfigured ? [] : (couponsSeed || [])));
  const [payments, setPayments] = useState(() => (isSupabaseConfigured ? [] : (paymentsSeed || [])));
  const [batches, setBatches] = useState(() => (isSupabaseConfigured ? [] : (batchesSeed || [])));
  const [fees, setFees] = useState(() => (isSupabaseConfigured ? [] : (feesSeed || [])));
  const [tests, setTests] = useState(() => (isSupabaseConfigured ? [] : (testsSeed || [])));
  const [testAttempts, setTestAttempts] = useState(() => (isSupabaseConfigured ? [] : (attemptsSeed || [])));
  const [assignments, setAssignments] = useState(() => (isSupabaseConfigured ? [] : (assignmentsSeed || [])));
  const [submissions, setSubmissions] = useState(() => (isSupabaseConfigured ? [] : (submissionsSeed || [])));
  const [certificates, setCertificates] = useState(() => (isSupabaseConfigured ? [] : (certificatesSeed || [])));
  const [certificateTemplates, setCertificateTemplates] = useState(() => (isSupabaseConfigured ? [] : (certificateTemplatesSeed || [])));
  const [completedBatches, setCompletedBatches] = useState(() => (isSupabaseConfigured ? [] : (completedBatchesSeed || [])));
  const [problemAttempts, setProblemAttempts] = useState(() => (isSupabaseConfigured ? [] : (problemAttemptsSeed || [])));
  const [codingProblems, setCodingProblems] = useState(() => {
    try {
      const cached = localStorage.getItem('codelift_coding_problems');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some(p => p.id?.startsWith('prob-'))) return parsed;
      }
    } catch (_) {}
    return unifiedCodingProblemsSeed || [];
  });
  const [codingAttempts, setCodingAttempts] = useState(() => {
    try {
      const cached = localStorage.getItem('codelift_coding_attempts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) { }
    return codingAttemptsSeed;
  });
  const [platformSettings, setPlatformSettings] = useState(DEFAULT_PLATFORM_SETTINGS);

  // Active in-flight mutation counter to prevent stale background hydration race conditions
  const activeMutationsRef = useRef(0);

  // Note: passwordResetRequests is derived on-the-fly from students.filter(s => s.reset_requested)
  // No localStorage persistence needed — Supabase is the single source of truth for the flag.

  const syncFromSupabase = useCallback(async () => {
    // If there is an active delete or detach mutation in flight, do not fetch stale DB state
    if (activeMutationsRef.current > 0) {
      return;
    }
    try {
      const data = await supabaseDataService.fetchAllData();
      if (activeMutationsRef.current > 0) {
        return;
      }

      if (data.users?.length) setUsers(data.users);
      if (Array.isArray(data.students)) {
        const hydratedStudents = data.students.map((s) => {
          let cachedProgress = {};
          let cachedQuizzes = {};
          try {
            const rawP = localStorage.getItem(`codelift_student_progress_${s.id}`) ||
              (s.legacyId ? localStorage.getItem(`codelift_student_progress_${s.legacyId}`) : null);
            if (rawP) cachedProgress = JSON.parse(rawP);
          } catch (_) {}
          try {
            const rawQ = localStorage.getItem(`codelift_student_quizzes_${s.id}`) ||
              (s.legacyId ? localStorage.getItem(`codelift_student_quizzes_${s.legacyId}`) : null);
            if (rawQ) cachedQuizzes = JSON.parse(rawQ);
          } catch (_) {}

          return {
            ...s,
            progress: { ...(s.progress || {}), ...cachedProgress },
            quizAttempts: { ...(s.quiz_attempts || s.quizAttempts || {}), ...cachedQuizzes }
          };
        });
        setStudents(hydratedStudents);
      }
      if (data.categories?.length) setCategories(data.categories);
      if (data.courses?.length) setCourses(data.courses.map(normalizeCourse));
      if (data.enrollments?.length) setEnrollments(data.enrollments);
      if (data.coupons?.length) setCoupons(data.coupons);
      if (data.payments?.length) setPayments(data.payments);
      if (data.batches?.length) setBatches(data.batches);
      if (data.fees?.length) setFees(data.fees);
      if (data.tests?.length) setTests(data.tests);
      if (data.testAttempts?.length) setTestAttempts(data.testAttempts);
      if (data.assignments?.length) setAssignments(data.assignments);
      if (data.submissions?.length) setSubmissions(data.submissions);
      if (data.certificates?.length) setCertificates(data.certificates);
      if (data.certificateTemplates?.length) setCertificateTemplates(data.certificateTemplates);
      if (data.completedBatches?.length) setCompletedBatches(data.completedBatches);
      if (data.problemAttempts?.length) setProblemAttempts(data.problemAttempts);
      if (data.codingProblems?.length) {
        const seedMap = new Map((unifiedCodingProblemsSeed || []).map((p) => [p.id, p]));
        const merged = [...(unifiedCodingProblemsSeed || [])];
        data.codingProblems.forEach((dp) => {
          if (!seedMap.has(dp.id) && !dp.id?.startsWith('arena-q') && (!dp.category || dp.category === 'Python')) {
            merged.push({ ...dp, category: 'Python' });
          }
        });
        setCodingProblems(merged);
        try {
          localStorage.setItem('codelift_coding_problems', JSON.stringify(merged));
        } catch (_) {}
      } else {
        setCodingProblems(unifiedCodingProblemsSeed);
      }
      if (data.codingAttempts?.length) {
        setCodingAttempts((prev) => {
          const merged = [...data.codingAttempts];
          (prev || []).forEach((pa) => {
            if (!merged.some((m) => m.id === pa.id)) merged.push(pa);
          });
          try {
            localStorage.setItem('codelift_coding_attempts', JSON.stringify(merged));
          } catch (_) { }
          return merged;
        });
      }
    } catch (err) {
      console.warn('[DataContext] Background fetch from Supabase deferred:', err.message);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Hydrate all collections from Supabase on mount, window focus, and auth state change
  useEffect(() => {
    let isMounted = true;

    syncFromSupabase();

    const onFocus = () => {
      if (isMounted) syncFromSupabase();
    };
    window.addEventListener('focus', onFocus);

    let authSubscription;
    if (isSupabaseConfigured && supabase?.auth?.onAuthStateChange) {
      try {
        const { data: authData } = supabase.auth.onAuthStateChange(() => {
          if (isMounted) syncFromSupabase();
        });
        authSubscription = authData?.subscription;
      } catch (e) { }
    }

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onFocus);
      authSubscription?.unsubscribe?.();
    };
  }, [syncFromSupabase]);

  // ── USER MANAGEMENT ──────────────────────────────────────────────────────────
  const addUser = (userData) => {
    const newUser = { id: genId(), joinedAt: new Date().toISOString(), isActive: true, ...userData };
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (userId, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  };

  // ── STUDENT MANAGEMENT (Fully backed by Supabase) ───────────────────────────
  const addStudent = async (studentData) => {
    const assignedId = studentData.id && isValidUUID(studentData.id) ? studentData.id : genUUID();
    const legacyId = studentData.legacyId || (studentData.id && !isValidUUID(studentData.id) ? studentData.id : undefined);
    const newStudent = {
      isActive: true,
      isGraduated: false,
      completedBatchIds: [],
      progress: {},
      enrolledDate: new Date().toISOString().split('T')[0],
      paidFee: 0,
      feeStatus: 'Pending',
      baseFee: 0,
      concessionAmount: 0,
      concessionReason: '',
      ...studentData,
      id: assignedId,
      ...(legacyId ? { legacyId } : {})
    };
    setStudents((prev) => [newStudent, ...prev]);

    try {
      const created = await supabaseDataService.addStudent(newStudent);
      const finalized = created && created.id ? {
        ...newStudent,
        ...created,
        id: created.id,
        batchId: created.batch_id !== undefined ? (created.batch_id || '') : newStudent.batchId,
        totalFee: created.total_fee !== undefined ? Number(created.total_fee) : newStudent.totalFee,
        paidFee: created.paid_fee !== undefined ? Number(created.paid_fee) : newStudent.paidFee,
        feeStatus: created.fee_status || newStudent.feeStatus,
        baseFee: created.base_fee !== undefined ? Number(created.base_fee) : (newStudent.baseFee || 0),
        concessionAmount: created.concession_amount !== undefined ? Number(created.concession_amount) : (newStudent.concessionAmount || 0),
        concessionReason: created.concession_reason !== undefined ? created.concession_reason : (newStudent.concessionReason || '')
      } : newStudent;

      if (studentData.password && studentData.password !== 'codelift123' && studentData.password !== 'password') {
        // Ensure auth.users stays in sync for newly created custom passwords (live server call)
        if (supabaseDataService.setStudentPasswordRPC) {
          supabaseDataService.setStudentPasswordRPC(finalized.email || finalized.id || assignedId, studentData.password).catch(() => {});
        }
      }

      setStudents((prev) => prev.map((s) => s.id === assignedId ? finalized : s));
      return finalized;
    } catch (e) {
      console.error('[DataContext] addStudent failed on Supabase:', e);
      setStudents((prev) => prev.filter((s) => s.id !== assignedId));
      throw e;
    }
  };

  const updateStudent = async (studentId, updates) => {
    if (updates.batchId !== undefined || updates.batch_id !== undefined) {
      try {
        localStorage.removeItem(`codelift_student_progress_${studentId}`);
        localStorage.removeItem(`codelift_student_quizzes_${studentId}`);
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('codelift_last_topic_')) {
            localStorage.removeItem(k);
          }
        });
      } catch (_) { }
    }

    if (updates.password !== undefined) {
      // Live sync of the password to auth.users + progress->__auth_pwd through the single set_student_password RPC
      if (supabaseDataService.setStudentPasswordRPC) {
        const passwordStudent = students.find((s) => s.id === studentId || s.legacyId === studentId);
        supabaseDataService.setStudentPasswordRPC(passwordStudent?.email || studentId, updates.password).catch(() => {});
      }
    }

    const student = students.find((s) => s.id === studentId || s.legacyId === studentId);
    const enrichedUpdates = { ...updates };
    if (!enrichedUpdates.email && student?.email) {
      enrichedUpdates.email = student.email;
    }
    if (enrichedUpdates.password !== undefined) {
      enrichedUpdates.progress = {
        ...(student?.progress || {}),
        ...(enrichedUpdates.progress || {}),
        __auth_pwd: enrichedUpdates.password
      };
    }

    setStudents((prev) => prev.map((s) => (s.id === studentId || s.legacyId === studentId ? { ...s, ...enrichedUpdates } : s)));
    try {
      await supabaseDataService.updateStudent(studentId, enrichedUpdates);
    } catch (e) {
      console.error('[DataContext] updateStudent failed on Supabase:', e);
      throw e;
    }
  };

  const toggleStudentActive = (studentId) => {
    const current = students.find((s) => s.id === studentId || s.legacyId === studentId);
    const nextActive = current ? !(current.isActive !== false) : true;
    updateStudent(studentId, {
      isActive: nextActive,
      status: nextActive ? 'ACTIVE' : 'SUSPENDED'
    });
  };

  const deleteStudent = async (studentId) => {
    activeMutationsRef.current += 1;
    setStudents((prev) => prev.filter((s) => s.id !== studentId && s.legacyId !== studentId));
    try {
      await supabaseDataService.deleteStudent(studentId);
    } catch (e) {
      console.error('[DataContext] deleteStudent failed on Supabase:', e);
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  // ── PASSWORD RESET FLAG MANAGEMENT (Supabase-backed, zero extra tables) ──────
  // Derive password reset requests dynamically from the students list
  const passwordResetRequests = students
    .filter((s) => s.reset_requested)
    .map((s) => ({
      id: s.id,
      ticketId: `PWD-${s.id.slice(-5).toUpperCase()}`,
      studentId: s.id,
      studentEmail: s.email,
      studentName: s.name,
      studentPhone: s.phone || '',
      status: 'PENDING',
      createdAt: s.updatedAt || s.createdAt || new Date().toISOString()
    }));

  /**
   * Student raises a forgot-password request.
   * Sets reset_requested = true on the student record in Supabase.
   * Returns a ticket-like object for UI display.
   */
  const createPasswordResetRequest = ({ studentEmail }) => {
    const emailLower = (studentEmail || '').trim().toLowerCase();
    const matched = students.find((s) => (s.email || '').toLowerCase() === emailLower);

    if (!matched) {
      // Email not found — still return a ticket but no DB write
      return {
        ticketId: `PWD-NOTFOUND`,
        studentEmail: emailLower,
        studentName: 'Unknown Student',
        notFound: true
      };
    }

    // Optimistically update local state
    updateStudent(matched.id, { reset_requested: true });

    return {
      ticketId: `PWD-${matched.id.slice(-5).toUpperCase()}`,
      studentId: matched.id,
      studentEmail: emailLower,
      studentName: matched.name,
      studentPhone: matched.phone || ''
    };
  };

  /**
   * Admin resolves the request: resets password + clears the flag.
   */
  const resolvePasswordResetRequest = (studentId, defaultPassword = 'codelift123') => {
    updateStudent(studentId, {
      password: defaultPassword,
      reset_requested: false,
      isActive: true,
      status: 'ACTIVE'
    });
  };

  /**
   * Admin dismisses the request without resetting password.
   */
  const dismissPasswordResetRequest = (studentId) => {
    updateStudent(studentId, { reset_requested: false });
  };



  // ── BATCH MANAGEMENT ────────────────────────────────────────────────────────
  const addBatch = (batchData) => {
    const newBatch = {
      id: batchData.id || genId('batch'),
      isActive: true,
      isCompleted: false,
      completedAt: null,
      archivedStudents: [],
      courseIds: [],
      testIds: [],
      ...batchData
    };
    setBatches((prev) => [newBatch, ...prev]);
    supabaseDataService.addBatch(newBatch).catch((e) => console.error('[DataContext] addBatch failed:', e));
    return newBatch;
  };

  const updateBatch = (batchId, updates) => {
    setBatches((prev) => prev.map((b) => (b.id === batchId ? { ...b, ...updates } : b)));
    supabaseDataService.updateBatch(batchId, updates).catch((e) => console.error('[DataContext] updateBatch failed:', e));
  };

  const toggleBatchActive = (batchId) => {
    const target = batches.find((b) => b.id === batchId);
    if (!target) return;
    const newActiveState = !target.isActive;
    updateBatch(batchId, { isActive: newActiveState });
    toast.success(`Batch ${newActiveState ? 'activated' : 'archived'} successfully.`);
  };

  const deleteBatch = async (batchId) => {
    activeMutationsRef.current += 1;
    // 1. Remove batch from batches list
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    // 2. Unassign students in local state
    setStudents((prev) =>
      prev.map((s) => (s.batchId === batchId ? { ...s, batchId: '' } : s))
    );
    // 3. Detach courses in local state
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        batchId: c.batchId === batchId ? null : c.batchId,
        batchIds: Array.isArray(c.batchIds) ? c.batchIds.filter((id) => id !== batchId) : []
      }))
    );
    // 4. Detach tests in local state
    setTests((prev) =>
      prev.map((t) => ({
        ...t,
        assignedBatchIds: Array.isArray(t.assignedBatchIds) ? t.assignedBatchIds.filter((id) => id !== batchId) : []
      }))
    );
    // 5. Detach assignments in local state
    setAssignments((prev) =>
      prev.map((a) => ({
        ...a,
        batchIds: Array.isArray(a.batchIds) ? a.batchIds.filter((id) => id !== batchId) : []
      }))
    );

    try {
      await supabaseDataService.deleteBatch(batchId);
    } catch (e) {
      console.error('[DataContext] deleteBatch failed:', e);
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  const completeBatch = async (batchId) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return null;

    const batchStudents = students.filter((s) => s.batchId === batchId);
    const batchCourses = courses.filter((c) => Array.isArray(c.batchIds) && c.batchIds.includes(batchId));
    const batchTests = tests.filter((t) => Array.isArray(t.assignedBatchIds) && t.assignedBatchIds.includes(batchId));
    const batchAssignments = assignments.filter((a) => Array.isArray(a.batchIds) && a.batchIds.includes(batchId));
    const batchSubmissions = submissions.filter((sub) => sub.batchId === batchId);
    const batchTestAttempts = testAttempts.filter((ta) => ta.batchId === batchId);

    const completedRecord = {
      id: genId('cb'),
      originalBatchId: batchId,
      name: batch.name,
      description: batch.description || '',
      startDate: batch.startDate || null,
      endDate: batch.endDate || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      studentIds: batchStudents.map((s) => s.id),
      testIds: batchTests.map((t) => t.id),
      assignmentIds: batchAssignments.map((a) => a.id),
      snapshot: {
        batch: { ...batch },
        students: batchStudents.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          enrolledDate: s.enrolledDate,
          totalFee: s.totalFee,
          paidFee: s.paidFee,
          feeStatus: s.feeStatus,
          isGraduated: true,
          progress: s.progress || {}
        })),
        courses: batchCourses.map((c) => ({ id: c.id, title: c.title })),
        tests: batchTests.map((t) => ({
          id: t.id,
          title: t.title,
          attemptsCount: batchTestAttempts.filter((ta) => ta.testId === t.id).length
        })),
        assignments: batchAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          submissionsCount: batchSubmissions.filter((sub) => sub.assignmentId === a.id).length
        })),
        stats: {
          totalStudents: batchStudents.length,
          graduatedStudents: batchStudents.length,
          totalTests: batchTests.length,
          totalAssignments: batchAssignments.length,
          totalSubmissions: batchSubmissions.length,
          totalRevenue: batchStudents.reduce((sum, s) => sum + (Number(s.paidFee) || 0), 0)
        }
      }
    };

    setCompletedBatches((prev) => [completedRecord, ...prev]);
    try {
      await supabaseDataService.addCompletedBatch(completedRecord);
    } catch (e) {
      console.error('[DataContext] addCompletedBatch error:', e);
    }

    // Update batch status to completed
    updateBatch(batchId, { isCompleted: true, isActive: false, completedAt: new Date().toISOString() });

    // Mark enrolled students as graduated while preserving their progress
    batchStudents.forEach((s) => {
      updateStudent(s.id, {
        isGraduated: true,
        completedBatchIds: Array.from(new Set([...(s.completedBatchIds || []), batchId]))
      });
    });

    return completedRecord;
  };

  const cleanupBatch = async (batchId) => {
    try {
      await supabaseDataService.deleteBatchCleanup(batchId);
    } catch (e) {
      console.error('[DataContext] deleteBatchCleanup error:', e);
    }

    // Update local state: remove batch activity, preserve students & progress
    setSubmissions((prev) => prev.filter((s) => s.batchId !== batchId));
    setTestAttempts((prev) => prev.filter((t) => t.batchId !== batchId));
    setAssignments((prev) => prev.filter((a) => !a.batchIds?.includes(batchId)));
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  };

  // ── COURSE & MARKETPLACE MANAGEMENT ─────────────────────────────────────────
  const addCourse = async (courseData) => {
    let resolvedCategoryId = courseData.categoryId || 'cat-web';
    if (categories && categories.length > 0 && !categories.some((cat) => cat.id === resolvedCategoryId)) {
      resolvedCategoryId = categories.find((c) => c.id === 'cat-web')?.id || categories[0]?.id || null;
    }

    const newCourse = {
      id: courseData.id || genId('course'),
      slug: courseData.title ? courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `course-${Date.now()}`,
      rating: 5.0,
      numReviews: 0,
      studentsEnrolled: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
      isApproved: true,
      modules: [],
      ...courseData,
      categoryId: resolvedCategoryId
    };
    setCourses((prev) => [newCourse, ...prev]);
    try {
      await supabaseDataService.addCourse(newCourse);
    } catch (e) {
      console.error('[DataContext] addCourse failed:', e);
      setCourses((prev) => prev.filter((c) => c.id !== newCourse.id));
      throw e;
    }
    return newCourse;
  };

  const updateCourse = async (courseId, updates) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    try {
      await supabaseDataService.updateCourse(courseId, updates);
    } catch (e) {
      console.error('[DataContext] updateCourse failed:', e);
      throw e;
    }
  };

  const deleteCourse = async (courseId) => {
    activeMutationsRef.current += 1;
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    try {
      await supabaseDataService.deleteCourse(courseId);
    } catch (e) {
      console.error('[DataContext] deleteCourse failed:', e);
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  const addCategory = async (categoryData) => {
    const slug = (categoryData.slug || categoryData.name || 'cat')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newCategory = {
      id: categoryData.id || `cat-${slug}`,
      name: categoryData.name,
      slug,
      description: categoryData.description || '',
      icon: categoryData.icon || 'FaCode',
      createdAt: new Date().toISOString(),
      ...categoryData
    };
    setCategories((prev) => [...prev, newCategory]);
    try {
      await supabaseDataService.addCategory(newCategory);
    } catch (e) {
      console.error('[DataContext] addCategory failed:', e);
      setCategories((prev) => prev.filter((c) => c.id !== newCategory.id));
      throw e;
    }
    return newCategory;
  };

  // ── ENTITY ASSOCIATION MANAGERS (SYNCHRONIZED) ──────────────────────────────
  const attachCourseToBatch = (courseId, batchId) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          const courseIds = Array.isArray(b.courseIds) ? b.courseIds : [];
          return { ...b, courseIds: Array.from(new Set([...courseIds, courseId])) };
        }
        return b;
      })
    );
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const batchIds = Array.isArray(c.batchIds) ? c.batchIds : (c.batchId ? [c.batchId] : []);
          return {
            ...c,
            batchIds: Array.from(new Set([...batchIds, batchId])),
            batchId: c.batchId || batchId,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
    supabaseDataService
      .attachCourseToBatch(courseId, batchId)
      .catch((e) => console.error('[DataContext] attachCourseToBatch failed:', e));
  };

  const detachCourseFromBatch = async (courseId, batchId) => {
    activeMutationsRef.current += 1;
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          const courseIds = Array.isArray(b.courseIds) ? b.courseIds : [];
          return { ...b, courseIds: courseIds.filter((id) => id !== courseId) };
        }
        return b;
      })
    );
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const batchIds = (Array.isArray(c.batchIds) ? c.batchIds : (c.batchId ? [c.batchId] : [])).filter((id) => id !== batchId);
          const newPrimaryBatchId = c.batchId === batchId ? (batchIds[0] || null) : c.batchId;
          return {
            ...c,
            batchIds,
            batchId: newPrimaryBatchId,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
    try {
      await supabaseDataService
      .detachCourseFromBatch(courseId, batchId);
    } catch (e) {
      console.error('[DataContext] detachCourseFromBatch failed:', e);
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  const assignTestToBatch = (testId, batchId) => {
    setTests((prev) =>
      prev.map((t) => {
        if (t.id === testId) {
          const assigned = Array.isArray(t.assignedBatchIds) ? t.assignedBatchIds : (Array.isArray(t.batchIds) ? t.batchIds : []);
          const updated = Array.from(new Set([...assigned, batchId]));
          return { ...t, assignedBatchIds: updated, batchIds: updated };
        }
        return t;
      })
    );
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          const testIds = Array.isArray(b.testIds) ? b.testIds : [];
          return { ...b, testIds: Array.from(new Set([...testIds, testId])) };
        }
        return b;
      })
    );
    supabaseDataService.attachTestToBatch(testId, batchId).catch((e) => console.error('[DataContext] attachTestToBatch failed:', e));
  };

  const unassignTestFromBatch = async (testId, batchId) => {
    activeMutationsRef.current += 1;
    setTests((prev) =>
      prev.map((t) => {
        if (t.id === testId) {
          const assigned = Array.isArray(t.assignedBatchIds) ? t.assignedBatchIds : (Array.isArray(t.batchIds) ? t.batchIds : []);
          const updated = assigned.filter((id) => id !== batchId);
          return { ...t, assignedBatchIds: updated, batchIds: updated };
        }
        return t;
      })
    );
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          const testIds = Array.isArray(b.testIds) ? b.testIds : [];
          return { ...b, testIds: testIds.filter((id) => id !== testId) };
        }
        return b;
      })
    );
    try {
      await supabaseDataService.detachTestFromBatch(testId, batchId);
    } catch (e) {
      console.error('[DataContext] detachTestFromBatch failed:', e);
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  const assignStudentToBatch = async (studentId, batchId) => {
    return await updateStudent(studentId, { batchId });
  };

  const removeStudentFromBatch = async (studentId) => {
    activeMutationsRef.current += 1;
    try {
      await updateStudent(studentId, { batchId: '' });
    } catch (e) {
      console.error('[DataContext] removeStudentFromBatch failed:', e);
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  const createCourseFromJSON = async (jsonPayload, targetCourseId = null) => {
    let data;
    if (typeof jsonPayload === 'string') {
      try {
        data = JSON.parse(jsonPayload);
      } catch (err) {
        throw new Error('Invalid JSON format: ' + err.message);
      }
    } else if (typeof jsonPayload === 'object' && jsonPayload !== null) {
      data = jsonPayload;
    } else {
      throw new Error('Course data must be a valid JSON object');
    }

    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new Error('Course JSON must contain a valid non-empty "title"');
    }

    const existingCourse = targetCourseId
      ? courses.find((c) => c.id === targetCourseId)
      : (data.id
        ? courses.find((c) => c.id === data.id)
        : courses.find((c) => c.title?.trim().toLowerCase() === data.title?.trim().toLowerCase()));

    const baseSlug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let uniqueSlug = existingCourse?.slug || baseSlug || `course-${Date.now()}`;
    if (!existingCourse) {
      let counter = 1;
      while (courses.some((c) => c.slug === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }
    }

    const formattedModules = Array.isArray(data.modules)
      ? data.modules.map((m, mIdx) => ({
        id: m.id || `mod-${Date.now()}-${mIdx}-${Math.random().toString(36).slice(2, 6)}`,
        title: m.title || `Module ${mIdx + 1}`,
        quizQuestions: Array.isArray(m.quizQuestions) ? m.quizQuestions : (Array.isArray(m.quiz_questions) ? m.quiz_questions : []),
        topics: Array.isArray(m.topics)
          ? m.topics.map((t, tIdx) => ({
            id: t.id || `top-${Date.now()}-${mIdx}-${tIdx}-${Math.random().toString(36).slice(2, 6)}`,
            title: t.title || `Topic ${tIdx + 1}`,
            contentMd: t.contentMd || t.content_md || t.content || `# ${t.title || 'Topic'}\n\nContent for this topic.`,
            quizQuestions: Array.isArray(t.quizQuestions) ? t.quizQuestions : (Array.isArray(t.quiz_questions) ? t.quiz_questions : [])
          }))
          : []
      }))
      : [];

    const { id: ignoredOldId, ...restOfData } = data;

    // Resolve categoryId to ensure valid FK in Supabase
    let resolvedCategoryId = data.categoryId || data.category_id || 'cat-web';
    if (categories && categories.length > 0 && !categories.some((cat) => cat.id === resolvedCategoryId)) {
      resolvedCategoryId = categories.find((c) => c.id === 'cat-web')?.id || categories[0]?.id || null;
    }

    const courseType = data.courseType || data.course_type || (data.isCohort ? 'cohort' : 'elective');

    if (existingCourse) {
      const updatedCourse = {
        ...existingCourse,
        ...restOfData,
        title: data.title.trim(),
        description: data.description !== undefined ? data.description : existingCourse.description,
        categoryId: resolvedCategoryId,
        courseType,
        isCohort: courseType === 'cohort',
        modules: formattedModules,
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : existingCourse.isPublished,
        updatedAt: new Date().toISOString()
      };
      setCourses((prev) => prev.map((c) => (c.id === existingCourse.id ? updatedCourse : c)));
      try {
        await supabaseDataService.updateCourse(existingCourse.id, updatedCourse);
      } catch (e) {
        console.error('[DataContext] updateCourse failed during JSON import:', e);
        syncFromSupabase();
        throw e;
      }
      return updatedCourse;
    }

    const newCourse = {
      id: data.id || genId('course'),
      slug: uniqueSlug,
      title: data.title.trim(),
      description: data.description || '',
      categoryId: resolvedCategoryId,
      courseType,
      isCohort: courseType === 'cohort',
      price: typeof data.price === 'number' ? data.price : 0,
      isFree: data.isFree !== undefined ? Boolean(data.isFree) : (!data.price || data.price === 0),
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      isApproved: true,
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
      promoVideo: data.promoVideo || data.promo_video || '',
      rating: typeof data.rating === 'number' ? data.rating : 5.0,
      numReviews: typeof data.numReviews === 'number' ? data.numReviews : 0,
      studentsEnrolled: typeof data.studentsEnrolled === 'number' ? data.studentsEnrolled : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...restOfData,
      modules: formattedModules
    };

    setCourses((prev) => [newCourse, ...prev]);
    try {
      await supabaseDataService.addCourse(newCourse);
    } catch (e) {
      console.error('[DataContext] addCourse failed during JSON import:', e);
      setCourses((prev) => prev.filter((c) => c.id !== newCourse.id));
      throw e;
    }
    return newCourse;
  };

  // ── ENROLLMENTS & PAYMENTS ──────────────────────────────────────────────────
  const enrollCourse = ({ studentId, studentName, courseId, amount, paymentProof, paymentNote, couponId, discountApplied }) => {
    const course = courses.find((c) => c.id === courseId);
    const isFree = Boolean(course?.isFree || amount === 0);
    const status = isFree ? 'FREE' : 'PENDING';

    const newEnrollment = {
      id: genId('enr'),
      studentId,
      courseId,
      status,
      paymentProof: paymentProof || null,
      paymentNote: paymentNote || null,
      verifiedBy: null,
      verifiedAt: null,
      amount: amount || 0,
      couponId: couponId || null,
      discountApplied: discountApplied || 0,
      enrolledAt: new Date().toISOString(),
      completedAt: null
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);

    if (!isFree) {
      const newPayment = {
        id: genId('pay'),
        enrollmentId: newEnrollment.id,
        studentId,
        studentName: studentName || 'Student',
        courseId,
        courseTitle: course?.title || 'Course',
        amount: amount || 0,
        mode: 'UPI / Bank Transfer',
        status: 'PENDING',
        paymentProof: paymentProof || null,
        paymentNote: paymentNote || null,
        createdAt: new Date().toISOString()
      };
      setPayments((prev) => [newPayment, ...prev]);
    } else {
      updateCourse(courseId, { studentsEnrolled: (course?.studentsEnrolled || 0) + 1 });
    }

    return newEnrollment;
  };

  const verifyPayment = (paymentId, isApproved, adminNote) => {
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay) return;

    const nextStatus = isApproved ? 'PAID' : 'FAILED';
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: nextStatus, verifiedBy: 'admin', verifiedAt: new Date().toISOString() } : p))
    );

    if (pay.enrollmentId) {
      setEnrollments((prev) =>
        prev.map((e) => (e.id === pay.enrollmentId ? { ...e, status: nextStatus, verifiedBy: 'admin', verifiedAt: new Date().toISOString() } : e))
      );
    }

    if (isApproved && pay.courseId) {
      const course = courses.find((c) => c.id === pay.courseId);
      if (course) {
        updateCourse(course.id, { studentsEnrolled: (course.studentsEnrolled || 0) + 1 });
      }
    }
  };

  // ── FEE MANAGEMENT & RECORDING ──────────────────────────────────────────────
  const syncStudentFeeRecord = (studentId, updatedFeesList) => {
    if (!studentId) return;

    setStudents((prevStudents) => {
      const studentList = Array.isArray(prevStudents) ? prevStudents : [];
      const student = studentList.find((s) => s.id === studentId || s.legacyId === studentId);
      if (!student) return studentList;

      const currentFees = updatedFeesList || fees || [];
      const studentFees = currentFees.filter((f) => f.studentId === studentId || f.studentId === student.id);
      const totalPaid = studentFees
        .filter((f) => f.status === 'PAID')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

      const batch = (batches || []).find((b) => b.id === student.batchId);
      const totalFee = Number(student.totalFee) || batch?.feeAmount || (totalPaid > 0 ? totalPaid : 0);
      const feeStatus = totalPaid >= totalFee ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Pending';

      const updated = { ...student, totalFee, paidFee: totalPaid, feeStatus };
      supabaseDataService.updateStudent(student.id, { totalFee, paidFee: totalPaid, feeStatus }).catch((e) => console.error(e));

      return studentList.map((s) => (s.id === student.id ? updated : s));
    });
  };

  const addFee = (feeData) => {
    const newFee = {
      id: feeData.id || `fee-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentId: feeData.studentId,
      amount: Number(feeData.amount) || 0,
      paidAt: feeData.paidAt || new Date().toISOString().split('T')[0],
      dueDate: feeData.dueDate || null,
      mode: feeData.mode || 'UPI',
      status: feeData.status || 'PAID',
      receiptNo: feeData.receiptNo || `REC-${Date.now().toString().slice(-6)}`,
      notes: feeData.notes || '',
      createdAt: new Date().toISOString()
    };

    let updatedFeesList = [];
    setFees((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      updatedFeesList = [newFee, ...arr];
      return updatedFeesList;
    });

    supabaseDataService.addFee(newFee).catch((e) => console.error('[DataContext] addFee failed:', e));

    if (feeData.studentId) {
      syncStudentFeeRecord(feeData.studentId, updatedFeesList);
    }

    toast.success(`Fee record of ₹${newFee.amount.toLocaleString()} saved.`, { duration: 3000 });
    return newFee;
  };

  const recordFee = addFee;

  const updateFee = (feeId, updates) => {
    let affectedStudentId = null;
    let nextFees = [];
    setFees((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      nextFees = arr.map((f) => {
        if (f.id === feeId) {
          affectedStudentId = updates.studentId || f.studentId;
          return { ...f, ...updates };
        }
        return f;
      });
      return nextFees;
    });

    supabaseDataService.updateFee(feeId, updates).catch((e) => console.error('[DataContext] updateFee failed:', e));

    if (affectedStudentId) {
      syncStudentFeeRecord(affectedStudentId, nextFees);
    }
    toast.success('Fee record updated.', { duration: 3000 });
  };

  const deleteFee = (feeId) => {
    let affectedStudentId = null;
    let nextFees = [];
    setFees((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const found = arr.find((f) => f.id === feeId);
      if (found) affectedStudentId = found.studentId;
      nextFees = arr.filter((f) => f.id !== feeId);
      return nextFees;
    });

    supabaseDataService.deleteFee(feeId).catch((e) => console.error('[DataContext] deleteFee failed:', e));

    if (affectedStudentId) {
      syncStudentFeeRecord(affectedStudentId, nextFees);
    }
    toast.success('Fee record deleted.', { duration: 3000 });
  };

  // ── PROGRESS, QUIZ ATTEMPTS & TOPIC COMPLETION ──────────────────────────────
  const saveQuizAttempt = ({ studentId, courseId, topicId, answers, score, totalMarks, passed, rating }) => {
    const student = students.find((s) => s.id === studentId || s.legacyId === studentId);
    if (!student) return null;

    const numScore = Number(score) || 0;
    const numTotal = Number(totalMarks) || (Array.isArray(answers) ? answers.length : 1);
    const percentage = numTotal > 0 ? Math.round((numScore / numTotal) * 100) : 0;
    const isPassed = Boolean(passed) || percentage >= 75;

    let computedRating = rating;
    if (!computedRating) {
      if (percentage === 100) computedRating = 'Grade A+ (Perfect Score)';
      else if (percentage >= 85) computedRating = 'Grade A (Exceptional)';
      else if (percentage >= 75) computedRating = 'Grade B+ (Passed)';
      else if (percentage >= 50) computedRating = 'Grade C (Average)';
      else computedRating = 'Grade F (Needs Practice)';
    }

    const attemptRecord = {
      answers: answers || [],
      score: numScore,
      totalMarks: numTotal,
      percentage,
      passed: isPassed,
      rating: computedRating,
      submittedAt: new Date().toISOString()
    };

    const updatedAttempts = {
      ...(student.quizAttempts || {}),
      [topicId]: attemptRecord
    };

    const updatedProgress = {
      ...(student.progress || {})
    };

    if (isPassed) {
      updatedProgress[topicId] = 'completed';
    }

    try {
      localStorage.setItem(`codelift_student_progress_${student.id}`, JSON.stringify(updatedProgress));
      localStorage.setItem(`codelift_student_quizzes_${student.id}`, JSON.stringify(updatedAttempts));
    } catch (_) { }

    updateStudent(student.id, {
      quizAttempts: updatedAttempts,
      progress: updatedProgress
    });

    return attemptRecord;
  };

  const markTopicComplete = (studentId, topicId, courseId) => {
    const student = students.find((s) => s.id === studentId || s.legacyId === studentId);
    if (!student) return;

    const updatedProgress = {
      ...(student?.progress || {}),
      [topicId]: 'completed'
    };

    try {
      localStorage.setItem(`codelift_student_progress_${student.id}`, JSON.stringify(updatedProgress));
      if (student.legacyId) {
        localStorage.setItem(`codelift_student_progress_${student.legacyId}`, JSON.stringify(updatedProgress));
      }
    } catch (_) { }

    updateStudent(student.id, {
      progress: updatedProgress
    });
  };

  // ── CERTIFICATES ────────────────────────────────────────────────────────────
  const issueCertificate = (arg1, arg2, arg3) => {
    let certData = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      certData = { ...arg1 };
    } else {
      const studentId = arg1;
      const courseName = arg2;
      const templateId = arg3;
      const studentObj = students.find((s) => s.id === studentId || s.legacyId === studentId);
      certData = {
        studentId: studentObj?.id || studentId,
        studentName: studentObj?.name || 'Student',
        courseName,
        templateId,
      };
    }

    const activeTpl = certificateTemplates.find((t) => t.isActive) || certificateTemplates[0];
    const targetTpl = certData.templateId
      ? certificateTemplates.find((t) => t.id === certData.templateId) || activeTpl
      : activeTpl;

    const newCert = {
      id: genId('cert'),
      certificateId: certData.certificateId || `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      issuedAt: new Date().toISOString(),
      isIssued: true,
      status: certData.status || 'issued',
      isRevoked: false,
      templateId: targetTpl?.id,
      instituteName: certData.instituteName || platformSettings?.instituteName || targetTpl?.instituteName || 'CodeLift Engineering Academy',
      signatoryName: certData.signatoryName || platformSettings?.signatoryName || targetTpl?.signatoryName || 'Ashish Kumar',
      signatoryTitle: certData.signatoryTitle || platformSettings?.signatoryTitle || targetTpl?.signatoryTitle || 'Director of Academic Affairs',
      certTitle: targetTpl?.certTitle || 'CERTIFICATE OF COMPLETION',
      design: targetTpl?.design ? { ...targetTpl.design } : undefined,
      ...certData
    };

    setCertificates((prev) => [newCert, ...prev]);
    supabaseDataService.issueCertificate(newCert).catch((e) => console.error('[DataContext] issueCertificate failed:', e));
    return newCert;
  };

  const revokeCertificate = (certificateId) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === certificateId ? { ...c, isRevoked: true } : c))
    );
    supabaseDataService.revokeCertificate(certificateId).catch((e) => console.error(e));
  };

  const addCertificateTemplate = (templateData) => {
    const newTemplate = {
      id: genId('tpl'),
      name: templateData.name || 'Custom Certificate Template',
      isActive: Boolean(templateData.isActive),
      instituteName: templateData.instituteName || 'CodeLift Engineering Academy',
      signatoryName: templateData.signatoryName || 'Vikram Nair',
      signatoryTitle: templateData.signatoryTitle || 'Director of Academic Affairs',
      certTitle: templateData.certTitle || 'CERTIFICATE OF COMPLETION',
      design: {
        accentColor: '#15803D',
        bgType: 'gradient',
        backgroundColor: '#ffffff',
        gradientStart: '#f0fdf4',
        gradientEnd: '#ffffff',
        bgStyle: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        fontFamily: 'Georgia, serif',
        borderStyle: 'double',
        borderWidth: 4,
        borderColor: '#15803D',
        borderRadius: 8,
        isDark: false,
        showRibbon: false,
        ribbonText: 'VERIFIED CREDENTIAL',
        ribbonColor: '#15803D',
        showCorners: true,
        showBadge: true,
        badgeText: 'ACADEMIC EXCELLENCE',
        titleSize: '1.45rem',
        nameSize: '2.1rem',
        courseSize: '1.25rem',
        titleAlign: 'center',
        nameAlign: 'center',
        ...(templateData.design || {})
      },
      ...templateData,
    };

    setCertificateTemplates((prev) => {
      if (newTemplate.isActive) {
        return [...prev.map((t) => ({ ...t, isActive: false })), newTemplate];
      }
      return [...prev, newTemplate];
    });

    return newTemplate;
  };

  const updateCertificateTemplate = (templateId, updates) => {
    setCertificateTemplates((prev) =>
      prev.map((t) => {
        if (t.id === templateId) {
          return {
            ...t,
            ...updates,
            design: updates.design ? { ...t.design, ...updates.design } : t.design
          };
        }
        return t;
      })
    );
  };

  const setActiveCertificateTemplate = (templateId) => {
    setCertificateTemplates((prev) =>
      prev.map((t) => ({
        ...t,
        isActive: t.id === templateId
      }))
    );
  };

  const deleteCertificateTemplate = (templateId) => {
    setCertificateTemplates((prev) => {
      const filtered = prev.filter((t) => t.id !== templateId);
      if (filtered.length > 0 && !filtered.some((t) => t.isActive)) {
        filtered[0].isActive = true;
      }
      return filtered;
    });
  };

  // ── PROBLEM SOLVING MODULE ──────────────────────────────────────────────────
  const recordProblemAttempt = ({ studentId, problemId, codeSubmitted, passed, score, testResults, timeTaken, hintsUsed }) => {
    const newAttempt = {
      id: genId('pa'),
      studentId,
      problemId,
      codeSubmitted,
      passed: Boolean(passed),
      score: Number(score) || 0,
      testResults: testResults || [],
      attemptedAt: new Date().toISOString(),
      timeTaken: Number(timeTaken) || 0,
      hintsUsed: Number(hintsUsed) || 0,
      status: passed ? 'Completed' : 'Submitted'
    };
    setProblemAttempts((prev) => {
      const next = [newAttempt, ...(prev || []).filter(a => a.id !== newAttempt.id)];
      try {
        localStorage.setItem('codelift_problem_attempts', JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    // Mirror to codingAttempts so StudentDashboard and student arena reflect the solved count
    const mirrorCodingAttempt = {
      id: genId('ca'),
      studentId,
      problemId,
      code: codeSubmitted,
      passed: Boolean(passed),
      xpEarned: Number(score) || 0,
      visibleResults: testResults || [],
      hiddenResultsSummary: { total: 0, passed: 0 },
      attemptedAt: new Date().toISOString()
    };
    setCodingAttempts((prev) => {
      const next = [mirrorCodingAttempt, ...(prev || []).filter(a => a.id !== mirrorCodingAttempt.id)];
      try {
        localStorage.setItem('codelift_coding_attempts', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    supabaseDataService.addCodingAttempt(mirrorCodingAttempt).catch(() => {});

    return newAttempt;
  };

  // ── CODING ARENA MODULE ──────────────────────────────────────────────────
  const addCodingProblem = (problemData) => {
    const newProblem = {
      id: problemData.id || genId('arena-q'),
      title: problemData.title || 'Untitled Problem',
      description: problemData.description || '',
      difficulty: problemData.difficulty || 'Easy',
      category: problemData.category || 'Lists',
      orderIndex: problemData.orderIndex !== undefined ? Number(problemData.orderIndex) : codingProblems.length + 1,
      xp: Number(problemData.xp) || 50,
      hints: Array.isArray(problemData.hints) ? problemData.hints : [],
      starterCode: problemData.starterCode || '',
      testCases: Array.isArray(problemData.testCases) ? problemData.testCases : [],
      hiddenTestCases: Array.isArray(problemData.hiddenTestCases) ? problemData.hiddenTestCases : []
    };
    setCodingProblems((prev) => {
      const next = [...prev, newProblem];
      try {
        localStorage.setItem('codelift_coding_problems', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    supabaseDataService.saveCodingProblem(newProblem).catch(() => { });
    toast.success('Problem created successfully!');
    return newProblem;
  };

  const updateCodingProblem = (problemId, updates) => {
    setCodingProblems((prev) => {
      const updated = prev.map((p) => (p.id === problemId ? { ...p, ...updates } : p));
      const target = updated.find((p) => p.id === problemId);
      if (target) supabaseDataService.saveCodingProblem(target).catch(() => { });
      try {
        localStorage.setItem('codelift_coding_problems', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    toast.success('Problem updated successfully!');
  };

  const deleteCodingProblem = (problemId) => {
    setCodingProblems((prev) => {
      const next = prev.filter((p) => p.id !== problemId);
      try {
        localStorage.setItem('codelift_coding_problems', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    supabaseDataService.deleteCodingProblemSupabase(problemId).catch(() => { });
    toast.success('Problem deleted!');
  };

  const resetCodingProblemsToSeed = () => {
    setCodingProblems(unifiedCodingProblemsSeed);
    try {
      localStorage.setItem('codelift_coding_problems', JSON.stringify(unifiedCodingProblemsSeed));
    } catch (_) {}
    toast.success('Reset all coding problems to seed challenges!');
  };

  const submitCodingAttempt = ({ studentId, problemId, code, visibleResults, hiddenResults, passed, xpEarned }) => {
    const newAttempt = {
      id: genId('ca'),
      studentId,
      problemId,
      code,
      passed: Boolean(passed),
      xpEarned: Number(xpEarned) || 0,
      visibleResults: visibleResults || [],
      hiddenResultsSummary: {
        total: hiddenResults?.length || 0,
        passed: hiddenResults?.filter(r => r.passed)?.length || 0
      },
      attemptedAt: new Date().toISOString()
    };
    setCodingAttempts((prev) => {
      const next = [newAttempt, ...(prev || []).filter(a => a.id !== newAttempt.id)];
      try {
        localStorage.setItem('codelift_coding_attempts', JSON.stringify(next));
      } catch (_) { }
      return next;
    });

    // Mirror to problemAttempts
    const mirrorProblemAttempt = {
      id: genId('pa'),
      studentId,
      problemId,
      codeSubmitted: code,
      passed: Boolean(passed),
      score: Number(xpEarned) || 0,
      testResults: visibleResults || [],
      attemptedAt: new Date().toISOString(),
      status: passed ? 'Completed' : 'Submitted'
    };
    setProblemAttempts((prev) => {
      const next = [mirrorProblemAttempt, ...(prev || []).filter(a => a.id !== mirrorProblemAttempt.id)];
      try {
        localStorage.setItem('codelift_problem_attempts', JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    supabaseDataService.addCodingAttempt(newAttempt).catch(() => { });
    return newAttempt;
  };

  // ── TESTS & ATTEMPTS ────────────────────────────────────────────────────────
  const addTest = (testData) => {
    const rawBatchIds = Array.isArray(testData.assignedBatchIds)
      ? testData.assignedBatchIds
      : (Array.isArray(testData.batchIds) ? testData.batchIds : []);
    const newTest = {
      id: testData.id || genId('test'),
      title: testData.title || 'Untitled Test',
      description: testData.description || '',
      passingPercentage: testData.passingPercentage !== undefined ? Number(testData.passingPercentage) : 70,
      allowRetake: Boolean(testData.allowRetake),
      assignedBatchIds: rawBatchIds,
      batchIds: rawBatchIds,
      questions: testData.questions || [],
      createdAt: new Date().toISOString()
    };
    setTests((prev) => [newTest, ...prev]);

    if (rawBatchIds.length > 0) {
      setBatches((prev) =>
        prev.map((b) => {
          if (rawBatchIds.includes(b.id)) {
            const testIds = Array.isArray(b.testIds) ? b.testIds : [];
            return { ...b, testIds: Array.from(new Set([...testIds, newTest.id])) };
          }
          return b;
        })
      );
    }

    supabaseDataService.addTest(newTest).catch((e) => console.error(e));
    return newTest;
  };

  const updateTest = (testId, updates) => {
    setTests((prev) => prev.map((t) => (t.id === testId ? { ...t, ...updates } : t)));
    supabaseDataService.updateTest(testId, updates).catch((e) => console.error(e));
  };

  const deleteTest = async (testId) => {
    activeMutationsRef.current += 1;
    // 1. Remove test from tests state
    setTests((prev) => prev.filter((t) => t.id !== testId));
    // 2. Cascade delete associated attempts from local state
    setTestAttempts((prev) => prev.filter((ta) => ta.testId !== testId));
    // 3. Remove test from batch testIds in local state
    setBatches((prev) =>
      prev.map((b) => ({
        ...b,
        testIds: Array.isArray(b.testIds) ? b.testIds.filter((id) => id !== testId) : []
      }))
    );

    try {
      await supabaseDataService.deleteTest(testId);
    } catch (e) {
      console.error('[DataContext] deleteTest failed:', e);
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  const submitTestAttempt = (attemptData) => {
    const totalQuestions = Number(attemptData.totalQuestions) || (attemptData.answers?.length) || 1;
    const score = Number(attemptData.score) || 0;
    const percentage = attemptData.percentage !== undefined
      ? Number(attemptData.percentage)
      : Math.round((score / totalQuestions) * 100);

    const newAttempt = {
      id: attemptData.id || genId('att'),
      studentId: attemptData.studentId,
      testId: attemptData.testId,
      batchId: attemptData.batchId,
      answers: attemptData.answers || [],
      score,
      totalQuestions,
      percentage,
      passingPercentage: attemptData.passingPercentage !== undefined ? Number(attemptData.passingPercentage) : 70,
      submittedAt: attemptData.submittedAt || new Date().toISOString()
    };
    setTestAttempts((prev) => [newAttempt, ...prev]);
    supabaseDataService.submitTestAttempt(newAttempt).catch((e) => console.error(e));
    return newAttempt;
  };

  // ── ASSIGNMENTS & SUBMISSIONS ───────────────────────────────────────────────
  const addSubmission = ({ studentId, assignmentId, fileUrl, fileUrls, notes }) => {
    const student = students.find((s) => s.id === studentId || s.legacyId === studentId);
    const assignment = assignments.find((a) => a.id === assignmentId);

    if (assignment && student) {
      const allowedBatchIds = assignment.batchIds || (assignment.batchId ? [assignment.batchId] : []);
      if (allowedBatchIds.length > 0 && student.batchId && !allowedBatchIds.includes(student.batchId)) {
        throw new Error(
          `Batch Mismatch: Student is assigned to batch "${student.batchId}", but this assignment is restricted to batch(es): ${allowedBatchIds.join(', ')}.`
        );
      }
    }

    const submissionUrl = fileUrl || (Array.isArray(fileUrls) && fileUrls[0]) || '';
    const submissionUrls = Array.isArray(fileUrls) ? fileUrls : (submissionUrl ? [submissionUrl] : []);

    const newSubmission = {
      id: genId('sub'),
      studentId: student?.id || studentId,
      assignmentId,
      batchId: student?.batchId || null,
      fileUrl: submissionUrl,
      fileUrls: submissionUrls,
      notes: notes || '',
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: null,
      status: 'Submitted'
    };

    setSubmissions((prev) => {
      const existingIdx = prev.findIndex((s) => s.studentId === newSubmission.studentId && s.assignmentId === assignmentId);
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx] = newSubmission;
        return copy;
      }
      return [newSubmission, ...prev];
    });

    supabaseDataService.addSubmission(newSubmission).catch((e) => console.error(e));
    toast.success('Assignment submitted successfully!');
    return newSubmission;
  };

  const gradeSubmission = (submissionId, grade, feedback) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, grade: Number(grade), feedback } : s))
    );
    supabaseDataService.gradeSubmission(submissionId, grade, feedback).catch((e) => console.error(e));
  };

  const addAssignment = async (assignmentData) => {
    const rawBatchIds = Array.isArray(assignmentData.batchIds)
      ? assignmentData.batchIds
      : (assignmentData.assignedBatchIds || (assignmentData.batchId ? [assignmentData.batchId] : []));
    const normalizedBatchIds = rawBatchIds.length > 0 ? rawBatchIds : (batches || []).map((b) => b.id);

    const newAssignment = {
      id: assignmentData.id || genId('asgn'),
      title: assignmentData.title || 'Untitled Assignment',
      description: assignmentData.description || '',
      deadline: assignmentData.deadline || assignmentData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      dueDate: assignmentData.deadline || assignmentData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      batchIds: normalizedBatchIds,
      assignedBatchIds: normalizedBatchIds,
      batchId: normalizedBatchIds[0] || null,
      maxMarks: Number(assignmentData.maxMarks || assignmentData.maxScore) || 100,
      maxScore: Number(assignmentData.maxMarks || assignmentData.maxScore) || 100,
      passingMarks: Number(assignmentData.passingMarks) || 50,
      instructions: assignmentData.instructions || '',
      attachments: assignmentData.attachments || [],
      status: assignmentData.status || 'Active',
      createdAt: new Date().toISOString()
    };

    setAssignments((prev) => [newAssignment, ...(Array.isArray(prev) ? prev : [])]);

    setBatches((prev) =>
      prev.map((b) => {
        if (normalizedBatchIds.includes(b.id)) {
          const assignmentIds = Array.isArray(b.assignmentIds) ? b.assignmentIds : [];
          return { ...b, assignmentIds: Array.from(new Set([...assignmentIds, newAssignment.id])) };
        }
        return b;
      })
    );

    try {
      await supabaseDataService.addAssignment(newAssignment);
      toast.success('Assignment created and assigned to batch!');
    } catch (e) {
      console.error('[DataContext] addAssignment failed:', e);
      toast.error('Failed to create assignment on database.');
      throw e;
    }
    return newAssignment;
  };

  const deleteAssignment = async (assignmentId) => {
    activeMutationsRef.current += 1;
    setAssignments((prev) => (Array.isArray(prev) ? prev.filter((a) => a.id !== assignmentId) : []));
    setSubmissions((prev) => (Array.isArray(prev) ? prev.filter((s) => s.assignmentId !== assignmentId) : []));
    setBatches((prev) =>
      prev.map((b) => {
        if (Array.isArray(b.assignmentIds) && b.assignmentIds.includes(assignmentId)) {
          return { ...b, assignmentIds: b.assignmentIds.filter((id) => id !== assignmentId) };
        }
        return b;
      })
    );

    try {
      await supabaseDataService.deleteAssignment(assignmentId);
      toast.success('Assignment and associated submissions deleted permanently.');
    } catch (e) {
      console.error('[DataContext] deleteAssignment failed:', e);
      toast.error('Failed to delete assignment from database.');
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  const detachAssignmentFromBatch = async (assignmentId, batchId) => {
    activeMutationsRef.current += 1;
    setAssignments((prev) =>
      (Array.isArray(prev) ? prev : []).map((a) => {
        if (a.id === assignmentId) {
          const bIds = Array.isArray(a.batchIds) ? a.batchIds.filter((id) => id !== batchId) : [];
          return { ...a, batchIds: bIds, assignedBatchIds: bIds };
        }
        return a;
      })
    );
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          const aIds = Array.isArray(b.assignmentIds) ? b.assignmentIds.filter((id) => id !== assignmentId) : [];
          return { ...b, assignmentIds: aIds };
        }
        return b;
      })
    );
    try {
      await supabaseDataService.detachAssignmentFromBatch(assignmentId, batchId);
      toast.success('Assignment unassigned from batch.');
    } catch (e) {
      console.error('[DataContext] detachAssignmentFromBatch failed:', e);
      toast.error('Failed to unassign assignment from batch.');
      throw e;
    } finally {
      activeMutationsRef.current = Math.max(0, activeMutationsRef.current - 1);
    }
  };

  // ── PLATFORM SETTINGS ───────────────────────────────────────────────────────
  const updatePlatformSettings = (newSettings) => {
    setPlatformSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // ── BACKUP RESTORE & FACTORY RESET ──────────────────────────────────────────
  const importAllData = async (payload) => {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid backup payload');
    }

    const dbSource = payload.database && typeof payload.database === 'object' ? payload.database : payload;
    const staticSource = payload.static && typeof payload.static === 'object' ? payload.static : payload;

    if (Array.isArray(dbSource.users || payload.users)) setUsers(dbSource.users || payload.users);
    if (Array.isArray(dbSource.students || payload.students)) {
      const st = dbSource.students || payload.students;
      setStudents(st);
    }
    if (Array.isArray(dbSource.categories || payload.categories)) setCategories(dbSource.categories || payload.categories);
    if (Array.isArray(dbSource.courses || payload.courses)) setCourses(dbSource.courses || payload.courses);
    if (Array.isArray(dbSource.batches || payload.batches)) setBatches(dbSource.batches || payload.batches);
    if (Array.isArray(dbSource.fees || payload.fees)) setFees(dbSource.fees || payload.fees);
    if (Array.isArray(dbSource.tests || payload.tests)) setTests(dbSource.tests || payload.tests);
    if (Array.isArray(dbSource.testAttempts || dbSource.test_attempts || payload.testAttempts)) {
      setTestAttempts(dbSource.testAttempts || dbSource.test_attempts || payload.testAttempts);
    }
    if (Array.isArray(dbSource.assignments || payload.assignments)) setAssignments(dbSource.assignments || payload.assignments);
    if (Array.isArray(dbSource.submissions || payload.submissions)) setSubmissions(dbSource.submissions || payload.submissions);
    if (Array.isArray(dbSource.certificates || payload.certificates)) setCertificates(dbSource.certificates || payload.certificates);
    if (Array.isArray(dbSource.certificateTemplates || dbSource.certificate_templates || payload.certificateTemplates)) {
      setCertificateTemplates(dbSource.certificateTemplates || dbSource.certificate_templates || payload.certificateTemplates);
    }
    if (Array.isArray(dbSource.completedBatches || dbSource.completed_batches || payload.completedBatches)) {
      setCompletedBatches(dbSource.completedBatches || dbSource.completed_batches || payload.completedBatches);
    }
    if (Array.isArray(dbSource.problemAttempts || dbSource.problem_attempts || payload.problemAttempts)) {
      setProblemAttempts(dbSource.problemAttempts || dbSource.problem_attempts || payload.problemAttempts);
    }
    if (Array.isArray(dbSource.codingProblems || dbSource.coding_problems || payload.codingProblems)) {
      const cp = dbSource.codingProblems || dbSource.coding_problems || payload.codingProblems;
      setCodingProblems(cp);
    }
    if (Array.isArray(dbSource.codingAttempts || dbSource.coding_attempts || payload.codingAttempts)) {
      const ca = dbSource.codingAttempts || dbSource.coding_attempts || payload.codingAttempts;
      setCodingAttempts(ca);
    }
    if (Array.isArray(dbSource.enrollments || payload.enrollments)) setEnrollments(dbSource.enrollments || payload.enrollments);
    if (Array.isArray(dbSource.coupons || payload.coupons)) setCoupons(dbSource.coupons || payload.coupons);
    if (Array.isArray(dbSource.payments || payload.payments)) setPayments(dbSource.payments || payload.payments);
    if (staticSource.platformSettings || payload.platformSettings) {
      setPlatformSettings(staticSource.platformSettings || payload.platformSettings);
    }

    // Sync to Supabase tables
    try {
      const tablesToSync = payload.database || {
        users: dbSource.users || payload.users,
        students: dbSource.students || payload.students,
        categories: dbSource.categories || payload.categories,
        courses: dbSource.courses || payload.courses,
        batches: dbSource.batches || payload.batches,
        fees: dbSource.fees || payload.fees,
        tests: dbSource.tests || payload.tests,
        test_attempts: dbSource.testAttempts || dbSource.test_attempts || payload.testAttempts,
        assignments: dbSource.assignments || payload.assignments,
        submissions: dbSource.submissions || payload.submissions,
        certificates: dbSource.certificates || payload.certificates,
        completed_batches: dbSource.completedBatches || dbSource.completed_batches || payload.completedBatches,
        coding_problems: dbSource.codingProblems || dbSource.coding_problems || payload.codingProblems,
        coding_attempts: dbSource.codingAttempts || dbSource.coding_attempts || payload.codingAttempts
      };
      await supabaseDataService.importAllDatabaseData(tablesToSync);
    } catch (err) {
      console.warn('[DataContext] Background Supabase restore notice:', err.message);
    }

    return true;
  };

  const resetToDefaults = () => {
    setUsers(usersSeed);
    setStudents(studentsSeed);
    setCategories(categoriesSeed);
    setCourses(coursesSeed);
    setEnrollments(enrollmentsSeed);
    setCoupons(couponsSeed);
    setPayments(paymentsSeed);
    setBatches(batchesSeed);
    setFees(feesSeed);
    setTests(testsSeed);
    setTestAttempts(attemptsSeed);
    setAssignments(assignmentsSeed);
    setSubmissions(submissionsSeed);
    setCertificates(certificatesSeed);
    setCertificateTemplates(certificateTemplatesSeed);
    setCompletedBatches(completedBatchesSeed);
    setProblemAttempts(problemAttemptsSeed);
    setCodingProblems(unifiedCodingProblemsSeed);
    setCodingAttempts(codingAttemptsSeed);
    setPlatformSettings(DEFAULT_PLATFORM_SETTINGS);

    try {
      const keysToKeep = ['codelift_theme', 'codelift_auth'];
      const keysToRemove = [
        'codelift_data',
        'codelift_admin_data_v2',
        'codelift_students',
        'codelift_students_cache',
        'codelift_batches',
        'codelift_courses',
        'codelift_fees',
        'codelift_tests',
        'codelift_submissions',
        'codelift_certificates',
        'codelift_course_sidebar_hidden',
        'codelift_coding_problems',
        'codelift_coding_attempts',
        'fees_unlocked',
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('codelift_') && !keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      }
      sessionStorage.clear();
    } catch (e) { }
  };

  return (
    <DataContext.Provider
      value={{
        // Collections
        users,
        students,
        categories,
        courses,
        enrollments,
        coupons,
        reviews: [],
        discussions: [],
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
        codingAttempts,
        passwordResetRequests,
        notifications: [],
        platformSettings,
        isHydrated,
        isLoading: !isHydrated,
        loading: !isHydrated,

        // Handlers
        addUser,
        updateUser,
        addStudent,
        updateStudent,
        deleteStudent,
        toggleStudentActive,
        createPasswordResetRequest,
        resolvePasswordResetRequest,
        dismissPasswordResetRequest,
        addBatch,
        updateBatch,
        deleteBatch,
        toggleBatchActive,
        completeBatch,
        markBatchComplete: completeBatch,
        cleanupBatch,
        addCategory,
        addCourse,
        updateCourse,
        deleteCourse,
        createCourseFromJSON,
        enrollCourse,
        verifyPayment,
        addFee,
        recordFee,
        updateFee,
        deleteFee,
        markTopicComplete,
        saveQuizAttempt,
        addAssignment,
        deleteAssignment,
        detachAssignmentFromBatch,
        addSubmission,
        gradeSubmission,
        issueCertificate,
        revokeCertificate,
        addCertificateTemplate,
        updateCertificateTemplate,
        setActiveCertificateTemplate,
        deleteCertificateTemplate,
        addReview: () => { },
        replyReview: () => { },
        addQuestion: () => { },
        addAnswer: () => { },
        upvoteAnswer: () => { },
        recordProblemAttempt,
        addCodingProblem,
        updateCodingProblem,
        deleteCodingProblem,
        resetCodingProblemsToSeed,
        submitCodingAttempt,
        addTest,
        updateTest,
        deleteTest,
        submitTestAttempt,
        attachCourseToBatch,
        detachCourseFromBatch,
        assignTestToBatch,
        unassignTestFromBatch,
        assignStudentToBatch,
        removeStudentFromBatch,
        updatePlatformSettings,
        importAllData,
        resetToDefaults,
        refreshData: syncFromSupabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
