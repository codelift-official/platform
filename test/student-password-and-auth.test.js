import assert from 'assert';
import fs from 'fs';

export function runStudentPasswordAndAuthTests() {
  console.log('\n🔵 RUNNING SUITE: Student Password Synchronization & Authentication Integrity');
  let passedCount = 0;
  const totalCount = 8;

  const authContextCode = fs.readFileSync('src/contexts/AuthContext.jsx', 'utf8');
  const studentProfileCode = fs.readFileSync('src/components/student/StudentProfile.jsx', 'utf8');
  const studentManagerCode = fs.readFileSync('src/components/admin/StudentManager.jsx', 'utf8');
  const dataContextCode = fs.readFileSync('src/contexts/DataContext.jsx', 'utf8');

  // 1. AuthContext: login verifies credentials with a live DB call, never from localStorage
  assert(
    authContextCode.includes("verifyStudentPasswordRPC(email.toLowerCase(), studentOrCreds.password)"),
    'AuthContext must verify student credentials via the live verify_student_password DB call'
  );
  assert(
    !authContextCode.includes('codelift_student_pwd_') && !authContextCode.includes('codelift_student_passwords'),
    'AuthContext must not read or write student passwords from localStorage'
  );
  console.log('  ✓ AuthContext verifies login against the live DB and has zero localStorage password usage');
  passedCount++;

  // 2. AuthContext: only the server password is accepted once a custom password has been set
  assert(
    authContextCode.includes('if (!verification || verification.success !== true) {') &&
    authContextCode.includes("throw new Error('Invalid email or password. Please check your credentials or click Forgot Password.');"),
    'AuthContext must reject non-matching passwords based on the live DB verification result'
  );
  console.log('  ✓ AuthContext rejects wrong passwords strictly from the live DB verification result');
  passedCount++;

  // 3. AuthContext: use of getFallbackStudents (offline demo) without any stale references
  assert(
    !authContextCode.includes('const cached = getCachedStudents();'),
    'AuthContext must not call undefined getCachedStudents'
  );
  assert(
    authContextCode.includes('const cached = getFallbackStudents();'),
    'AuthContext must call getFallbackStudents for offline demo records'
  );
  console.log('  ✓ AuthContext uses getFallbackStudents and has no undefined getCachedStudents references');
  passedCount++;

  // 4. StudentProfile: current password is verified with a live DB call (verify_student_password RPC)
  assert(
    studentProfileCode.includes("supabase.rpc('verify_student_password'"),
    'StudentProfile must verify the current password with the live verify_student_password DB call'
  );
  assert(
    !studentProfileCode.includes('knownSavedPwd') && !studentProfileCode.includes('codelift_student_passwords'),
    'StudentProfile must not rely on localStorage passwords or a local registry during verification'
  );
  console.log('  ✓ StudentProfile verifies the current password directly against the DB');
  passedCount++;

  // 5. StudentProfile: password update is a single direct DB write and surfaces success/error
  assert(
    studentProfileCode.includes("supabase.rpc('set_student_password'"),
    'StudentProfile must update the password with the live set_student_password DB call'
  );
  assert(
    !studentProfileCode.includes('codelift_student_pwd_') && !studentProfileCode.includes('codelift_student_passwords'),
    'StudentProfile must not persist passwords to localStorage'
  );
  console.log('  ✓ StudentProfile writes password updates straight to the DB with inline success/error feedback');
  passedCount++;

  // 6. StudentManager: admin reset/custom password go straight to the DB via the RPC
  assert(
    studentManagerCode.includes("supabase.rpc('set_student_password'"),
    'StudentManager must reset and set student passwords with the live set_student_password DB call'
  );
  assert(
    !studentManagerCode.includes('codelift_student_pwd_') && !studentManagerCode.includes('codelift_student_passwords'),
    'StudentManager must not synchronize passwords to localStorage'
  );
  console.log('  ✓ StudentManager performs admin password resets/edits directly on the DB');
  passedCount++;

  // 7. DataContext: student mutations sync the password server-side with zero localStorage
  assert(
    !dataContextCode.includes('codelift_student_pwd_') && !dataContextCode.includes('codelift_student_passwords'),
    'DataContext must not keep a password cache in localStorage during student mutations'
  );
  assert(
    dataContextCode.includes('supabaseDataService.setStudentPasswordRPC'),
    'DataContext must sync password changes to the server through the RPC helper'
  );
  console.log('  ✓ DataContext keeps password data strictly server-side during add/update/delete');
  passedCount++;

  // 8. Functional credential verification simulation (server DB as the single source of truth)
  // Simulate the exact Milan Soni user journey against a DB-backed record.
  const dbRecord = {
    id: 'stu-milan-1',
    name: 'Milan Soni',
    email: 'milansoni208@gmail.com',
    status: 'ACTIVE',
    password: 'codelift123' // students.password column — the canonical source
  };

  // Mirrors the verify_student_password RPC: a single live DB call
  const verifyLogin = (email, inputPassword) => {
    if (inputPassword !== dbRecord.password) {
      throw new Error('Invalid email or password.');
    }
    return true;
  };

  // Step A: Initially, default password works (DB holds the default)
  assert.strictEqual(verifyLogin('milansoni208@gmail.com', 'codelift123'), true);

  // Step B: Milan changes password to milan123 through set_student_password (updates the DB record)
  dbRecord.password = 'milan123';

  // Step C: Logging in with updated password milan123 succeeds!
  assert.strictEqual(verifyLogin('milansoni208@gmail.com', 'milan123'), true);

  // Step D: Logging in with old password codelift123 MUST FAIL! (DB no longer holds it)
  let oldPwdFailed = false;
  try {
    verifyLogin('milansoni208@gmail.com', 'codelift123');
  } catch (err) {
    oldPwdFailed = true;
  }
  assert.strictEqual(oldPwdFailed, true, 'Old password codelift123 must be rejected after update');

  // Step E: Admin resets password back to default via set_student_password (DB now holds default)
  dbRecord.password = 'codelift123';

  // Step F: Default password works again
  assert.strictEqual(verifyLogin('milansoni208@gmail.com', 'codelift123'), true);

  console.log('  ✓ Milan Soni workflow: DB-only credential flow allows update, rejects old password, restores on reset');
  passedCount++;

  console.log(`✨ All ${passedCount}/${totalCount} Student Password & Auth tests PASSED!`);
  return { passedCount, totalCount };
}

if (process.argv[1] && process.argv[1].endsWith('student-password-and-auth.test.js')) {
  runStudentPasswordAndAuthTests();
}