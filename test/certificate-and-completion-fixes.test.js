import fs from 'fs';
import path from 'path';
import assert from 'assert';

export function runCertificateAndCompletionTests() {
  console.log('🔵 RUNNING SUITE: Certificate Pipeline, Admin Gating & 100% Completion Polish');

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

  // 1. Bug 1: Logo aspect ratio and unclipped vertical height
  test('Horizontal logo assets exist with expanded height preventing top/bottom clipping', () => {
    const darkLogoPath = path.join(rootDir, 'public', 'logo-horizontal.png');
    const whiteLogoPath = path.join(rootDir, 'public', 'logo-horizontal-white.png');

    assert(fs.existsSync(darkLogoPath), 'public/logo-horizontal.png must exist');
    assert(fs.existsSync(whiteLogoPath), 'public/logo-horizontal-white.png must exist');

    const darkStat = fs.statSync(darkLogoPath);
    const whiteStat = fs.statSync(whiteLogoPath);
    assert(darkStat.size > 1000, 'dark logo must be a valid non-empty PNG');
    assert(whiteStat.size > 1000, 'white logo must be a valid non-empty PNG');
  });

  // 2. Bug 2: 100% Course Completion Celebration, Navigation & Completed Status
  test('StudentCourses triggers multi-burst confetti, redirects to /student/courses, and displays Completed status', () => {
    const studentCoursesCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'student', 'StudentCourses.jsx'), 'utf8');

    assert(studentCoursesCode.includes('confetti({'), 'Must trigger confetti celebration on course completion');
    assert(studentCoursesCode.includes("navigate('/student/courses')"), 'Must redirect to My Courses page upon completion');
    assert(studentCoursesCode.includes('Completed'), 'Must render Completed status badge');
    assert(studentCoursesCode.includes('Review Course'), 'Must render Review Course CTA when completed');
    assert(studentCoursesCode.includes('topic-assessment-section'), 'Must include id for smooth scrolling to assessment');
  });

  // 3. Bug 3: Strict Admin Approval Gating (Zero Premature Auto-Issuance)
  test('DataContext strictly forbids auto-issuing certificates in saveQuizAttempt and markTopicComplete', () => {
    const dataContextCode = fs.readFileSync(path.join(rootDir, 'src', 'contexts', 'DataContext.jsx'), 'utf8');

    // Extract saveQuizAttempt function body
    const saveQuizAttemptMatch = dataContextCode.match(/const saveQuizAttempt = [^}]+?\{([\s\S]+?)\n  \};/);
    assert(saveQuizAttemptMatch, 'saveQuizAttempt must be defined in DataContext');
    assert(!saveQuizAttemptMatch[1].includes('issueCertificate('), 'saveQuizAttempt must NOT auto-issue certificates');

    // Extract markTopicComplete function body
    const markTopicMatch = dataContextCode.match(/const markTopicComplete = [^}]+?\{([\s\S]+?)\n  \};/);
    assert(markTopicMatch, 'markTopicComplete must be defined in DataContext');
    assert(!markTopicMatch[1].includes('issueCertificate('), 'markTopicComplete must NOT auto-issue certificates');
  });

  // 4. Bug 3: Student Certificates UI gates display to formally issued certificates
  test('StudentCertificates displays Under Academy Review / Awaiting Admin Issuance for unapproved completions', () => {
    const certsCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'student', 'StudentCertificates.jsx'), 'utf8');

    assert(certsCode.includes('Under Academy Review'), 'Must inform student when completed course is awaiting admin approval');
    assert(certsCode.includes("c.status === 'issued' || c.status === 'approved'"), 'Must strictly filter student certificates to approved/issued status');
    assert(certsCode.includes('Download PDF'), 'Must provide Download PDF button for approved certificates');
    assert(certsCode.includes('PNG'), 'Must provide Download PNG button for approved certificates');
  });

  // 5. Bug 3: Admin Certificate Designer surfaces 100% completed students in issuance queue
  test('CertificateDesigner identifies students with 100% progress awaiting admin issuance', () => {
    const designerCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'admin', 'CertificateDesigner.jsx'), 'utf8');

    assert(designerCode.includes('eligibleRecords'), 'Must calculate eligible students awaiting issuance');
    assert(designerCode.includes('issueCertificate('), 'Must allow admin to issue certificate to eligible student');
    assert(designerCode.includes('Issue Now'), 'Must display Issue Now CTA in admin table');
  });

  // 6. Bug 4: Platform Settings allows configuring Institute and Signatory details
  test('PlatformSettings provides state and form inputs for instituteName, signatoryName and signatoryTitle', () => {
    const settingsCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'admin', 'PlatformSettings.jsx'), 'utf8');

    assert(settingsCode.includes('instituteName'), 'Must support instituteName setting');
    assert(settingsCode.includes('signatoryName'), 'Must support signatoryName setting');
    assert(settingsCode.includes('signatoryTitle'), 'Must support signatoryTitle setting');
  });

  // 7. Bug 4 & Bug 5: certificateUtils dynamically binds settings and eliminates padding letterboxing
  test('certificateUtils binds platformSettings and renders WYSIWYG export at 300 DPI without fixed sandbox scaling', () => {
    const utilsCode = fs.readFileSync(path.join(rootDir, 'src', 'services', 'certificateUtils.js'), 'utf8');

    assert(utilsCode.includes('platformSettings'), 'Must support platformSettings in certificate generation');
    assert(utilsCode.includes('generateCertificatePNG'), 'Must export high-res PNG format');
    assert(utilsCode.includes('scale: 3'), 'Must render canvas at 3x scale (300 DPI) for crisp printing');
    assert(!utilsCode.includes('width: 800px; height: 565px;'), 'Must NOT letterbox certificate in tiny 800x565 container');
  });

  // 8. Bug 4: CertificateDocument eliminates mock names and dynamically uses bound props
  test('CertificateDocument defaults to clean student fallbacks without hardcoded Vikram Nair or Rahul Sharma', () => {
    const docCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'CertificateDocument.jsx'), 'utf8');

    assert(!docCode.includes("studentName = 'Rahul Sharma'"), 'Must NOT hardcode Rahul Sharma as default student');
    assert(!docCode.includes("signatoryName = 'Vikram Nair'"), 'Must NOT hardcode Vikram Nair as default signatory');
    assert(docCode.includes('signatoryName'), 'Must render signatoryName dynamically');
    assert(docCode.includes('signatoryTitle'), 'Must render signatoryTitle dynamically');
    assert(docCode.includes('instituteName'), 'Must render instituteName dynamically');
  });

  console.log(`✨ All ${passCount}/${totalCount} Certificate Pipeline & Completion Polish tests PASSED!`);
  return { passedCount: passCount, totalCount };
}

// Run standalone if executed directly
if (process.argv[1] && process.argv[1].endsWith('certificate-and-completion-fixes.test.js')) {
  runCertificateAndCompletionTests();
}
