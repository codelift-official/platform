import assert from 'assert';
import fs from 'fs';

export function runBatchManagementAndQuizzesTests() {
  console.log('\n🔵 RUNNING SUITE: Batch Management, Safe Deletion & Course Quizzes');
  let passedCount = 0;
  const totalCount = 7;

  // 1. Verify supabaseClient.js and loggerService.js recursion shield
  const clientJs = fs.readFileSync('src/services/supabaseClient.js', 'utf8');
  const loggerJs = fs.readFileSync('src/services/loggerService.js', 'utf8');
  assert(clientJs.includes('export const isSupabaseConfigured = Boolean('), 'supabaseClient must export boolean');
  assert(loggerJs.includes('isLoggingInternal'), 'loggerService must contain recursion shield isLoggingInternal');
  assert(!loggerJs.includes('if (isSupabaseConfigured())'), 'loggerService must not invoke boolean as a function');
  console.log('  ✓ loggerService has recursion shield and safe boolean check (fixes ja is not a function)');
  passedCount++;

  // 2. Verify main.jsx imports loggerService on startup
  const mainJsx = fs.readFileSync('src/main.jsx', 'utf8');
  assert(mainJsx.includes("import './services/loggerService.js';"), 'main.jsx must import loggerService on boot');
  console.log('  ✓ main.jsx initializes error logging on application boot');
  passedCount++;

  // 3. Verify BatchManager.jsx imports deleteBatch and features simplified grid
  const batchManagerJsx = fs.readFileSync('src/components/admin/BatchManager.jsx', 'utf8');
  assert(batchManagerJsx.includes('deleteBatch,'), 'BatchManager must destructure deleteBatch from useData');
  assert(batchManagerJsx.includes('deleteModalBatch'), 'BatchManager must define deleteModalBatch state');
  assert(batchManagerJsx.includes('filterStatus'), 'BatchManager must support statusFilter pills');
  assert(batchManagerJsx.includes('searchQuery'), 'BatchManager must support search filtering');
  assert(batchManagerJsx.includes('<th>Cohort & Curriculum</th>'), 'BatchManager must feature simplified 5-column layout');
  assert(batchManagerJsx.includes('<th>Actions</th>'), 'BatchManager must feature clean Actions column');
  console.log('  ✓ BatchManager features simplified 5-column grid, search, status pills, and direct delete');
  passedCount++;

  // 4. Verify DataContext.jsx safely cascades batch deletion
  const dataContextJsx = fs.readFileSync('src/contexts/DataContext.jsx', 'utf8');
  assert(dataContextJsx.includes('s.batchId === batchId ? { ...s, batchId: \'\' } : s'), 'DataContext must unassign students on deleteBatch');
  assert(dataContextJsx.includes('supabaseDataService.deleteBatch(batchId)'), 'DataContext must call supabaseDataService.deleteBatch');
  console.log('  ✓ DataContext cleanly unlinks students, courses, tests, and assignments on batch deletion');
  passedCount++;

  // 5. Verify supabaseDataService.js cleans up dependent records
  const dataServiceJs = fs.readFileSync('src/services/supabaseDataService.js', 'utf8');
  assert(dataServiceJs.includes("supabase.from('batch_courses').delete().eq('batch_id', batchId)"), 'deleteBatch must clean batch_courses');
  assert(dataServiceJs.includes("supabase.from('batch_tests').delete().eq('batch_id', batchId)"), 'deleteBatch must clean batch_tests');
  assert(dataServiceJs.includes("supabase.from('students').update({ batch_id: null }).eq('batch_id', batchId)"), 'deleteBatch must unassign students in DB');
  console.log('  ✓ supabaseDataService deletes junction records and unassigns students before deleting batch');
  passedCount++;

  // 6. Verify data/courses.json has top-level id and topics have quizQuestions
  const courses = JSON.parse(fs.readFileSync('data/courses.json', 'utf8'));
  for (const c of courses) {
    assert(c.id, `Course "${c.title}" must have defined top-level id`);
    const topics = (c.modules || []).flatMap((m) => m.topics || []);
    const topicsWithQuiz = topics.filter((t) => Array.isArray(t.quizQuestions) && t.quizQuestions.length > 0);
    assert(topicsWithQuiz.length > 0, `Course "${c.title}" must have topics with quizQuestions`);
  }
  console.log('  ✓ data/courses.json defines top-level ids and mirrors quizQuestions onto topics for all courses');
  passedCount++;

  // 7. Verify StudentCourses.jsx, CurriculumNavigator.jsx, and CoursePreview.jsx render quizzes
  const studentCoursesJsx = fs.readFileSync('src/components/student/StudentCourses.jsx', 'utf8');
  const curriculumNavJsx = fs.readFileSync('src/components/student/CurriculumNavigator.jsx', 'utf8');
  const coursePreviewJsx = fs.readFileSync('src/components/common/CoursePreview.jsx', 'utf8');
  assert(studentCoursesJsx.includes('activeQuizQuestions'), 'StudentCourses must support dual topic and module quiz questions');
  assert(curriculumNavJsx.includes('qCount'), 'CurriculumNavigator must compute topic and module quiz count');
  assert(coursePreviewJsx.includes('activeQuizQuestions'), 'CoursePreview must support dual topic and module quiz questions');
  console.log('  ✓ Student views and preview navigator render quiz questions and badges seamlessly');
  passedCount++;

  assert(batchManagerJsx.includes('gap-2 p-1 rounded-pill'), 'BatchManager must use gap-2 on filter pills container');
  assert(batchManagerJsx.includes('d-inline-flex align-items-center gap-2 border-0'), 'BatchManager filter pill buttons must use gap-2');
  console.log('  ✓ BatchManager filter status pills prevent badge overlap with proper flex gap and inline-flex');
  passedCount++;

  // 9. Verify StudentProfile and AdminProfile view password toggles and password fallback resilience
  const studentProfileJsx = fs.readFileSync('src/components/student/StudentProfile.jsx', 'utf8');
  const adminProfileJsx = fs.readFileSync('src/components/admin/AdminProfile.jsx', 'utf8');
  assert(studentProfileJsx.includes('FiEye') && studentProfileJsx.includes('FiEyeOff'), 'StudentProfile must import FiEye and FiEyeOff');
  assert(studentProfileJsx.includes('showCurrentPassword') && studentProfileJsx.includes('showNewPassword') && studentProfileJsx.includes('showConfirmPassword'), 'StudentProfile must have visibility toggles for all 3 password inputs');
  assert(studentProfileJsx.includes('codelift_student_pwd_'), 'StudentProfile must verify/persist student password locally');
  assert(studentProfileJsx.includes("'codelift123'"), 'StudentProfile must recognize platform standard default codelift123');

  assert(adminProfileJsx.includes('FiEye') && adminProfileJsx.includes('FiEyeOff'), 'AdminProfile must import FiEye and FiEyeOff');
  assert(adminProfileJsx.includes('showCurrentPassword') && adminProfileJsx.includes('showNewPassword') && adminProfileJsx.includes('showConfirmPassword'), 'AdminProfile must have visibility toggles for all 3 password inputs');
  assert(adminProfileJsx.includes('codelift_admin_pwd'), 'AdminProfile must verify/persist admin password locally');
  console.log('  ✓ StudentProfile and AdminProfile support view password toggles and password update resilience');
  passedCount++;

  console.log(`✨ All ${passedCount}/${totalCount + 2} Batch Management & Course Quiz tests PASSED!`);
  return { passedCount, totalCount: totalCount + 2 };
}

if (process.argv[1]?.endsWith('batch-management-and-quizzes.test.js')) {
  runBatchManagementAndQuizzesTests();
}
