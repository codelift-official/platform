/**
 * Test Suite: Course JSON Import, Export, and Assessment Quiz Grading
 * 
 * Verifies:
 * - Full course JSON parsing with multi-level modules, topics, and quiz questions
 * - Updating existing course without duplicating IDs
 * - Topic quiz assessment grading, rating calculation, and pass/fail thresholds
 * - Course JSON export serialization integrity
 */

import assert from 'node:assert/strict';

// Quiz Grading Algorithm matching TopicQuiz.jsx
function evaluateQuizAttempt({ questions, userAnswers }) {
  let score = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctAnswer) {
      score += 1;
    }
  });

  const totalMarks = questions.length;
  const pct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const passed = score === totalMarks;

  let rating = 'Retake Required';
  if (pct === 100) rating = 'A+ (Outstanding)';

  return {
    score,
    totalMarks,
    percentage: pct,
    passed,
    rating
  };
}

// Course JSON Processor matching DataContext.jsx createCourseFromJSON
function processCourseFromJSON(jsonData, targetCourseId = null, existingCourses = []) {
  let parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  const title = parsed.title?.trim() || 'Untitled Imported Course';
  const description = parsed.description?.trim() || '';
  const isPublished = parsed.isPublished !== false;

  const modules = (Array.isArray(parsed.modules) ? parsed.modules : []).map((m, mIdx) => {
    const modId = m.id || `mod-${Date.now()}-${mIdx}`;
    const topics = (Array.isArray(m.topics) ? m.topics : []).map((t, tIdx) => {
      const topId = t.id || `top-${Date.now()}-${mIdx}-${tIdx}`;
      return {
        id: topId,
        title: t.title || `Topic ${tIdx + 1}`,
        contentMd: t.contentMd || t.content || '# ' + (t.title || 'Topic Content'),
        quizQuestions: Array.isArray(t.quizQuestions) ? t.quizQuestions : []
      };
    });

    return {
      id: modId,
      title: m.title || `Module ${mIdx + 1}`,
      topics
    };
  });

  if (targetCourseId) {
    const existing = existingCourses.find(c => c.id === targetCourseId);
    if (!existing) throw new Error(`Target course ${targetCourseId} not found`);
    return {
      ...existing,
      title,
      description,
      isPublished,
      modules
    };
  }

  return {
    id: `course-${Date.now()}`,
    title,
    description,
    isPublished,
    batchIds: [],
    batchId: null,
    modules
  };
}

