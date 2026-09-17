import assert from 'assert';
import fs from 'fs';

export function runTestDeletionAndTechThumbnailsTests() {
  console.log('\n🔵 RUNNING SUITE: Test Deletion Cascades, Dynamic Course Categories & Tech Thumbnails');
  let passedCount = 0;
  const totalCount = 7;

  // 1. Verify supabaseDataService.deleteTest cascades
  const dataServiceJs = fs.readFileSync('src/services/supabaseDataService.js', 'utf8');
  assert(dataServiceJs.includes('export async function deleteTest(testId) {'), 'Must export deleteTest');
  assert(dataServiceJs.includes("supabase.from('test_attempts').delete().eq('test_id', testId)"), 'deleteTest must delete test_attempts');
  assert(dataServiceJs.includes("supabase.from('batch_tests').delete().eq('test_id', testId)"), 'deleteTest must delete batch_tests');
  assert(dataServiceJs.includes("supabase.from('test_questions').delete().eq('test_id', testId)"), 'deleteTest must delete test_questions');
  assert(dataServiceJs.includes("supabase.from('tests').delete().eq('id', testId)"), 'deleteTest must delete tests record');
  console.log('  ✓ supabaseDataService.deleteTest cascades across attempts, batches, questions and tests');
  passedCount++;

  // 2. Verify DataContext unlinks test from state and batch testIds
  const dataContextJsx = fs.readFileSync('src/contexts/DataContext.jsx', 'utf8');
  assert(dataContextJsx.includes('const deleteTest = async (testId) => {'), 'DataContext must define deleteTest');
  assert(dataContextJsx.includes('setTestAttempts((prev) => prev.filter((ta) => ta.testId !== testId));'), 'DataContext must filter testAttempts');
  assert(dataContextJsx.includes('Array.isArray(b.testIds) ? b.testIds.filter((id) => id !== testId) : []'), 'DataContext must unlink testIds from batches');
  console.log('  ✓ DataContext.deleteTest cascades across tests, testAttempts, and batch testIds');
  passedCount++;

  // 3. Verify TestManager.jsx delete button and confirmation
  const testManagerJsx = fs.readFileSync('src/components/admin/TestManager.jsx', 'utf8');
  assert(testManagerJsx.includes('handleDeleteTest'), 'TestManager must define handleDeleteTest');
  assert(testManagerJsx.includes('window.confirm('), 'TestManager must confirm before deletion');
  assert(testManagerJsx.includes('aria-label="Delete Test"'), 'TestManager must render accessible Delete button');
  console.log('  ✓ TestManager provides direct test deletion with confirmation prompt and feedback');
  passedCount++;

  // 4. Verify CourseManager.jsx category creation & selection
  const courseManagerJsx = fs.readFileSync('src/components/admin/CourseManager.jsx', 'utf8');
  assert(courseManagerJsx.includes('addCategory,'), 'CourseManager must destructure addCategory');
  assert(courseManagerJsx.includes('isCreatingCategory'), 'CourseManager must support inline category creation');
  assert(courseManagerJsx.includes('categoryId: finalCategoryId'), 'CourseManager must persist categoryId on create and edit');
  console.log('  ✓ CourseManager allows choosing or creating categories on course creation & editing');
  passedCount++;

  // 5. Verify CourseTechThumbnail component
  assert(fs.existsSync('src/components/common/CourseTechThumbnail.jsx'), 'CourseTechThumbnail.jsx must exist');
  const thumbnailJsx = fs.readFileSync('src/components/common/CourseTechThumbnail.jsx', 'utf8');
  assert(thumbnailJsx.includes('resolveCourseTech'), 'CourseTechThumbnail must export resolveCourseTech');
  assert(thumbnailJsx.includes('SiPython') && thumbnailJsx.includes('SiReact'), 'Must support top technology icons');
  console.log('  ✓ CourseTechThumbnail cleanly maps course categories to modern technology icons');
  passedCount++;

  // 6. Verify CourseCatalog and CourseDetail use CourseTechThumbnail
  const catalogJsx = fs.readFileSync('src/pages/CourseCatalog.jsx', 'utf8');
  const detailJsx = fs.readFileSync('src/pages/CourseDetail.jsx', 'utf8');
  assert(catalogJsx.includes('<CourseTechThumbnail'), 'CourseCatalog must render CourseTechThumbnail');
  assert(!catalogJsx.includes('https://images.unsplash.com/photo-1555066931-4365d14bab8c'), 'CourseCatalog must not use unsplash stock image');
  assert(detailJsx.includes('<CourseTechThumbnail'), 'CourseDetail must render CourseTechThumbnail');
  assert(!detailJsx.includes('https://images.unsplash.com/photo-1555066931-4365d14bab8c'), 'CourseDetail must not use unsplash stock image');
  console.log('  ✓ CourseCatalog and CourseDetail showcase technology icons instead of stock photos');
  passedCount++;

  // 7. Verify StudentCourses and CheckoutModal use CourseTechThumbnail
  const studentCoursesJsx = fs.readFileSync('src/components/student/StudentCourses.jsx', 'utf8');
  const checkoutJsx = fs.readFileSync('src/components/common/CheckoutModal.jsx', 'utf8');
  assert(studentCoursesJsx.includes('<CourseTechThumbnail'), 'StudentCourses must render CourseTechThumbnail');
  assert(checkoutJsx.includes('<CourseTechThumbnail'), 'CheckoutModal must render CourseTechThumbnail');
  console.log('  ✓ Student dashboard and checkout modal use unified technology icons');
  passedCount++;

  console.log(`✨ All ${passedCount}/${totalCount} Test Deletion & Tech Thumbnail tests PASSED!`);
  return { passedCount, totalCount };
}

if (process.argv[1]?.endsWith('test-deletion-and-tech-thumbnails.test.js')) {
  runTestDeletionAndTechThumbnailsTests();
}
