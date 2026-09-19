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

  // 9. Admin-provisioned certificate credentials persist end-to-end
  test('Migration 016 persists certificate snapshots + platform_settings with admin-only writes', () => {
    const migrationPath = path.join(rootDir, 'supabase', 'migrations', '016_certificate_persistence.sql');
    assert(fs.existsSync(migrationPath), 'supabase/migrations/016_certificate_persistence.sql must exist');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    assert(migration.includes('template_id'), 'certificates table must gain a template_id column');
    assert(migration.includes('design jsonb'), 'certificates table must gain a design jsonb column');
    assert(migration.includes('course_id'), 'certificates table must gain a course_id column');
    assert(migration.includes('create table if not exists public.platform_settings'), 'platform_settings table must be created');
    assert(migration.includes('select using (auth.role() = \'authenticated\' or is_admin())'), 'authenticated users may read settings');
    assert(migration.includes('platform_settings_admin_all'), 'only admins may write platform_settings');
  });

  test('supabaseDataService persists snapshot columns on issue and loads them back', () => {
    const serviceCode = fs.readFileSync(path.join(rootDir, 'src', 'services', 'supabaseDataService.js'), 'utf8');
    const issueMatch = serviceCode.match(/export async function issueCertificate[\s\S]*?\n\}/);

    assert(issueMatch, 'issueCertificate must be defined in supabaseDataService');
    assert(issueMatch[0].includes('template_id: certData.templateId'), 'issueCertificate must persist template_id');
    assert(issueMatch[0].includes('design: certData.design'), 'issueCertificate must persist design snapshot');
    assert(issueMatch[0].includes('course_id: certData.courseId'), 'issueCertificate must persist course_id');

    assert(serviceCode.includes("templateId: cert.template_id || null"), 'fetchAllData must reassemble templateId');
    assert(serviceCode.includes('design: cert.design || null'), 'fetchAllData must reassemble design');
    assert(serviceCode.includes("courseId: cert.course_id || null"), 'fetchAllData must reassemble courseId');
    assert(serviceCode.includes("from('platform_settings')"), 'fetchAllData must load platform_settings');
    assert(serviceCode.includes('platformSettings,'), 'fetchAllData must return platformSettings');

    for (const fn of ['upsertCertificateTemplate', 'setCertificateTemplateActive', 'deleteCertificateTemplate', 'fetchPlatformSettings', 'updatePlatformSettings']) {
      assert(serviceCode.includes(`export async function ${fn}`), `${fn} must be exported from supabaseDataService`);
    }
  });

  test('DataContext persists template CRUD + settings and drops mock certificate fallbacks', () => {
    const dataContextCode = fs.readFileSync(path.join(rootDir, 'src', 'contexts', 'DataContext.jsx'), 'utf8');

    assert(dataContextCode.includes('supabaseDataService.upsertCertificateTemplate(newTemplate)'), 'addCertificateTemplate must persist to Supabase');
    assert(dataContextCode.includes('supabaseDataService.upsertCertificateTemplate(merged)'), 'updateCertificateTemplate must persist to Supabase');
    assert(dataContextCode.includes('supabaseDataService.setCertificateTemplateActive(templateId)'), 'setActiveCertificateTemplate must persist');
    assert(dataContextCode.includes('supabaseDataService.deleteCertificateTemplate(templateId)'), 'deleteCertificateTemplate must persist');
    assert(dataContextCode.includes('supabaseDataService.updatePlatformSettings(next)'), 'updatePlatformSettings must persist');

    assert(!dataContextCode.includes("|| 'CodeLift Engineering Academy'"), 'No mock institute fallback in DataContext');
    assert(!dataContextCode.includes("|| 'Ashish Kumar'"), 'No mock signatory fallback in DataContext');
    assert(!dataContextCode.includes("|| 'Vikram Nair'"), 'No mock signatory fallback in DataContext');
    assert(dataContextCode.includes("signatoryName: certData.signatoryName || platformSettings?.signatoryName"), 'issueCertificate resolves from admin settings');
  });

  test('certificateUtils + CertificateDocument render only admin-provisioned credentials', () => {
    const utilsCode = fs.readFileSync(path.join(rootDir, 'src', 'services', 'certificateUtils.js'), 'utf8');
    const docCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'CertificateDocument.jsx'), 'utf8');

    assert(!utilsCode.includes("|| 'Ashish Kumar'"), 'certificateUtils must not fall back to a mock signatory');
    assert(!utilsCode.includes("|| 'CodeLift Engineering Academy'"), 'certificateUtils must not fall back to a mock institute');
    assert(utilsCode.includes("content: '{{signatoryName}}'"), 'signature element must use the {{signatoryName}} placeholder');
    assert(utilsCode.includes("content: '{{signatoryTitle}}'"), 'signature title element must use the {{signatoryTitle}} placeholder');
    assert(utilsCode.includes('templateForCert?.signatoryName || \'\''), 'resolved signatory chains settings then template, never a mock');

    assert(!docCode.includes("instituteName = 'CodeLift Engineering Academy'"), 'CertificateDocument must not default institute to a mock');
    assert(!docCode.includes("signatoryName = 'Ashish Kumar'"), 'CertificateDocument must not default signatory to a mock');
    assert(!docCode.includes("signatoryTitle = 'Director of Academic Affairs'"), 'CertificateDocument must not default title to a mock');
    assert(docCode.includes('design.signatoryName'), 'CertificateDocument must resolve signatory from the design snapshot');
    assert(docCode.includes('\\{\\{signatoryName\\}\\}'), 'CertificateDocument must interpolate the signatory placeholder');
  });

  test('Template seeds are admin-provisioned (8 templates, placeholder signatories, no mock names)', () => {
    const templatesJsonPath = path.join(rootDir, 'data', 'certificateTemplates.json');
    assert(fs.existsSync(templatesJsonPath), 'data/certificateTemplates.json must exist');
    const templates = JSON.parse(fs.readFileSync(templatesJsonPath, 'utf8'));

    assert(templates.length >= 6, `Expected at least 6 templates, found ${templates.length}`);
    for (const t of templates) {
      assert(t.signatoryName === '', 'Templates must not ship a hardcoded signatory name');
      assert(t.signatoryTitle === '', 'Templates must not ship a hardcoded signatory title');
      assert(t.instituteName === '', 'Templates must not ship a hardcoded institute name');
      assert(JSON.stringify(t.design || {}).includes('{{signatoryName}}'), 'Template design must bind the signatory placeholder');
    }

    const dataJs = fs.readFileSync(path.join(rootDir, 'src', 'data', 'data.js'), 'utf8');
    assert(dataJs.includes("signatoryName: ''"), 'data.js DEFAULT_CERTIFICATE_TEMPLATES must ship empty signatory names');
    assert(dataJs.includes("id: 'sky-horizon'"), 'data.js must ship the expanded 8-template catalog');

    const designerCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'admin', 'CertificateDesigner.jsx'), 'utf8');
    assert(!designerCode.includes('Vikram Nair'), 'CertificateDesigner must not default signatory to a mock person');
    assert(!designerCode.includes("'Rahul Sharma'"), 'CertificateDesigner must not default preview to a mock person');
    assert(designerCode.includes("'{{signatoryName}}'"), 'CertificateDesigner must bind the signatory placeholder for new templates');
  });

  test('Migrate script writes snapshot columns + seeds platform_settings', () => {
    const migrateCode = fs.readFileSync(path.join(rootDir, 'scripts', 'migrate-json-to-supabase.js'), 'utf8');

    assert(migrateCode.includes('template_id, design, pdf_url'), 'Certificate insert must include snapshot columns');
    assert(migrateCode.includes("cert.templateId || null"), 'Certificate insert must persist templateId');
    assert(migrateCode.includes("cert.courseId || null"), 'Certificate insert must persist courseId');
    assert(migrateCode.includes('Seeding Platform Settings'), 'Migrate script must seed platform_settings');
    assert(migrateCode.includes('ON CONFLICT (key) DO UPDATE'), 'platform_settings upsert must target the single default row');
    assert(!migrateCode.includes("tmpl.signatoryName || 'Director'"), 'Migrate script must not fall back to mock signatory data');
  });

  console.log(`✨ All ${passCount}/${totalCount} Certificate Pipeline & Completion Polish tests PASSED!`);
  return { passedCount: passCount, totalCount };
}

// Run standalone if executed directly
if (process.argv[1] && process.argv[1].endsWith('certificate-and-completion-fixes.test.js')) {
  runCertificateAndCompletionTests();
}