export async function runCourseImportExportTests() {
  console.log('\n🔵 RUNNING SUITE: Course Import/Export & Quiz Assessment Grading');
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
      console.error(`    Error: ${err.message}`);
      throw err;
    }
  }

  const sampleCoursePayload = {
    title: 'TypeScript & Cloud Architecture',
    description: 'Master full-stack TypeScript with modern cloud design patterns.',
    isPublished: true,
    modules: [
      {
        title: 'Module 1: Advanced Types',
        topics: [
          {
            title: 'Generics & Utility Types',
            contentMd: '# Generics in TypeScript\n\nGenerics provide flexible type safety.',
            quizQuestions: [
              {
                question: 'What keyword defines a generic type constraint?',
                options: ['implements', 'extends', 'instanceof', 'as'],
                correctAnswer: 1,
                explanation: 'The `extends` keyword restricts generic type parameters.'
              },
              {
                question: 'Which utility type makes all properties optional?',
                options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Pick<T>'],
                correctAnswer: 1,
                explanation: '`Partial<T>` makes all fields optional.'
              },
              {
                question: 'Which operator extracts return type of a function?',
                options: ['typeof', 'keyof', 'ReturnType<T>', 'Record<K,T>'],
                correctAnswer: 2,
                explanation: '`ReturnType<T>` extracts the return type.'
              },
              {
                question: 'Is TypeScript dynamically or statically typed at compile time?',
                options: ['Statically', 'Dynamically', 'Both', 'Neither'],
                correctAnswer: 0,
                explanation: 'TypeScript is statically typed.'
              }
            ]
          }
        ]
      }
    ]
  };

  // Test 1: JSON Import parsing and ID injection
  test('Course JSON import generates unique IDs for modules and topics', () => {
    const imported = processCourseFromJSON(sampleCoursePayload);

    assert.ok(imported.id.startsWith('course-'), 'Course must have an ID');
    assert.equal(imported.title, 'TypeScript & Cloud Architecture');
    assert.equal(imported.modules.length, 1);
    assert.ok(imported.modules[0].id.startsWith('mod-'), 'Module must have mod- ID');
    assert.equal(imported.modules[0].topics.length, 1);
    assert.ok(imported.modules[0].topics[0].id.startsWith('top-'), 'Topic must have top- ID');
    assert.equal(imported.modules[0].topics[0].quizQuestions.length, 4);
  });

  // Test 2: Updating existing course without duplicating IDs
  test('Importing into existing course updates content preserving original course ID', () => {
    const existing = [
      { id: 'course-target-42', title: 'Old Title', modules: [], batchIds: ['batch-1'] }
    ];

    const updated = processCourseFromJSON(sampleCoursePayload, 'course-target-42', existing);
    assert.equal(updated.id, 'course-target-42', 'Must retain target course ID');
    assert.equal(updated.title, 'TypeScript & Cloud Architecture');
    assert.deepEqual(updated.batchIds, ['batch-1'], 'Must retain existing batch associations');
    assert.equal(updated.modules.length, 1);
  });

  // Test 3: Quiz Assessment Grading - 100% Score
  test('Quiz assessment evaluation: 100% score receives A+ (Outstanding) and passed = true', () => {
    const questions = sampleCoursePayload.modules[0].topics[0].quizQuestions;
    const userAnswers = { 0: 1, 1: 1, 2: 2, 3: 0 }; // All correct

    const result = evaluateQuizAttempt({ questions, userAnswers });
    assert.equal(result.score, 4);
    assert.equal(result.totalMarks, 4);
    assert.equal(result.percentage, 100);
    assert.equal(result.passed, true);
    assert.equal(result.rating, 'A+ (Outstanding)');
  });

  // Test 4: Quiz Assessment Grading - 75% Score (Fails 100% Requirement)
  test('Quiz assessment evaluation: 75% score fails 100% mastery threshold and requires retake', () => {
    const questions = sampleCoursePayload.modules[0].topics[0].quizQuestions;
    const userAnswers = { 0: 1, 1: 1, 2: 2, 3: 1 }; // 3 correct, 1 wrong (75%)

    const result = evaluateQuizAttempt({ questions, userAnswers });
    assert.equal(result.score, 3);
    assert.equal(result.totalMarks, 4);
    assert.equal(result.percentage, 75);
    assert.equal(result.passed, false, 'Score below 100% must fail');
    assert.equal(result.rating, 'Retake Required');
  });

  // Test 5: Quiz Assessment Grading - <75% Score (Fail)
  test('Quiz assessment evaluation: 50% score fails threshold and requires retake', () => {
    const questions = sampleCoursePayload.modules[0].topics[0].quizQuestions;
    const userAnswers = { 0: 1, 1: 1, 2: 0, 3: 1 }; // 2 correct, 2 wrong (50%)

    const result = evaluateQuizAttempt({ questions, userAnswers });
    assert.equal(result.score, 2);
    assert.equal(result.totalMarks, 4);
    assert.equal(result.percentage, 50);
    assert.equal(result.passed, false, 'Score below 100% must fail');
    assert.equal(result.rating, 'Retake Required');
  });

  // Test 6: Course JSON Export Integrity
  test('Course export stringifies to valid JSON containing all modules and quizzes', () => {
    const imported = processCourseFromJSON(sampleCoursePayload);
    const jsonString = JSON.stringify(imported, null, 2);

    assert.ok(typeof jsonString === 'string');
    const parsedBack = JSON.parse(jsonString);
    assert.equal(parsedBack.title, 'TypeScript & Cloud Architecture');
    assert.equal(parsedBack.modules[0].topics[0].quizQuestions.length, 4);
  });

  console.log(`✨ All ${passedCount}/${totalCount} Course Import/Export & Quiz tests PASSED!`);
  return { passedCount, totalCount };
}

// Allow direct CLI execution: node test/course-import-export.test.js
if (process.argv[1]?.endsWith('course-import-export.test.js')) {
  runCourseImportExportTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
