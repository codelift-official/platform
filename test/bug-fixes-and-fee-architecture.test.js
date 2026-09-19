/**
 * Test Suite: Bug Fixes and Dynamic Fee Architecture
 * Validates fixes for:
 * 1. Course Final Submission Toast Behavior
 * 2. Test Cohort Allotment (No auto-allotment to all batches)
 * 3. Test Question ID Collision Prevention
 * 4. Test Edit and Management Flow
 * 5. Assignment Submission Viewer (GitHub / Drive links & comments)
 * 6. Assignment Dynamic Grading (no 10-mark restriction)
 * 7. Certificate Allotment & Eligible Student List Resolution
 * 8. Dynamic Batch Fee Sync & Course Marketplace Pricing
 * 9. Route Data Synchronization on Navigation
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { resolveCourseFee, resolveStudentFinalFee } from '../src/utils/feeUtils.js';

export async function runBugFixesAndFeeArchitectureTests() {
  console.log('\n🔵 RUNNING SUITE: Bug Fixes & Dynamic Fee Architecture');
  let passedCount = 0;
  let totalCount = 0;

  function test(name, fn) {
    totalCount++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      throw err;
    }
  }

  const rootDir = path.resolve();

  // Test 1: Course Final Submission Toast Behavior
  test('Bug 1: StudentCourses suppresses error toasts and fires celebration on course final submission', () => {
    const studentCoursesPath = path.join(rootDir, 'src', 'components', 'student', 'StudentCourses.jsx');
    const content = fs.readFileSync(studentCoursesPath, 'utf8');

    assert.ok(content.includes('handleCompleteCourse(true)'), 'Must pass bypassQuizCheck=true on final submit');
    assert.ok(content.includes('toast.dismiss()'), 'Must dismiss active error toasts on final completion celebration');
  });

  // Test 2: Test Cohort Allotment
  test('Bug 2: TestManager does not automatically allot newly created tests to all batches when none selected', () => {
    const testManagerPath = path.join(rootDir, 'src', 'components', 'admin', 'TestManager.jsx');
    const content = fs.readFileSync(testManagerPath, 'utf8');

    assert.ok(!content.includes('assignedBatchIds: selectedBatches.length > 0 ? selectedBatches : cohorts.map(b => b.id)'),
      'Must NOT fall back to assigning all cohorts when selectedBatches is empty');
    assert.ok(content.includes('assignedBatchIds: selectedBatches'),
      'Must assign strictly selectedBatches');
    assert.ok(content.includes('Select All'), 'Should provide convenient cohort selection buttons');
  });

  // Test 3: Test Question ID Collision Prevention
  test('Bug 3: supabaseDataService generates globally unique question IDs preventing test_questions_pkey collisions', () => {
    const supabaseServicePath = path.join(rootDir, 'src', 'services', 'supabaseDataService.js');
    const content = fs.readFileSync(supabaseServicePath, 'utf8');

    assert.ok(content.includes('idx + 1') && content.includes('Math.random().toString(36)'),
      'Must generate globally unique question IDs across multiple tests');
  });

  // Test 4: Test Edit & Management Flow
  test('Bug 4: TestManager provides complete Edit Test flow, inline validations, and retains questions', () => {
    const testManagerPath = path.join(rootDir, 'src', 'components', 'admin', 'TestManager.jsx');
    const content = fs.readFileSync(testManagerPath, 'utf8');

    assert.ok(content.includes('handleOpenEdit'), 'Must have handleOpenEdit function');
    assert.ok(content.includes('updateTest('), 'Must call updateTest for editing existing tests');
    assert.ok(content.includes("editingTestId ? 'Edit Assessment Test' : 'Build New Test Assessment'"),
      'Modal header must reflect edit vs create state');
  });

  // Test 5: Assignment Submission Viewer
  test('Bug 5: GradingPanel provides clickable GitHub/Drive links and student notes viewer for admin', () => {
    const gradingPanelPath = path.join(rootDir, 'src', 'components', 'admin', 'GradingPanel.jsx');
    const content = fs.readFileSync(gradingPanelPath, 'utf8');

    assert.ok(content.includes('viewingSub'), 'Must have viewingSub modal state');
    assert.ok(content.includes('Submitted Asset & Repository Links'), 'Must show submission files and links');
    assert.ok(content.includes('setViewingSub(sub)'), 'Must have View Work button in table');
    assert.ok(content.includes('Student Notes & Comments'), 'Must render student notes');
  });

  // Test 6: Assignment Dynamic Marks
  test('Bug 6: GradingPanel enforces dynamic assignment maxMarks without hardcoded 10-mark limit', () => {
    const gradingPanelPath = path.join(rootDir, 'src', 'components', 'admin', 'GradingPanel.jsx');
    const content = fs.readFileSync(gradingPanelPath, 'utf8');

    assert.ok(!content.includes('maxMarks || 10'), 'Must not cap default maxMarks at 10');
    assert.ok(content.includes('activeMaxMarks'), 'Must dynamically calculate activeMaxMarks');
    assert.ok(content.includes('max={activeMaxMarks}'), 'Grade input must use dynamic activeMaxMarks');
  });

  // Test 7: Certificate Status Mapping & Eligible Student Resolution
  test('Bug 7: supabaseDataService maps certificate status and CertificateDesigner safely checks issued status', () => {
    const supabaseServicePath = path.join(rootDir, 'src', 'services', 'supabaseDataService.js');
    const dbContent = fs.readFileSync(supabaseServicePath, 'utf8');
    assert.ok(dbContent.includes("status: cert.status || (cert.is_issued ? 'issued' : 'pending')"),
      'supabaseDataService must map status field on certificates');

    const certDesignerPath = path.join(rootDir, 'src', 'components', 'admin', 'CertificateDesigner.jsx');
    const designerContent = fs.readFileSync(certDesignerPath, 'utf8');
    assert.ok(designerContent.includes("(c.isIssued || c.status === 'issued' || c.status === 'approved')"),
      'CertificateDesigner must recognize isIssued or status=issued');
    assert.ok(designerContent.includes('rec.course?.title || rec.batch?.name'),
      'Issue Now must safely resolve course title');
  });

  // Test 8: Fee Architecture & Dynamic Batch Fee Sync
  test('Bug 8: Fee Architecture respects individual course fee on marketplace and batch fee as final for student', () => {
    // 1. Marketplace individual course fee test
    const standaloneCourse = { id: 'c1', title: 'React Masterclass', price: 1500, fee: 1500 };
    const cohortBatch = { id: 'b1', name: 'Web Dev Cohort', feeAmount: 3000, courseIds: ['c1'] };

    const resolvedCourseFee = resolveCourseFee(standaloneCourse, [cohortBatch]);
    assert.strictEqual(resolvedCourseFee.price, 1500, 'Marketplace should respect course price (₹1500), not batch price');
    assert.strictEqual(resolvedCourseFee.feeFormatted, '₹1,500');

    // 1b. Legacy course with price > 0 and isFree: true (e.g. fruits-and-colors-test-course)
    const fruitsCourse = {
      id: 'course-fruit',
      slug: 'fruits-and-colors-test-course',
      title: 'Fruits and Colors Test Course',
      price: 1500,
      isFree: true
    };
    const fruitsResolved = resolveCourseFee(fruitsCourse, []);
    assert.strictEqual(fruitsResolved.isFree, false, 'Course with price > 0 must have isFree: false');
    assert.strictEqual(fruitsResolved.price, 1500, 'Course price must be 1500');
    assert.strictEqual(fruitsResolved.feeFormatted, '₹1,500', 'Formatted fee must be ₹1,500');

    // 2. Student batch final fee test
    const studentInBatch = { id: 's1', name: 'Alice', batchId: 'b1', totalFee: 3000 };
    const resolvedFinalFee = resolveStudentFinalFee(studentInBatch, cohortBatch, [standaloneCourse]);
    assert.strictEqual(resolvedFinalFee, 3000, 'Batch fee (₹3000) must be the final fee for student view');

    // 3. Admin BatchManager & DataContext sync verification
    const batchManagerPath = path.join(rootDir, 'src', 'components', 'admin', 'BatchManager.jsx');
    const batchContent = fs.readFileSync(batchManagerPath, 'utf8');
    assert.ok(batchContent.includes('Catalog Sum of Attached Courses'), 'Must display catalog sum calculation in Tab 4');
    assert.ok(batchContent.includes('Cohort Batch Fee (Final tuition for enrolled students)'), 'Must indicate batch fee is final');

    const dataContextPath = path.join(rootDir, 'src', 'contexts', 'DataContext.jsx');
    const dataContent = fs.readFileSync(dataContextPath, 'utf8');
    assert.ok(dataContent.includes('totalFee: newFee'), 'updateBatch must synchronize totalFee to enrolled students');

    // 4. Admin FeeManager search & filter verification
    const feeManagerPath = path.join(rootDir, 'src', 'components', 'admin', 'FeeManager.jsx');
    const feeContent = fs.readFileSync(feeManagerPath, 'utf8');
    assert.ok(feeContent.includes('modalStudentSearch'), 'FeeManager must have student search input');
    assert.ok(feeContent.includes('modalBatchFilter'), 'FeeManager must have cohort batch filter');
    assert.ok(feeContent.includes('batchId: targetStudent?.batchId'), 'FeeManager must link batchId to feePayload');

    // 5. CourseManager mandatory price
    const courseManagerPath = path.join(rootDir, 'src', 'components', 'admin', 'CourseManager.jsx');
    const courseContent = fs.readFileSync(courseManagerPath, 'utf8');
    assert.ok(courseContent.includes('Individual Course Fee (₹)'), 'CourseManager must have mandatory course fee input');
  });

  // Test 9: Route Data Synchronization on Route Navigation
  test('Bug 9: App.jsx provides RouteDataSyncer component calling syncFromSupabase on route navigation', () => {
    const appPath = path.join(rootDir, 'src', 'App.jsx');
    const appContent = fs.readFileSync(appPath, 'utf8');

    assert.ok(appContent.includes('function RouteDataSyncer()'), 'App.jsx must define RouteDataSyncer');
    assert.ok(appContent.includes('<RouteDataSyncer />'), 'App.jsx must render RouteDataSyncer within BrowserRouter');
    assert.ok(appContent.includes('syncFromSupabase'), 'RouteDataSyncer must call syncFromSupabase on pathname change');
  });

  console.log(`✨ All ${passedCount}/${totalCount} Bug Fixes & Dynamic Fee Architecture tests PASSED!`);
  return { passedCount, totalCount };
}
