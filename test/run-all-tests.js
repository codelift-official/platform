/**
 * Master Test Runner for CodeLift Platform
 * 
 * Runs critical test suites:
 * 1. Entity Associations & Batch Synchronization
 * 2. Course JSON Import/Export & Quiz Assessment Engine
 */

import { runEntityAssociationTests } from './entity-associations.test.js';
import { runCourseImportExportTests } from './course-import-export.test.js';
import { runFeeManagementTests } from './fee-management.test.js';
import { runCookieThemePersistenceTests } from './cookie-theme-persistence.test.js';
import { runThemeConsistencyTests } from './verify-theme-consistency.js';
import { runBatchCourseAndFeeTests } from './batch-course-and-fee.test.js';
import { runEnrollmentAndMarketplaceTests } from './enrollment-journey-and-marketplace.test.js';
import { runProblemEditorialTests } from './problem-solutions.test.js';
import { runBatchManagementAndQuizzesTests } from './batch-management-and-quizzes.test.js';
import { runTestDeletionAndTechThumbnailsTests } from './test-deletion-and-tech-thumbnails.test.js';
import { runHomepageMobileAndThemeTests } from './homepage-mobile-and-theme.test.js';
import { run56ModuleCourseImportVisibilityTests } from './course-import-56m-visibility.test.js';
import { runMandatoryCourseProgressionTests } from './mandatory-course-progression.test.js';
import { runArenaCurriculumTests } from './code-arena-curriculum.test.js';

