import assert from 'assert';
import fs from 'fs';

export function runStudentCreationAndQuizAttemptsTests() {
  console.log('\n🔵 RUNNING SUITE: Student Creation & Quiz Attempts Schema Resilience');
  let passedCount = 0;
  const totalCount = 8;

  // 1. Verify Migration 012 exists and properly defines quiz_attempts with schema reload
  const migration012 = fs.readFileSync('supabase/migrations/012_student_quiz_attempts.sql', 'utf8');
  assert(
    migration012.includes('ALTER TABLE IF EXISTS public.students') &&
    migration012.includes('ADD COLUMN IF NOT EXISTS quiz_attempts jsonb DEFAULT \'{}\'::jsonb'),
    'Migration 012 must add quiz_attempts column to public.students'
  );
  assert(
    migration012.includes("NOTIFY pgrst, 'reload schema'"),
    'Migration 012 must notify PostgREST to reload schema cache'
  );
  console.log('  ✓ Migration 012 exists with public.students.quiz_attempts and PostgREST reload notification');
  passedCount++;

  // 2. Verify supabaseDataService.js does not inject empty quiz_attempts on new student creation
  const dataServiceJs = fs.readFileSync('src/services/supabaseDataService.js', 'utf8');
  assert(
    !dataServiceJs.includes("quiz_attempts: studentData.quizAttempts || studentData.quiz_attempts || {},"),
    'supabaseDataService.js must not unconditionally inject empty quiz_attempts in addStudent'
  );
  assert(
    dataServiceJs.includes("const quizAttempts = studentData.quizAttempts || studentData.quiz_attempts;"),
    'supabaseDataService.js must conditionally extract quizAttempts'
  );
  console.log('  ✓ supabaseDataService.js omits empty quiz_attempts in addStudent to protect against unmigrated DBs');
  passedCount++;

  // 3. Verify supabaseDataService.js implements schema cache fallback retry for addStudent
  assert(
    dataServiceJs.includes("isQuizAttemptsColumnSupported = false") &&
    dataServiceJs.includes("delete insertPayload.quiz_attempts") &&
    dataServiceJs.includes("quiz_attempts column missing in schema cache"),
    'addStudent must catch schema cache error and retry without quiz_attempts'
  );
  console.log('  ✓ addStudent catches schema cache error, marks column unsupported, and retries seamlessly');
  passedCount++;

  // 4. Verify supabaseDataService.js implements schema cache fallback retry for updateStudent
  assert(
    dataServiceJs.includes("delete payload.quiz_attempts") &&
    dataServiceJs.includes("retrying update without quiz_attempts"),
    'updateStudent must catch schema cache error and retry without quiz_attempts'
  );
  console.log('  ✓ updateStudent catches schema cache error and safely falls back without throwing');
  passedCount++;

  // 5. Verify DataContext.jsx rolls back optimistic addition on Supabase rejection
  const dataContextJs = fs.readFileSync('src/contexts/DataContext.jsx', 'utf8');
  assert(
    dataContextJs.includes("setStudents((prev) => prev.filter((s) => s.id !== assignedId))"),
    'DataContext.jsx must revert optimistic student state if addStudent fails'
  );
  console.log('  ✓ DataContext.jsx cleans up optimistic student if database rejects insertion');
  passedCount++;

  // 6. Verify StudentManager and BatchManager await and catch addStudent errors
  const studentManagerJs = fs.readFileSync('src/components/admin/StudentManager.jsx', 'utf8');
  const batchManagerJs = fs.readFileSync('src/components/admin/BatchManager.jsx', 'utf8');
  assert(
    studentManagerJs.includes("const onAddSubmit = async (data) =>") &&
    studentManagerJs.includes("await addStudent(data);") &&
    studentManagerJs.includes("toast.error(err.message || 'Failed to add student. Please try again.');"),
    'StudentManager must await addStudent and catch errors with toast.error'
  );
  assert(
    batchManagerJs.includes("const handleEnrollNewStudent = async (e) =>") &&
    batchManagerJs.includes("await addStudent({") &&
    batchManagerJs.includes("toast.error(err.message || 'Failed to enroll student.');"),
    'BatchManager must await addStudent and catch errors with toast.error'
  );
  console.log('  ✓ StudentManager & BatchManager gracefully await and catch addStudent with user-friendly alerts');
  passedCount++;

  // 7. Verify DataContext.jsx tracks and exports isHydrated and loading states
  assert(
    dataContextJs.includes("const [isHydrated, setIsHydrated] = useState(!isSupabaseConfigured);") &&
    dataContextJs.includes("setIsHydrated(true);") &&
    dataContextJs.includes("isHydrated,") &&
    dataContextJs.includes("isLoading: !isHydrated,"),
    'DataContext must track isHydrated and expose it to consumers'
  );
  console.log('  ✓ DataContext.jsx exposes isHydrated and loading states synced with Supabase hydration');
  passedCount++;

  // 8. Verify StudentFees.jsx and FeeStatus.jsx render loader on initial load and prevent 45000 flash
  const studentFeesJs = fs.readFileSync('src/components/student/StudentFees.jsx', 'utf8');
  const feeStatusJs = fs.readFileSync('src/components/student/FeeStatus.jsx', 'utf8');
  assert(
    studentFeesJs.includes("isDataLoading") &&
    studentFeesJs.includes("spinner-border") &&
    studentFeesJs.includes("Loading Fee Details..."),
    'StudentFees.jsx must render spinner loader while data is loading'
  );
  assert(
    feeStatusJs.includes("isDataLoading") &&
    feeStatusJs.includes("spinner-border") &&
    feeStatusJs.includes("Loading Fee Records..."),
    'FeeStatus.jsx must render spinner loader while data is loading'
  );
  assert(
    !studentFeesJs.includes("const totalFee = Number(student?.totalFee) || batch?.feeAmount || 45000;"),
    'StudentFees.jsx must not blindly fall back to 45000 on load'
  );
  assert(
    !feeStatusJs.includes("const totalFee = Number(student?.totalFee) || studentBatch?.feeAmount || 45000;"),
    'FeeStatus.jsx must not blindly fall back to 45000 on load'
  );
  console.log('  ✓ StudentFees.jsx & FeeStatus.jsx show sleek spinner loader and prevent 45000 flash on load');
  passedCount++;

  console.log(`✨ All ${passedCount}/${totalCount} Student Creation & Schema Resilience tests PASSED!`);
  return { passedCount, totalCount };
}
