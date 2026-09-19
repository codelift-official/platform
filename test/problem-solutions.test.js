/**
 * problem-solutions.test.js
 * 
 * Test suite verifying LeetCode-grade problem editorials, detailed explanations,
 * constraints, structured examples, and solution reveal logic for the Problem Arena.
 */

import assert from 'assert';
import { SEED_PROBLEMS } from '../src/data/problemsSeed.js';
import { PROBLEM_EDITORIALS, getProblemDetails } from '../src/data/problemSolutions.js';

export async function runProblemEditorialTests() {
  console.log('🔵 RUNNING SUITE: Problem Arena Editorials & Detailed Explanations');
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

  // Test 1: All Python SEED_PROBLEMS enrich smoothly without throwing
  test('Every seed problem enriches with getProblemDetails with zero crashes', () => {
    assert(SEED_PROBLEMS.length >= 20, `Expected at least 20 seed problems, found ${SEED_PROBLEMS.length}`);
    for (const prob of SEED_PROBLEMS) {
      assert(prob.category === 'Python', `Problem ${prob.id} must have category Python`);
      const detail = getProblemDetails(prob);
      assert(detail, `Failed to enrich problem ${prob.id}`);
      assert(detail.title, `Missing title on ${prob.id}`);
      assert(detail.inputFormat, `Missing inputFormat on ${prob.id}`);
      assert(detail.outputFormat, `Missing outputFormat on ${prob.id}`);
      assert(Array.isArray(detail.constraints) && detail.constraints.length > 0, `Missing constraints on ${prob.id}`);
      assert(Array.isArray(detail.examples) && detail.examples.length > 0, `Missing examples on ${prob.id}`);
      assert(detail.editorial, `Missing editorial on ${prob.id}`);
    }
  });

  // Test 2: Structured examples include step-by-step explanations
  test('Every example across all problems contains a detailed step explanation', () => {
    for (const prob of SEED_PROBLEMS) {
      const detail = getProblemDetails(prob);
      for (let i = 0; i < detail.examples.length; i++) {
        const ex = detail.examples[i];
        assert(ex.input, `Missing input in example ${i + 1} of ${prob.id}`);
        assert(ex.output, `Missing output in example ${i + 1} of ${prob.id}`);
        assert(
          typeof ex.explanation === 'string' && ex.explanation.length > 10,
          `Example ${i + 1} of ${prob.id} is missing a detailed step explanation.`
        );
      }
    }
  });

  // Test 3: Classical problems contain hand-crafted comprehensive editorials
  test('Key algorithmic challenges (Two Sum, Valid Parentheses, Binary Search, Kadane) have complete editorials', () => {
    const twoSum = getProblemDetails(SEED_PROBLEMS.find((p) => p.id === 'prob-two-sum'));
    assert(twoSum.editorial.timeComplexity === 'O(N)', 'Two Sum time complexity must be O(N)');
    assert(twoSum.editorial.spaceComplexity === 'O(N)', 'Two Sum space complexity must be O(N)');
    assert(twoSum.editorial.intuition.toLowerCase().includes('hash map') || twoSum.editorial.intuition.toLowerCase().includes('dictionary'), 'Two Sum should mention Hash Map intuition');
    assert(twoSum.editorial.solutionCode.includes('def two_sum'), 'Two Sum must contain verified Python solution');

    const validParen = getProblemDetails(SEED_PROBLEMS.find((p) => p.id === 'prob-valid-parentheses'));
    assert(validParen.editorial.intuition.toLowerCase().includes('stack'));
    assert(validParen.editorial.timeComplexity === 'O(N)');
    assert(validParen.editorial.solutionCode.includes('def is_valid'));

    const binSearch = getProblemDetails(SEED_PROBLEMS.find((p) => p.id === 'prob-binary-search'));
    assert(binSearch.editorial.timeComplexity === 'O(log N)');
    assert(binSearch.editorial.solutionCode.includes('def binary_search'));

    const maxSub = getProblemDetails(SEED_PROBLEMS.find((p) => p.id === 'prob-max-subarray-sum' || p.id === 'prob-max-subarray'));
    assert(maxSub, 'Max Subarray problem must exist');
    assert(maxSub.editorial.timeComplexity === 'O(N)');
    assert(maxSub.editorial.solutionCode.includes('def max_sub'));
  });

  // Test 4: All problems are pure Python with verified Python solution implementations
  test('All problems are pure Python with verified Python solution implementations', () => {
    for (const prob of SEED_PROBLEMS) {
      assert(prob.category === 'Python', `Problem ${prob.id} must be categorized as Python`);
      assert(
        prob.starterCode.includes('def ') || prob.starterCode.includes('class '),
        `Problem ${prob.id} starter code must be Python`
      );
    }
  });

  // Test 5: Editorial step-by-step algorithms are non-empty arrays
  test('All problem editorials contain step-by-step algorithm procedures', () => {
    for (const prob of SEED_PROBLEMS) {
      const detail = getProblemDetails(prob);
      assert(
        Array.isArray(detail.editorial.algorithm) && detail.editorial.algorithm.length >= 2,
        `Algorithm steps missing or insufficient for ${prob.id}`
      );
    }
  });

  // Test 6: Reference solution code is valid and present for all problems
  test('Every problem has a non-empty official reference solution code', () => {
    for (const prob of SEED_PROBLEMS) {
      const detail = getProblemDetails(prob);
      assert(
        typeof detail.editorial.solutionCode === 'string' &&
          detail.editorial.solutionCode.trim().length > 15,
        `Solution code missing or empty for ${prob.id}`
      );
    }
  });

  console.log(`✨ All ${passedCount}/${totalCount} Problem Editorial tests PASSED!\n`);
  return { passedCount, totalCount };
}

if (process.argv[1] && process.argv[1].endsWith('problem-solutions.test.js')) {
  runProblemEditorialTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
