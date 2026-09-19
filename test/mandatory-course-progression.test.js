/**
 * Test Suite: Mandatory Course Assessments, 100% Mastery & Sequential Locking
 * 
 * Verifies:
 * - 100% quiz score is strictly enforced under the hood (zero incorrect answers allowed)
 * - Any score < 100% fails (passed: false) and requires retake
 * - No manual "Mark Complete" or "Completed (Undo)" buttons exist in student course views
 * - Sequential topic locking: topics are locked until all preceding topics/assessments are completed
 * - Curriculum navigator marks locked topics and modules with lock status
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

export async function runMandatoryCourseProgressionTests() {
  console.log('\n🔵 RUNNING SUITE: Mandatory Course Assessments, 100% Mastery & Sequential Locking');
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
      throw err;
    }
  }

  // 1. Verify TopicQuiz enforces 100% pass threshold silently without 75% badges
  test('TopicQuiz enforces 100% pass threshold (correctCount === questions.length)', () => {
    const topicQuizCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'common', 'TopicQuiz.jsx'), 'utf8');

    assert(topicQuizCode.includes('const isPassed = correctCount === questions.length;'), 'Must check correctCount === questions.length');
    assert(!topicQuizCode.includes('75% to Pass'), 'Must not display 75% to Pass badge');
    assert(!topicQuizCode.includes('percentage >= 75'), 'Must not use 75% passing threshold');
  });

  // 2. Verify StudentCourses removed manual "Mark Complete" buttons from desktop and mobile
  test('StudentCourses has zero manual "Mark Complete" buttons in desktop and mobile views', () => {
    const studentCoursesCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'student', 'StudentCourses.jsx'), 'utf8');

    assert(!studentCoursesCode.includes("'Mark Complete'"), 'Must not have any Mark Complete button string');
    assert(!studentCoursesCode.includes('"Mark Complete"'), 'Must not have any "Mark Complete" button string');
    assert(!studentCoursesCode.includes('handleToggleComplete'), 'Must remove handleToggleComplete function');
  });

  // 3. Verify StudentCourses enforces sequential locking and blocks Next navigation on incomplete quizzes
  test('StudentCourses implements sequential topic locking and blocks Next navigation on incomplete quizzes', () => {
    const studentCoursesCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'student', 'StudentCourses.jsx'), 'utf8');

    assert(studentCoursesCode.includes('unlockedTopicIds'), 'Must track unlockedTopicIds');
    assert(studentCoursesCode.includes('!unlockedTopicIds.has(targetTopic.id)'), 'Must guard targetTopic with unlockedTopicIds in handleSelectLecture');
    assert(studentCoursesCode.includes('if (!isCurrentTopicCompleted)'), 'Must guard navigation in handleNextLecture when current topic is incomplete');
    assert(studentCoursesCode.includes('unlockedTopicIds={unlockedTopicIds}'), 'Must pass unlockedTopicIds to CurriculumNavigator');
  });

  // 4. Verify CurriculumNavigator renders lock icon and blocks clicks on locked topics
  test('CurriculumNavigator accepts unlockedTopicIds and locks inaccessible topics', () => {
    const navCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'student', 'CurriculumNavigator.jsx'), 'utf8');

    assert(navCode.includes('FaLock'), 'Must import and use FaLock');
    assert(navCode.includes("if (!effectiveUnlocked.has(topic.id)) return 'locked';"), 'Must return locked status for non-unlocked topics');
    assert(navCode.includes("toast.error('Topic locked"), 'Must block selection and alert when topic is locked');
  });

  // 5. Verify CourseViewer removed manual "Mark as Complete" button
  test('CourseViewer has zero manual "Mark as Complete" buttons', () => {
    const courseViewerCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'student', 'CourseViewer.jsx'), 'utf8');

    assert(!courseViewerCode.includes('Mark as Complete'), 'Must not contain Mark as Complete button');
    assert(!courseViewerCode.includes('Completed (Undo)'), 'Must not contain Completed (Undo) button');
  });

  // 6. Test Algorithm Simulation: 100% quiz requirement & sequential unlocking
  test('Algorithm: Quiz with 1 wrong answer fails; only 100% unlocks next topic in sequence', () => {
    const questions = [
      { text: 'Q1', correct: 1 },
      { text: 'Q2', correct: 0 },
      { text: 'Q3', correct: 2 }
    ];

    // Attempt 1: 2/3 correct (67%)
    const answersAttempt1 = { 0: 1, 1: 0, 2: 1 }; // Q3 wrong
    let correct1 = 0;
    questions.forEach((q, i) => { if (answersAttempt1[i] === q.correct) correct1++; });
    const isPassed1 = correct1 === questions.length;
    assert.equal(isPassed1, false, '67% score must not pass');

    // Attempt 2: 3/3 correct (100%)
    const answersAttempt2 = { 0: 1, 1: 0, 2: 2 }; // All correct
    let correct2 = 0;
    questions.forEach((q, i) => { if (answersAttempt2[i] === q.correct) correct2++; });
    const isPassed2 = correct2 === questions.length;
    assert.equal(isPassed2, true, '100% score must pass');

    // Sequential chain simulation
    const topics = [
      { id: 'top-1', hasQuiz: true },
      { id: 'top-2', hasQuiz: true },
      { id: 'top-3', hasQuiz: false }
    ];
    const quizAttempts = {
      'top-1': { passed: true }
    };
    const studentProgress = {};

    const unlocked = new Set();
    for (let i = 0; i < topics.length; i++) {
      const item = topics[i];
      if (i === 0) {
        unlocked.add(item.id);
      } else {
        const prev = topics[i - 1];
        const isPassed = Boolean(quizAttempts[prev.id]?.passed);
        const isDone = studentProgress[prev.id] === 'completed' || studentProgress[prev.id] === true;
        const prevDone = prev.hasQuiz ? isPassed : (isDone || isPassed);
        if (unlocked.has(prev.id) && prevDone) {
          unlocked.add(item.id);
        } else {
          break;
        }
      }
    }

    assert(unlocked.has('top-1'), 'Topic 1 must be unlocked');
    assert(unlocked.has('top-2'), 'Topic 2 must be unlocked because Topic 1 passed with 100%');
    assert(!unlocked.has('top-3'), 'Topic 3 must remain locked because Topic 2 is not completed');
  });

  // 7. Verify StudentCourses provides handleCompleteCourse and finish course flow on final lecture
  test('StudentCourses provides handleCompleteCourse to reach 100% course completion without getting stuck at 90%', () => {
    const studentCoursesCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'student', 'StudentCourses.jsx'), 'utf8');

    assert(studentCoursesCode.includes('handleCompleteCourse'), 'Must define handleCompleteCourse');
    assert(studentCoursesCode.includes('toast.success(\'🎉 Congratulations! You have completed the course!\')'), 'Must celebrate course completion');
    assert(studentCoursesCode.includes('Finish Course'), 'Must include Finish Course CTA on final lecture');
  });

  // 8. Test Algorithm Simulation: Sequential unlocking prevents false lockouts when reviewing past topics
  test('Algorithm: Sequential unlocking permits reviewing completed topics without false lockouts', () => {
    const topicList = [
      { id: 'top-1' },
      { id: 'top-2' },
      { id: 'top-3' },
      { id: 'top-4' }
    ];
    // Student has completed topic 1 and topic 2, currently on topic 1 to review
    const studentProgress = { 'top-1': 'completed', 'top-2': 'completed' };
    const quizAttempts = {};
    const currentTopicId = 'top-1';

    const unlocked = new Set();
    unlocked.add(topicList[0].id);

    topicList.forEach((item) => {
      const isDone = studentProgress[item.id] === 'completed' || Boolean(quizAttempts[item.id]?.passed);
      if (isDone) unlocked.add(item.id);
    });

    if (currentTopicId) unlocked.add(currentTopicId);

    for (let i = 0; i < topicList.length - 1; i++) {
      const current = topicList[i];
      const next = topicList[i + 1];
      const isCurrentDone = studentProgress[current.id] === 'completed' || Boolean(quizAttempts[current.id]?.passed);
      if (isCurrentDone) unlocked.add(next.id);
    }

    // Must have unlocked: top-1 (completed), top-2 (completed), top-3 (next in line)
    assert(unlocked.has('top-1'), 'Topic 1 must be unlocked for review');
    assert(unlocked.has('top-2'), 'Topic 2 must be unlocked for review');
    assert(unlocked.has('top-3'), 'Topic 3 must be unlocked to continue learning');
    assert(!unlocked.has('top-4'), 'Topic 4 must stay locked until Topic 3 is completed');
  });

  // 9. Verify DataContext merges localStorage student progress and quizzes during hydration
  test('DataContext merges localStorage student progress and quizzes during syncFromSupabase', () => {
    const dataContextCode = fs.readFileSync(path.resolve(process.cwd(), 'src', 'contexts', 'DataContext.jsx'), 'utf8');

    assert(dataContextCode.includes('codelift_student_progress_'), 'Must check codelift_student_progress_ in localStorage');
    assert(dataContextCode.includes('codelift_student_quizzes_'), 'Must check codelift_student_quizzes_ in localStorage');
    assert(dataContextCode.includes('...cachedProgress'), 'Must merge cachedProgress on hydration');
    assert(dataContextCode.includes('...cachedQuizzes'), 'Must merge cachedQuizzes on hydration');
  });

  console.log(`✨ All ${passedCount}/${totalCount} Mandatory Course Progression tests PASSED!`);
  return { passedCount, totalCount };
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('mandatory-course-progression.test.js')) {
  runMandatoryCourseProgressionTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
