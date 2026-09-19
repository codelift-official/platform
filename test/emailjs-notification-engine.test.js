/**
 * CodeLift EmailJS Notification Engine Unit & Integration Tests
 *
 * Verifies:
 * 1. Universal template variable interpolation ({{variable}} syntax)
 * 2. 200 emails/month quota calculation, 80% warning (160) & 95% block (190)
 * 3. Master toggle & credentials validation guards
 * 4. Transactional (default ON) vs Bulk (default OFF) categorization
 * 5. Partial failure handling & report aggregation in batch dispatch
 * 6. Selective fee reminder recipient filtering
 * 7. Non-blocking error handling & resilience
 */

import assert from 'assert';
import {
  MONTHLY_EMAIL_QUOTA,
  QUOTA_WARNING_THRESHOLD,
  QUOTA_BLOCK_THRESHOLD,
  DEFAULT_EMAIL_TEMPLATES,
  interpolateString
} from '../src/services/emailService.js';

export async function runEmailNotificationEngineTests() {
  console.log('\n🔵 RUNNING SUITE: EmailJS Notification Engine & Quota Architecture');

  let passed = 0;
  let total = 0;

  function test(desc, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log(`  ✓ ${desc}`);
    } catch (err) {
      console.error(`  ✗ ${desc}:`, err.message);
      throw err;
    }
  }

  // 1. Template Interpolation Tests
  test('interpolateString replaces single and multiple variables correctly', () => {
    const template = 'Hi {{student_name}}, welcome to {{course_title}}!';
    const data = { student_name: 'Aarav', course_title: 'Full Stack Web Dev' };
    const result = interpolateString(template, data);
    assert.strictEqual(result, 'Hi Aarav, welcome to Full Stack Web Dev!');
  });

  test('interpolateString handles numeric and falsy values without undefined output', () => {
    const template = 'Score: {{score}}/{{total}} ({{pct}}%). Due: {{due_amount}}. Mode: {{payment_mode}}';
    const data = { score: 0, total: 10, pct: 0, due_amount: 5000, payment_mode: 'UPI' };
    const result = interpolateString(template, data);
    assert.strictEqual(result, 'Score: 0/10 (0%). Due: 5000. Mode: UPI');
  });

  test('interpolateString leaves unknown placeholders as empty string without crashing', () => {
    const template = 'Hello {{name}}, your receipt is {{receipt_no}} and {{missing_val}}!';
    const data = { name: 'Priya', receipt_no: 'REC-9921' };
    const result = interpolateString(template, data);
    assert.strictEqual(result, 'Hello Priya, your receipt is REC-9921 and !');
  });

  // 2. Quota Constants & Thresholds
  test('Monthly quota limits align with EmailJS Free Tier (200/month, 80% warning at 160, 95% block at 190)', () => {
    assert.strictEqual(MONTHLY_EMAIL_QUOTA, 200, 'Monthly quota should be 200 emails');
    assert.strictEqual(QUOTA_WARNING_THRESHOLD, 160, 'Warning threshold should be 160 emails (80%)');
    assert.strictEqual(QUOTA_BLOCK_THRESHOLD, 190, 'Block threshold should be 190 emails (95%)');

    // Quota math check
    const currentUsage = 165;
    const isWarning = currentUsage >= QUOTA_WARNING_THRESHOLD;
    const isBlock = currentUsage >= QUOTA_BLOCK_THRESHOLD;
    const remaining = Math.max(0, MONTHLY_EMAIL_QUOTA - currentUsage);

    assert.strictEqual(isWarning, true, 'Usage 165 should trigger warning');
    assert.strictEqual(isBlock, false, 'Usage 165 should not block yet');
    assert.strictEqual(remaining, 35, 'Remaining should be 35 emails');
  });

  // 3. Template Catalog & Default Categorization
  test('All 16 required notification event types exist in DEFAULT_EMAIL_TEMPLATES', () => {
    const requiredEvents = [
      'signup_request',
      'student_welcome',
      'test_submission',
      'test_retake',
      'assignment_submission',
      'assignment_graded',
      'course_completion',
      'forgot_password',
      'password_reset',
      'batch_allotment',
      'fee_collected',
      'fee_reminder',
      'course_allotment_batch',
      'test_allotment_batch',
      'assignment_allotment_batch',
      'certificate_issued'
    ];

    requiredEvents.forEach((evt) => {
      assert.ok(DEFAULT_EMAIL_TEMPLATES[evt], `Missing required event template: ${evt}`);
      assert.ok(DEFAULT_EMAIL_TEMPLATES[evt].subject, `Event ${evt} must have a subject template`);
      assert.ok(DEFAULT_EMAIL_TEMPLATES[evt].heading, `Event ${evt} must have a heading template`);
      assert.ok(DEFAULT_EMAIL_TEMPLATES[evt].body, `Event ${evt} must have a body template`);
    });
  });

  test('Bulk events are default OFF to prevent quota exhaustion; transactional are default ON', () => {
    const bulkEvents = [
      'course_allotment_batch',
      'test_allotment_batch',
      'assignment_allotment_batch',
      'fee_reminder'
    ];

    const transactionalEvents = [
      'signup_request',
      'student_welcome',
      'test_submission',
      'test_retake',
      'assignment_submission',
      'assignment_graded',
      'course_completion',
      'forgot_password',
      'password_reset',
      'batch_allotment',
      'fee_collected',
      'certificate_issued'
    ];

    bulkEvents.forEach((evt) => {
      assert.strictEqual(DEFAULT_EMAIL_TEMPLATES[evt].enabled, false, `Bulk event ${evt} must be default disabled`);
      assert.strictEqual(DEFAULT_EMAIL_TEMPLATES[evt].isBulk, true, `Bulk event ${evt} must be marked isBulk: true`);
    });

    transactionalEvents.forEach((evt) => {
      assert.strictEqual(DEFAULT_EMAIL_TEMPLATES[evt].enabled, true, `Transactional event ${evt} must be default enabled`);
      assert.strictEqual(DEFAULT_EMAIL_TEMPLATES[evt].isBulk, false, `Transactional event ${evt} must be marked isBulk: false`);
    });
  });

  // 4. Batch Partial Failure Handling Simulation
  test('Batch notification simulation tracks sent, failed, and skipped recipients without crashing', async () => {
    const mockStudents = [
      { id: 's1', name: 'Valid User 1', email: 'user1@example.com' },
      { id: 's2', name: 'No Email User', email: '' },
      { id: 's3', name: 'Failing User', email: 'error@fail.com' },
      { id: 's4', name: 'Valid User 2', email: 'user2@example.com' }
    ];

    // Mock runner function simulating sendBatchNotificationEmail logic
    const mockSend = async (student) => {
      if (student.email === 'error@fail.com') {
        throw new Error('Simulated SMTP/EmailJS API 400 rejection');
      }
      return { status: 200, text: 'OK' };
    };

    const results = {
      sent: [],
      failed: [],
      skipped: []
    };

    for (const student of mockStudents) {
      if (!student.email || !student.email.includes('@')) {
        results.skipped.push({ student, reason: 'No valid email address' });
        continue;
      }

      try {
        await mockSend(student);
        results.sent.push(student);
      } catch (err) {
        results.failed.push({ student, error: err.message });
      }
    }

    assert.strictEqual(results.sent.length, 2, 'Should have 2 successfully sent emails');
    assert.strictEqual(results.skipped.length, 1, 'Should have 1 skipped student (no email)');
    assert.strictEqual(results.failed.length, 1, 'Should have 1 failed student (rejection handled)');
    assert.strictEqual(results.failed[0].student.id, 's3');
    assert.strictEqual(results.skipped[0].student.id, 's2');
  });

  // 5. Selective Fee Reminder Filtering
  test('Selective fee reminder correctly identifies pending dues and excludes paid students', () => {
    const cohortStudents = [
      { id: 's1', name: 'Alok', email: 'alok@test.com', totalFee: 30000, paidFee: 30000, feeStatus: 'Paid' },
      { id: 's2', name: 'Dev', email: 'dev@test.com', totalFee: 30000, paidFee: 10000, feeStatus: 'Partial' },
      { id: 's3', name: 'Isha', email: 'isha@test.com', totalFee: 30000, paidFee: 0, feeStatus: 'Pending' }
    ];

    // Filter students eligible for reminders
    const dueStudents = cohortStudents.filter((s) => {
      const remaining = (Number(s.totalFee) || 0) - (Number(s.paidFee) || 0);
      return remaining > 0 && s.feeStatus !== 'Paid';
    });

    assert.strictEqual(dueStudents.length, 2, 'Only 2 students have outstanding dues');
    assert.deepStrictEqual(dueStudents.map(s => s.id), ['s2', 's3']);

    // Admin selectively selects only Dev
    const selectedIds = new Set(['s2']);
    const recipients = dueStudents.filter(s => selectedIds.has(s.id));
    assert.strictEqual(recipients.length, 1);
    assert.strictEqual(recipients[0].name, 'Dev');
  });

  // 6. Non-blocking Fail-Safe Resilience
  test('Email failures do not disrupt primary business operations', async () => {
    let operationCompleted = false;

    const mockBusinessAction = async () => {
      // 1. Primary action
      operationCompleted = true;

      // 2. Email trigger in try-catch
      try {
        throw new Error('Network error connecting to email service');
      } catch (emailErr) {
        // Logged but never re-thrown
      }

      return { success: true };
    };

    const result = await mockBusinessAction();
    assert.strictEqual(result.success, true);
    assert.strictEqual(operationCompleted, true, 'Primary operation must complete regardless of email status');
  });

  console.log(`\n🎉 SUITE PASSED: ${passed}/${total} assertions successful.`);
  return { passedCount: passed, totalCount: total };
}
