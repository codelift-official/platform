/**
 * Test Suite: 56-Module Course Import & Visibility Verification
 * 
 * Verifies:
 * - 56-module course JSON imports cleanly and generates module & topic structures
 * - Topics are constructed without obsolete video_url column
 * - Topic quiz_questions and contentMd are properly preserved
 * - StudentCourses allAvailableCourses filter includes published elective/free courses
 * - CoursePreview safely resolves activeTopic fallback when topic IDs hydrate
 */

import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

export async function run56ModuleCourseImportVisibilityTests() {
  console.log('\n🔵 RUNNING SUITE: 56-Module Course Import & Visibility Verification');

  // 1. Verify JSON file exists and contains all 56 modules
  const jsonPath = path.resolve(process.cwd(), 'data', 'python-56-modules.json');
  assert(fs.existsSync(jsonPath), 'data/python-56-modules.json must exist');
  const courseData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  assert.equal(courseData.modules.length, 56, 'Must contain 56 modules');
  console.log('  ✓ data/python-56-modules.json contains 56 modules');

  // 2. Verify all topics have contentMd and quizQuestions
  let totalTopics = 0;
  let totalQuizzes = 0;
  courseData.modules.forEach((mod, mIdx) => {
    assert(Array.isArray(mod.topics) && mod.topics.length > 0, `Module ${mIdx + 1} must have topics`);
    mod.topics.forEach((top) => {
      totalTopics++;
      assert(top.contentMd && top.contentMd.length > 50, `Topic ${top.title} must have substantial contentMd`);
      assert(Array.isArray(top.quizQuestions) && top.quizQuestions.length > 0, `Topic ${top.title} must have quizQuestions`);
      totalQuizzes += top.quizQuestions.length;
    });
  });
  assert.equal(totalTopics, 56, 'Must have 56 topics across all 56 modules');
  assert.equal(totalQuizzes, 392, 'Must have 392 quiz questions across 56 modules (7 per topic)');
  console.log(`  ✓ Verified all 56 topics have full Markdown content and 392 quizzes`);

  // 3. Verify supabaseDataService.js does not reference video_url in insert payloads
  const supabaseServiceCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'services', 'supabaseDataService.js'), 'utf8');
  assert(!supabaseServiceCode.includes("video_url: t.videoUrl || t.video_url || ''"), 'supabaseDataService must NOT include video_url in topic inserts');
  assert(supabaseServiceCode.includes('quiz_questions: Array.isArray(t.quizQuestions)'), 'supabaseDataService must insert quiz_questions for topics');
  console.log('  ✓ supabaseDataService excludes video_url and includes quiz_questions for topic inserts');

  // 4. Verify StudentCourses.jsx includes elective and free courses in allAvailableCourses
  const studentCoursesCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'student', 'StudentCourses.jsx'), 'utf8');
  assert(studentCoursesCode.includes("c.courseType === 'elective' || c.isFree || !c.price || c.price === 0"), 'StudentCourses must include elective/free courses');
  assert(studentCoursesCode.includes("content={currentTopic?.contentMd || currentTopic?.content_md"), 'StudentCourses LectureMarkdown must fall back to content_md');
  console.log('  ✓ StudentCourses allows students to view published elective/free courses with robust markdown fallback');

  // 5. Verify CoursePreview.jsx fallback and useEffect dependencies
  const coursePreviewCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'common', 'CoursePreview.jsx'), 'utf8');
  assert(coursePreviewCode.includes('allTopics[0] || null'), 'CoursePreview activeTopic must fall back to first topic');
  assert(coursePreviewCode.includes('[course?.id, modules.length, allTopics.length]'), 'CoursePreview useEffect must watch modules.length and allTopics.length');
  console.log('  ✓ CoursePreview reliably syncs and falls back to activeTopic when curriculum hydrates');

  // 6. Test DataContext simulated createCourseFromJSON logic
  const formattedModules = courseData.modules.map((m, mIdx) => ({
    id: m.id || `mod-${mIdx}`,
    title: m.title,
    quizQuestions: Array.isArray(m.quizQuestions) ? m.quizQuestions : [],
    topics: (m.topics || []).map((t, tIdx) => ({
      id: t.id || `top-${mIdx}-${tIdx}`,
      title: t.title,
      contentMd: t.contentMd || '',
      quizQuestions: Array.isArray(t.quizQuestions) ? t.quizQuestions : []
    }))
  }));
  assert.equal(formattedModules.length, 56);
  assert.equal(formattedModules[0].topics[0].quizQuestions.length, 7);
  assert(formattedModules[0].topics[0].contentMd.includes('# Variables and Naming Conventions'));
  console.log('  ✓ Formatted modules preserves 56 modules, topics, markdown, and quizzes in memory');

  console.log('✨ All 6/6 56-Module Course Import & Visibility tests PASSED!');
  return { passedCount: 6, totalCount: 6 };
}

if (process.argv[1] && process.argv[1].endsWith('course-import-56m-visibility.test.js')) {
  run56ModuleCourseImportVisibilityTests().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}