async function runAll() {
  console.log('===============================================================');
  console.log('🚀 CODELIFT AUTOMATED REGRESSION & INTEGRITY TEST RUNNER');
  console.log('===============================================================');

  const startTime = Date.now();
  let totalPassed = 0;
  let totalTests = 0;
  const suiteResults = [];

  try {
    const r1 = await runEntityAssociationTests();
    totalPassed += r1.passedCount;
    totalTests += r1.totalCount;
    suiteResults.push({ name: 'Entity Associations & Batch Synchronization', passed: r1.passedCount, total: r1.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Entity Associations & Batch Synchronization', error: err.message, ok: false });
  }

  try {
    const r2 = await runCourseImportExportTests();
    totalPassed += r2.passedCount;
    totalTests += r2.totalCount;
    suiteResults.push({ name: 'Course Import/Export & Assessment Grading', passed: r2.passedCount, total: r2.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Course Import/Export & Assessment Grading', error: err.message, ok: false });
  }

  try {
    const r3 = await runFeeManagementTests();
    totalPassed += r3.passedCount;
    totalTests += r3.totalCount;
    suiteResults.push({ name: 'Fee Recording & Ledger Synchronization', passed: r3.passedCount, total: r3.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Fee Recording & Ledger Synchronization', error: err.message, ok: false });
  }

  try {
    const r4 = await runCookieThemePersistenceTests();
    totalPassed += r4.passedCount;
    totalTests += r4.totalCount;
    suiteResults.push({ name: 'Cookie-Based Theme Persistence & Resolution', passed: r4.passedCount, total: r4.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Cookie-Based Theme Persistence & Resolution', error: err.message, ok: false });
  }

  try {
    const r5 = runThemeConsistencyTests();
    totalPassed += r5.passedCount;
    totalTests += r5.totalCount;
    suiteResults.push({ name: 'UI Theme Consistency & Design System Integrity', passed: r5.passedCount, total: r5.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'UI Theme Consistency & Design System Integrity', error: err.message, ok: false });
  }

  try {
    const r6 = runBatchCourseAndFeeTests();
    totalPassed += r6.passedCount;
    totalTests += r6.totalCount;
    suiteResults.push({ name: 'Batch Course Attachment, Student Fees & Mobile UI Fixes', passed: r6.passedCount, total: r6.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Batch Course Attachment, Student Fees & Mobile UI Fixes', error: err.message, ok: false });
  }

  try {
    const r7 = runEnrollmentAndMarketplaceTests();
    totalPassed += r7.passedCount;
    totalTests += r7.totalCount;
    suiteResults.push({ name: 'Smooth WhatsApp Enrollment Journey & Marketplace UI', passed: r7.passedCount, total: r7.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Smooth WhatsApp Enrollment Journey & Marketplace UI', error: err.message, ok: false });
  }

  try {
    const r8 = await runProblemEditorialTests();
    totalPassed += r8.passedCount;
    totalTests += r8.totalCount;
    suiteResults.push({ name: 'Problem Arena Editorials & Detailed Explanations', passed: r8.passedCount, total: r8.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Problem Arena Editorials & Detailed Explanations', error: err.message, ok: false });
  }

  try {
    const r9 = runBatchManagementAndQuizzesTests();
    totalPassed += r9.passedCount;
    totalTests += r9.totalCount;
    suiteResults.push({ name: 'Batch Management, Safe Deletion & Course Quizzes', passed: r9.passedCount, total: r9.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Batch Management, Safe Deletion & Course Quizzes', error: err.message, ok: false });
  }

  try {
    const r10 = runTestDeletionAndTechThumbnailsTests();
    totalPassed += r10.passedCount;
    totalTests += r10.totalCount;
    suiteResults.push({ name: 'Test Deletion, Categories & Tech Thumbnails', passed: r10.passedCount, total: r10.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Test Deletion, Categories & Tech Thumbnails', error: err.message, ok: false });
  }

  try {
    const r11 = await runHomepageMobileAndThemeTests();
    totalPassed += r11.passedCount;
    totalTests += r11.totalCount;
    suiteResults.push({ name: 'Homepage Mobile Fixes & Public Theme Selector', passed: r11.passedCount, total: r11.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Homepage Mobile Fixes & Public Theme Selector', error: err.message, ok: false });
  }

  try {
    const r12 = await run56ModuleCourseImportVisibilityTests();
    totalPassed += r12.passedCount;
    totalTests += r12.totalCount;
    suiteResults.push({ name: '56-Module Course Import & Content Visibility', passed: r12.passedCount, total: r12.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: '56-Module Course Import & Content Visibility', error: err.message, ok: false });
  }

  try {
    const r13 = await runMandatoryCourseProgressionTests();
    totalPassed += r13.passedCount;
    totalTests += r13.totalCount;
    suiteResults.push({ name: 'Mandatory Course Assessments & Sequential Locking', passed: r13.passedCount, total: r13.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Mandatory Course Assessments & Sequential Locking', error: err.message, ok: false });
  }

  try {
    const r14 = runArenaCurriculumTests();
    totalPassed += r14.passedCount;
    totalTests += r14.totalCount;
    suiteResults.push({ name: 'Code Arena 43-Problem Curriculum & Execution Integrity', passed: r14.passedCount, total: r14.totalCount, ok: true });
  } catch (err) {
    suiteResults.push({ name: 'Code Arena 43-Problem Curriculum & Execution Integrity', error: err.message, ok: false });
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const allPassed = suiteResults.every(s => s.ok);

  console.log('\n===============================================================');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('===============================================================');
  suiteResults.forEach((s) => {
    const status = s.ok ? '✅ PASS' : '❌ FAIL';
    console.log(` ${status} | ${s.name} (${s.passed}/${s.total})`);
  });
  console.log('---------------------------------------------------------------');
  console.log(`Total Assertions Passed: ${totalPassed}/${totalTests}`);
  console.log(`Execution Time:          ${elapsed}s`);
  console.log('===============================================================');

  if (allPassed) {
    console.log('🎉 ALL INTEGRITY TESTS PASSED! Safe to push.');
    process.exit(0);
  } else {
    console.error('❌ ONE OR MORE TEST SUITES FAILED! Do not push.');
    process.exit(1);
  }
}

runAll();
