import assert from 'assert';
import fs from 'fs';
import path from 'path';

export function runCrossDevicePasswordAndCertAllotmentTests() {
  console.log('\n🔵 RUNNING SUITE: Cross-Device Password Synchronization & Batch Course Certificate Gating');
  let passedCount = 0;
  const totalCount = 8;
  const rootDir = process.cwd();

  const certsCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'student', 'StudentCertificates.jsx'), 'utf8');
  const authCode = fs.readFileSync(path.join(rootDir, 'src', 'contexts', 'AuthContext.jsx'), 'utf8');
  const serviceCode = fs.readFileSync(path.join(rootDir, 'src', 'services', 'supabaseDataService.js'), 'utf8');
  const profileCode = fs.readFileSync(path.join(rootDir, 'src', 'components', 'student', 'StudentProfile.jsx'), 'utf8');
  const dataContextCode = fs.readFileSync(path.join(rootDir, 'src', 'contexts', 'DataContext.jsx'), 'utf8');

  // 1. StudentCertificates: Eliminates phantom fallback to courses[0]
  assert(
    !certsCode.includes('const myCourse = myCourses[0] || courses[0]'),
    'StudentCertificates must not fall back to courses[0] when no course is allotted'
  );
  assert(
    certsCode.includes('myCourses.length > 0 ? myCourses[0] : null'),
    'StudentCertificates must resolve myCourse to null when myCourses is empty'
  );
  console.log('  ✓ StudentCertificates has zero phantom courses[0] fallbacks when batch has no courses');
  passedCount++;

  // 2. StudentCertificates: In-progress card is strictly gated to myCourse
  assert(
    certsCode.includes('{myCourse && !alreadyCertified && ('),
    'In-Progress Course card must strictly require valid myCourse'
  );
  assert(
    certsCode.includes('No Courses Allotted to Your Batch'),
    'StudentCertificates must provide clean empty state when batch has no courses'
  );
  console.log('  ✓ StudentCertificates hides in-progress card and displays batch allotment notice');
  passedCount++;

  // 3. supabaseDataService: Safe non-UUID matching prevents PostgreSQL 22P02 error
  assert(
    !serviceCode.includes('query.or(`id.eq.${studentId},legacy_id.eq.${studentId}`)'),
    'supabaseDataService must never compare non-UUID strings to UUID id column'
  );
  assert(
    serviceCode.includes('legacy_id.eq.${studentId}'),
    'supabaseDataService must query legacy_id for non-UUID student identifiers'
  );
  console.log('  ✓ supabaseDataService protects non-UUID student IDs from PostgreSQL 22P02 casting errors');
  passedCount++;

  // 4. supabaseDataService: Dual-layer server password persistence
  assert(
    serviceCode.includes('__auth_pwd: updates.password') || serviceCode.includes('__auth_pwd: studentData.password'),
    'supabaseDataService must backup passwords in progress.__auth_pwd for universal cross-device durability'
  );
  assert(
    serviceCode.includes('setStudentPasswordRPC'),
    'supabaseDataService must export setStudentPasswordRPC helper'
  );
  console.log('  ✓ supabaseDataService implements dual-layer password storage and RPC support');
  passedCount++;

  // 5. AuthContext: Multi-device login verification against the live DB (no localStorage)
  assert(
    authCode.includes('verifyStudentPasswordRPC'),
    'AuthContext must verify credentials with the live verify_student_password DB call'
  );
  assert(
    authCode.includes('verification.success !== true') && authCode.includes('verification.student'),
    'AuthContext must trust only the server-side verification for login'
  );
  assert(
    !authCode.includes('localCustomPassword') && !authCode.includes('codelift_student_passwords'),
    'AuthContext must not resolve credentials from localStorage'
  );
  console.log('  ✓ AuthContext verifies server-side passwords across devices with direct DB calls only');
  passedCount++;

  // 6. StudentProfile: Live DB password update with atomic RPC and server refresh
  assert(
    profileCode.includes("supabase.rpc('set_student_password'"),
    'StudentProfile must trigger the server-side RPC for password update'
  );
  assert(
    profileCode.includes('refreshData'),
    'StudentProfile must refresh in-memory state from the live DB after the update'
  );
  assert(
    !profileCode.includes('codelift_student_pwd_') && !profileCode.includes('__auth_pwd: newPassword'),
    'StudentProfile must not persist passwords locally or hand-build the dual-layer payload in the UI layer'
  );
  console.log('  ✓ StudentProfile persists updated passwords directly to the server via the auth-syncing RPC');
  passedCount++;

  // 7. DataContext: Dual-layer enrichment and server-only password hydration
  assert(
    dataContextCode.includes('__auth_pwd: enrichedUpdates.password'),
    'DataContext must enrich student password updates with dual-layer payload'
  );
  assert(
    dataContextCode.includes('supabaseDataService.fetchAllData'),
    'DataContext must hydrate passwords from the live server (dual-layer storage)'
  );
  assert(
    !dataContextCode.includes('codelift_student_passwords'),
    'DataContext must not rely on a localStorage password registry'
  );
  console.log('  ✓ DataContext synchronizes dual-layer passwords with server-only hydration and mutations');
  passedCount++;

  // 8. Migration 014: Exists with set_student_password RPC and reload notification
  const migrationPath = path.join(rootDir, 'supabase', 'migrations', '014_student_cross_device_password_and_rpc.sql');
  assert(fs.existsSync(migrationPath), 'Migration 014 must exist');
  const migCode = fs.readFileSync(migrationPath, 'utf8');
  assert(migCode.includes('FUNCTION public.set_student_password'), 'Migration 014 must define set_student_password');
  assert(migCode.includes('p_new_password TEXT'), 'Migration 014 must take p_new_password argument');
  console.log('  ✓ Migration 014 provisions server-side set_student_password RPC and auth sync');
  passedCount++;

  console.log(`✨ All ${passedCount}/${totalCount} Cross-Device Password & Certificate Allotment tests PASSED!`);
  return { passedCount, totalCount };
}

if (process.argv[1]?.endsWith('cross-device-password-and-cert-allotment.test.js')) {
  runCrossDevicePasswordAndCertAllotmentTests();
}
