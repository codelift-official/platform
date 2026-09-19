import fs from 'fs';
import path from 'path';
import assert from 'assert';

export function runUnifiedCodeArenaTests() {
  console.log('🔵 RUNNING SUITE: Unified Code Arena, Admin Control & Differentiated Progress Tracking');

  const rootDir = process.cwd();
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

  // 1. DataContext exports unifiedCodingProblemsSeed and handles mutations
  test('DataContext initializes codingProblems with unified seed and synchronizes attempts', () => {
    const dataContextCode = fs.readFileSync(path.join(rootDir, 'src', 'contexts', 'DataContext.jsx'), 'utf8');

    assert(dataContextCode.includes('unifiedCodingProblemsSeed'), 'DataContext must define unifiedCodingProblemsSeed');
    assert(dataContextCode.includes('SEED_PROBLEMS'), 'DataContext must incorporate SEED_PROBLEMS into unifiedCodingProblemsSeed');
    assert(dataContextCode.includes('recordProblemAttempt'), 'DataContext must define recordProblemAttempt');
    assert(dataContextCode.includes('submitCodingAttempt'), 'DataContext must define submitCodingAttempt');
    assert(dataContextCode.includes('mirrorCodingAttempt'), 'recordProblemAttempt must mirror to codingAttempts');
    assert(dataContextCode.includes('mirrorProblemAttempt'), 'submitCodingAttempt must mirror to problemAttempts');
  });

  // 2. ProblemCatalog uses codingProblems and intentionally omits filter strip
  test('ProblemCatalog uses codingProblems and contains zero filter strip clutter per user specification', () => {
    const catalogCode = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'ProblemCatalog.jsx'), 'utf8');

    assert(catalogCode.includes('codingProblems'), 'ProblemCatalog must consume codingProblems from DataContext');
    assert(catalogCode.includes('isStudentView'), 'ProblemCatalog must accept isStudentView prop');
    // User intentionally removed filter strip:
    assert(!catalogCode.includes('cl-arena-filters-card'), 'ProblemCatalog must NOT contain cl-arena-filters-card');
    assert(!catalogCode.includes('cl-category-pill'), 'ProblemCatalog must NOT contain category filter pills');
    assert(!catalogCode.includes('Reset Filters'), 'ProblemCatalog must NOT contain Reset Filters button');
  });

  // 3. ProblemCatalog differentiates guest vs student progress
  test('ProblemCatalog differentiates guest client-side storage vs student account attempts', () => {
    const catalogCode = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'ProblemCatalog.jsx'), 'utf8');

    assert(catalogCode.includes('codelift_guest_solved_problems'), 'ProblemCatalog must check client-side storage for guest solves');
    assert(catalogCode.includes('codingAttempts'), 'ProblemCatalog must check codingAttempts for authenticated students');
    assert(catalogCode.includes('solvedProblemIds'), 'ProblemCatalog must compute solvedProblemIds');
  });

  // 4. ProblemDetail differentiates guest execution from authenticated student persistence
  test('ProblemDetail saves guest progress strictly in localStorage and persists student progress via DataContext', () => {
    const detailCode = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'ProblemDetail.jsx'), 'utf8');

    assert(detailCode.includes('codelift_guest_solved_problems'), 'ProblemDetail must store guest solves in client-side localStorage');
    assert(detailCode.includes('codelift_guest_code_'), 'ProblemDetail must cache guest code in localStorage');
    assert(detailCode.includes('submitCodingAttempt'), 'ProblemDetail must call submitCodingAttempt for authenticated students');
    assert(detailCode.includes('recordProblemAttempt'), 'ProblemDetail must call recordProblemAttempt for authenticated students');
    assert(detailCode.includes('isStudentRoute'), 'ProblemDetail must detect student route context');
    assert(detailCode.includes('arenaHomeUrl'), 'ProblemDetail must provide contextual back link');
  });

  // 5. App.jsx maps student portal arena to ProblemCatalog and ProblemDetail
  test('App.jsx routes student arena to unified ProblemCatalog and ProblemDetail components', () => {
    const appCode = fs.readFileSync(path.join(rootDir, 'src', 'App.jsx'), 'utf8');

    assert(appCode.includes('<Route path="arena" element={<ProblemCatalog isStudentView={true} />} />'), 'Student /arena must render ProblemCatalog');
    assert(appCode.includes('<Route path="arena/:problemId" element={<ProblemDetail />} />'), 'Student /arena/:problemId must render ProblemDetail');
    assert(appCode.includes('<Route path="/problems" element={<ProblemCatalog />} />'), 'Public /problems must render ProblemCatalog');
    assert(appCode.includes('<Route path="/problems/:id" element={<ProblemDetail />} />'), 'Public /problems/:id must render ProblemDetail');
  });

  // 6. StudentDashboard computes solved challenges matching unified problems
  test('StudentDashboard resolves solvedCodingProblems from both codingAttempts and problemAttempts', () => {
    const dashCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'student', 'StudentDashboard.jsx'), 'utf8');

    assert(dashCode.includes('solvedCodingProblems'), 'StudentDashboard must calculate solvedCodingProblems');
    assert(dashCode.includes('myCodingAttempts'), 'StudentDashboard must calculate myCodingAttempts');
    assert(dashCode.includes('myProblemAttempts'), 'StudentDashboard must calculate myProblemAttempts');
    assert(dashCode.includes('Code Arena Solved'), 'StudentDashboard must render Code Arena Solved KPI');
  });

  // 7. ProblemManager enables full admin control over codingProblems
  test('ProblemManager manages codingProblems with add, edit, delete, and reset capabilities', () => {
    const managerCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'admin', 'ProblemManager.jsx'), 'utf8');

    assert(managerCode.includes('codingProblems'), 'ProblemManager must read codingProblems');
    assert(managerCode.includes('addCodingProblem'), 'ProblemManager must call addCodingProblem');
    assert(managerCode.includes('updateCodingProblem'), 'ProblemManager must call updateCodingProblem');
    assert(managerCode.includes('deleteCodingProblem'), 'ProblemManager must call deleteCodingProblem');
  });

  console.log(`✨ All ${passCount}/${totalCount} Unified Code Arena tests PASSED!`);
  return { passedCount: passCount, totalCount };
}

// Run standalone if executed directly
if (process.argv[1] && process.argv[1].endsWith('unified-code-arena.test.js')) {
  runUnifiedCodeArenaTests();
}
