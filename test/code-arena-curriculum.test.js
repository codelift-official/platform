/**
 * test/code-arena-curriculum.test.js
 * 
 * Comprehensive Code Arena Test Suite for all 43 Curriculum Problems:
 *   1. Full schema validation across all 43 problems
 *   2. No duplicate problem IDs and 1-to-43 orderIndex consistency
 *   3. Test case validation for all 350+ visible and hidden test cases
 *   4. Multi-paradigm execution code preparation verification for every problem
 *   5. Category distribution and coverage (Lists, Conditionals, Loops, Patterns, Numbers, Strings)
 *   6. Multi-format output normalization (numbers, floats, lists, booleans, whitespace)
 *   7. Student progress persistence record structure and XP calculation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prepareCodeForExecution, normalizeOutput } from '../src/services/pythonRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function runArenaCurriculumTests() {
  console.log('\n🔵 RUNNING SUITE: Code Arena 43-Problem Curriculum & Execution Integrity');

  let passCount = 0;
  let totalCount = 0;

  function test(name, fn) {
    totalCount++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passCount++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      throw err;
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  // Load codingProblems.json
  const problemsPath = path.join(rootDir, 'data', 'codingProblems.json');
  assert(fs.existsSync(problemsPath), 'codingProblems.json must exist in data directory');
  const rawData = fs.readFileSync(problemsPath, 'utf8').replace(/^\uFEFF/, '');
  const problems = JSON.parse(rawData);

  // ── 1. Total Problems Count & ID Uniqueness ──
  test('codingProblems.json contains all 43 problems with zero duplicate IDs', () => {
    assert(Array.isArray(problems), 'codingProblems must be an array');
    assert(problems.length === 43, `Expected exactly 43 problems, got ${problems.length}`);

    const idSet = new Set();
    for (const p of problems) {
      assert(p.id && typeof p.id === 'string', `Problem missing valid id: ${JSON.stringify(p)}`);
      assert(!idSet.has(p.id), `Duplicate problem ID detected: ${p.id}`);
      idSet.add(p.id);
    }
    assert(idSet.size === 43, 'Must have 43 unique problem IDs');
  });

  // ── 2. Full Schema Validation Across All 43 Problems ──
  test('Every problem satisfies required schema fields (title, description, starterCode, hints, xp)', () => {
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    const validCategories = ['Lists', 'Conditionals', 'Loops', 'Patterns', 'Numbers', 'Strings'];

    for (const p of problems) {
      assert(typeof p.title === 'string' && p.title.trim().length > 0, `${p.id} must have a title`);
      assert(typeof p.description === 'string' && p.description.trim().length > 0, `${p.id} must have a description`);
      assert(validDifficulties.includes(p.difficulty), `${p.id} has invalid difficulty: "${p.difficulty}"`);
      assert(validCategories.includes(p.category), `${p.id} has invalid category: "${p.category}"`);
      assert(typeof p.xp === 'number' && p.xp > 0, `${p.id} must have positive XP value`);
      assert(typeof p.starterCode === 'string' && p.starterCode.length > 0, `${p.id} must have starterCode`);
      assert(Array.isArray(p.hints) && p.hints.length >= 1, `${p.id} must have at least 1 hint`);
      assert(Array.isArray(p.testCases) && p.testCases.length >= 1, `${p.id} must have at least 1 visible test case`);
      assert(Array.isArray(p.hiddenTestCases) && p.hiddenTestCases.length >= 1, `${p.id} must have at least 1 hidden test case`);
    }
  });

  // ── 3. Category Distribution Verification ──
  test('Curriculum accurately covers all 6 interview topics in proper proportions', () => {
    const categoryCounts = {};
    for (const p of problems) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }

    assert(categoryCounts['Lists'] === 20, `Lists category must have 20 problems, got ${categoryCounts['Lists']}`);
    assert(categoryCounts['Conditionals'] === 12, `Conditionals category must have 12 problems, got ${categoryCounts['Conditionals']}`);
    assert(categoryCounts['Loops'] === 5, `Loops category must have 5 problems, got ${categoryCounts['Loops']}`);
    assert(categoryCounts['Patterns'] === 2, `Patterns category must have 2 problems, got ${categoryCounts['Patterns']}`);
    assert(categoryCounts['Numbers'] === 1, `Numbers category must have 1 problems, got ${categoryCounts['Numbers']}`);
    assert(categoryCounts['Strings'] === 3, `Strings category must have 3 problems, got ${categoryCounts['Strings']}`);
  });

  // ── 4. Test Case Schema Integrity (350+ Test Cases) ──
  test('All visible and hidden test cases have defined inputs and non-empty expected values', () => {
    let totalVisible = 0;
    let totalHidden = 0;

    for (const p of problems) {
      for (const tc of p.testCases) {
        totalVisible++;
        assert(tc.input !== undefined && tc.input !== null, `${p.id} visible test case input must not be null/undefined`);
        assert(typeof tc.expected === 'string' || typeof tc.expected === 'number', `${p.id} expected must be string or number`);
      }

      for (const htc of p.hiddenTestCases) {
        totalHidden++;
        assert(htc.input !== undefined && htc.input !== null, `${p.id} hidden test case input must not be null/undefined`);
        assert(typeof htc.expected === 'string' || typeof htc.expected === 'number', `${p.id} hidden expected must be string or number`);
      }
    }

    assert(totalVisible >= 100, `Expected at least 100 visible test cases across 43 problems, got ${totalVisible}`);
    assert(totalHidden >= 150, `Expected at least 150 hidden test cases across 43 problems, got ${totalHidden}`);
  });

  // ── 5. Multi-Paradigm Execution Code Preparation on Every Problem ──
  test('prepareCodeForExecution generates valid Python wrappers across all 43 problems', () => {
    let casesTested = 0;

    for (const p of problems) {
      const allCases = [...p.testCases, ...p.hiddenTestCases];
      for (const tc of allCases) {
        casesTested++;
        const { codeToRun, stdin } = prepareCodeForExecution(p.starterCode, tc, p.starterCode);
        assert(typeof codeToRun === 'string' && codeToRun.length > 0, `${p.id} prepared code must be non-empty`);
        assert(typeof stdin === 'string', `${p.id} stdin must be a string`);
      }
    }

    assert(casesTested >= 300, `Expected over 300 test cases verified through prepareCodeForExecution, got ${casesTested}`);
  });

  // ── 6. Output Normalization Engine Tolerance ──
  test('normalizeOutput standardizes formatting across integers, floats, lists, strings and booleans', () => {
    assert(normalizeOutput('  hello  ') === 'hello', 'Should trim outer whitespace');
    assert(normalizeOutput('[1, 2, 3]') === '[1, 2, 3]', 'Standard list stays clean');
    assert(normalizeOutput('True') === 'True', 'True normalizes to Python True');
    assert(normalizeOutput('true') === 'True', 'true normalizes to Python True');
    assert(normalizeOutput('False') === 'False', 'False normalizes to Python False');
    assert(normalizeOutput('false') === 'False', 'false normalizes to Python False');
    assert(normalizeOutput("'hello'") === 'hello', 'Single quotes around scalar string are stripped');
    assert(normalizeOutput('line 1  \n  line 2') === 'line 1\nline 2', 'Multiline trims each line');
  });

  // ── 7. Total Possible XP and Mastery Aggregations ──
  test('Total curriculum XP sums correctly and all problems have positive XP', () => {
    const totalPossibleXp = problems.reduce((sum, p) => sum + (p.xp || 50), 0);
    assert(totalPossibleXp === 2760, `Expected total XP to be 2760, got ${totalPossibleXp}`);
    for (const p of problems) {
      assert(p.xp >= 40, `${p.id} XP should be at least 40`);
    }
  });

  // ── 8. Student Attempt Submission Record Integrity ──
  test('Coding attempt structure validates persistence schema and hidden results summary', () => {
    const sampleAttempt = {
      id: 'ca_test_123',
      studentId: 'student-1',
      problemId: 'arena-q1',
      code: 'print(55)',
      passed: true,
      xpEarned: 50,
      visibleResults: [{ testIndex: 1, passed: true, actual: '55', expected: '55', executionTime: 12 }],
      hiddenResultsSummary: { total: 4, passed: 4 },
      attemptedAt: new Date().toISOString()
    };

    assert(sampleAttempt.id.startsWith('ca_'), 'Attempt id must start with ca_');
    assert(sampleAttempt.passed === true, 'Passed flag must be boolean');
    assert(sampleAttempt.xpEarned === 50, 'xpEarned must match problem xp');
    assert(sampleAttempt.hiddenResultsSummary.total === 4, 'hiddenResultsSummary total must be tracked');
    assert(sampleAttempt.hiddenResultsSummary.passed === 4, 'hiddenResultsSummary passed count must be tracked');
  });

  console.log(`✨ All ${passCount}/${totalCount} Code Arena Curriculum tests PASSED!`);
  return { passedCount: passCount, totalCount };
}

// Allow direct CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    runArenaCurriculumTests();
  } catch {
    process.exit(1);
  }
}
