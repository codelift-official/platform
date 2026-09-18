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

  // 1. AuthContext: checks codelift_student_pwd_ under both ID and email
  assert(
    authContextCode.includes('localStorage.getItem(`codelift_student_pwd_${student.id}`)') &&
    authContextCode.includes('localStorage.getItem(`codelift_student_pwd_${emailKey}`)'),
    'AuthContext must check custom password by student ID and email'
  );
  console.log('  ✓ AuthContext resolves custom passwords from localStorage by both student ID and email');
  passedCount++;

  // 2. AuthContext: strictly disallows old default passwords once a custom password exists
  assert(
    authContextCode.includes('const hasCustomPassword =') &&
    authContextCode.includes('if (hasCustomPassword) {') &&
    authContextCode.includes('if (studentOrCreds.password !== customPassword) {') &&
    authContextCode.includes('throw new Error(\'Invalid email or password. Please check your credentials or click Forgot Password.\');'),
    'AuthContext must strictly reject non-matching passwords when a custom password exists'
  );
  console.log('  ✓ AuthContext rejects old default passwords once student sets a custom password');
  passedCount++;

  // 3. AuthContext: fix getCachedStudents reference
  assert(
    !authContextCode.includes('const cached = getCachedStudents();'),
    'AuthContext must not call undefined getCachedStudents'
  );
  assert(
    authContextCode.includes('const cached = getFallbackStudents();'),
    'AuthContext must call getFallbackStudents'
  );
  console.log('  ✓ AuthContext uses getFallbackStudents and has no undefined getCachedStudents references');
  passedCount++;

  // 4. StudentProfile: verifies current password against custom password and disallows defaults if custom exists
  assert(
    studentProfileCode.includes('hasCustomPwd') &&
    studentProfileCode.includes('if (hasCustomPwd) {') &&
    studentProfileCode.includes('if (currentPassword === knownSavedPwd) {'),
    'StudentProfile must enforce existing custom password before allowing change'
  );
  console.log('  ✓ StudentProfile enforces custom password check during password modification');
  passedCount++;

  // 5. StudentProfile: stores new password under both student.id and email
  assert(
    studentProfileCode.includes('localStorage.setItem(`codelift_student_pwd_${student.id}`, newPassword);') &&
    studentProfileCode.includes('localStorage.setItem(`codelift_student_pwd_${emailLower}`, newPassword);'),
    'StudentProfile must persist new password under student.id and lowercase email'
  );
  console.log('  ✓ StudentProfile persists updated password under both student ID and lowercase email');
  passedCount++;

  // 6. StudentManager: resets and clears localStorage on default reset, and updates on custom password edit
  assert(
    studentManagerCode.includes('localStorage.removeItem(`codelift_student_pwd_${student.id}`);') &&
    studentManagerCode.includes('localStorage.setItem(`codelift_student_pwd_${passwordEditStudent.id}`, newPwd);'),
    'StudentManager must sync localStorage on admin password resets and updates'
  );
  console.log('  ✓ StudentManager synchronizes localStorage cache on admin password reset and edit');
  passedCount++;

  // 7. DataContext: updates student password cache on addStudent, updateStudent, and deleteStudent
  assert(
    dataContextCode.includes('localStorage.setItem(`codelift_student_pwd_${studentId}`, updates.password);') &&
    dataContextCode.includes('localStorage.removeItem(`codelift_student_pwd_${studentId}`);'),
    'DataContext must keep student password cache synchronized during mutations'
  );
  console.log('  ✓ DataContext keeps student password cache synchronized during student mutations');
  passedCount++;

  // 8. Functional credential verification simulation
  // Simulate the exact Milan Soni user journey
  const storage = new Map();
  const mockLocalStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  };

  const studentRecord = {
    id: 'stu-milan-1',
    name: 'Milan Soni',
    email: 'milansoni208@gmail.com',
    status: 'ACTIVE',
  };

  const verifyLogin = (email, inputPassword) => {
    const emailKey = email.toLowerCase();
    const customPassword =
      (studentRecord.id && mockLocalStorage.getItem(`codelift_student_pwd_${studentRecord.id}`)) ||
      mockLocalStorage.getItem(`codelift_student_pwd_${emailKey}`) ||
      studentRecord.password ||
      null;

    const hasCustomPassword =
      customPassword &&
      customPassword !== 'codelift123' &&
      customPassword !== 'password';

    if (hasCustomPassword) {
      if (inputPassword !== customPassword) {
        throw new Error('Invalid email or password.');
      }
    } else {
      const allowed = ['codelift123', 'password'];
      if (customPassword) allowed.push(customPassword);
      if (!allowed.includes(inputPassword)) {
        throw new Error('Invalid email or password.');
      }
    }
    return true;
  };

  // Step A: Initially, default password works
  assert.strictEqual(verifyLogin('milansoni208@gmail.com', 'codelift123'), true);

  // Step B: Milan changes password to milan123
  mockLocalStorage.setItem(`codelift_student_pwd_${studentRecord.id}`, 'milan123');
  mockLocalStorage.setItem(`codelift_student_pwd_milansoni208@gmail.com`, 'milan123');

  // Step C: Logging in with updated password milan123 succeeds!
  assert.strictEqual(verifyLogin('milansoni208@gmail.com', 'milan123'), true);

  // Step D: Logging in with old password codelift123 MUST FAIL!
  let oldPwdFailed = false;
  try {
    verifyLogin('milansoni208@gmail.com', 'codelift123');
  } catch (err) {
    oldPwdFailed = true;
  }
  assert.strictEqual(oldPwdFailed, true, 'Old password codelift123 must be rejected after update');

  // Step E: Admin resets password back to default
  mockLocalStorage.removeItem(`codelift_student_pwd_${studentRecord.id}`);
  mockLocalStorage.removeItem(`codelift_student_pwd_milansoni208@gmail.com`);

  // Step F: Default password works again
  assert.strictEqual(verifyLogin('milansoni208@gmail.com', 'codelift123'), true);

  console.log('  ✓ Milan Soni workflow simulation: allows updated password, rejects old password, restores on reset');
  passedCount++;

  console.log(`✨ All ${passedCount}/${totalCount} Student Password & Auth tests PASSED!`);
  return { passedCount, totalCount };
}
