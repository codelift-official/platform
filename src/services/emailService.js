/**
 * CodeLift EmailJS Notification Engine
 *
 * Security Note:
 * EmailJS public key is intentionally public and exposed in the browser.
 * Abuse is prevented by:
 *   1. Domain restriction (Allowed Origins in EmailJS dashboard)
 *   2. Monthly quota (200 emails on free tier)
 *   3. Rate limiting on EmailJS's side
 * Do NOT treat this key as a secret.
 */

import emailjs from '@emailjs/browser';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export const MONTHLY_EMAIL_QUOTA = 200;
export const QUOTA_WARNING_THRESHOLD = 160; // 80%
export const QUOTA_BLOCK_THRESHOLD = 190;   // 95%

export const DEFAULT_EMAIL_TEMPLATES = {
  signup_request: {
    enabled: true,
    isBulk: false,
    label: 'Course Registration / Inquiry',
    subject: 'Application Received — {{course_title}}',
    heading: 'Welcome to CodeLift, {{student_name}}!',
    body: 'Thank you for registering your interest in {{course_title}}.\n\nOur admissions team will reach out to you within 24 hours on WhatsApp ({{phone}}) with syllabus details and upcoming commencement dates.',
    actionText: 'Explore CodeLift Courses',
    actionUrl: '/courses'
  },
  student_welcome: {
    enabled: true,
    isBulk: false,
    label: 'New Student Account Creation',
    subject: 'Welcome to CodeLift — Your Student Account is Ready',
    heading: 'Welcome Aboard, {{student_name}}!',
    body: 'Your student portal account has been provisioned for {{batch_name}}.\n\nYou can now log in to access your course syllabus, assignments, coding arena, and live assessments.\n\nRegistered Email: {{student_email}}',
    actionText: 'Log In to Student Portal',
    actionUrl: '/login'
  },
  test_submission: {
    enabled: true,
    isBulk: false,
    label: 'Test Submission Confirmation',
    subject: 'Test Submitted: {{test_title}} (Score: {{percentage}}%)',
    heading: 'Assessment Completed!',
    body: 'Hi {{student_name}},\n\nYou have successfully completed {{test_title}}.\n\nScore: {{score}} / {{total_questions}} ({{percentage}}%)\nStatus: {{status}}',
    actionText: 'View Test Results',
    actionUrl: '/student/tests'
  },
  test_retake: {
    enabled: true,
    isBulk: false,
    label: 'Test Retake Granted',
    subject: 'Test Retake Granted: {{test_title}}',
    heading: 'Retake Unlocked!',
    body: 'Hi {{student_name}},\n\nYour instructor has granted you a retake attempt for {{test_title}}.\n\nYou may now re-attempt the assessment from your student portal.',
    actionText: 'Start Retake Attempt',
    actionUrl: '/student/tests'
  },
  assignment_submission: {
    enabled: true,
    isBulk: false,
    label: 'Assignment Submission Confirmation',
    subject: 'Assignment Submitted: {{assignment_title}}',
    heading: 'Submission Received!',
    body: 'Hi {{student_name}},\n\nYour assignment submission for {{assignment_title}} has been received and queued for faculty review.\n\nSubmitted URL: {{submission_url}}',
    actionText: 'View Assignments',
    actionUrl: '/student/assignments'
  },
  assignment_graded: {
    enabled: true,
    isBulk: false,
    label: 'Assignment Evaluation & Marks',
    subject: 'Assignment Graded: {{assignment_title}} (Marks: {{marks}}/{{max_marks}})',
    heading: 'Assignment Evaluation Complete',
    body: 'Hi {{student_name}},\n\nYour submission for {{assignment_title}} has been evaluated by your instructor.\n\nMarks Awarded: {{marks}} / {{max_marks}}\nInstructor Feedback: {{feedback}}',
    actionText: 'View Detailed Review',
    actionUrl: '/student/assignments'
  },
  course_completion: {
    enabled: true,
    isBulk: false,
    label: '100% Course Completion',
    subject: 'Congratulations on Completing {{course_title}}!',
    heading: 'Curriculum Completed!',
    body: 'Hi {{student_name}},\n\nCongratulations on completing all modules and final requirements for {{course_title}}!\n\nYour achievement has been submitted to the academy office for verified certificate issuance.',
    actionText: 'View Course Dashboard',
    actionUrl: '/student/courses'
  },
  forgot_password: {
    enabled: true,
    isBulk: false,
    label: 'Password Reset Ticket Request',
    subject: 'Password Reset Request Received (Ticket #{{ticket_id}})',
    heading: 'Password Reset Request',
    body: 'Hi {{student_name}},\n\nWe received a password reset request for your account ({{student_email}}).\n\nTicket ID: {{ticket_id}}\nOur academic administrator has been notified and will assist you directly.',
    actionText: 'Visit CodeLift Portal',
    actionUrl: '/login'
  },
  password_reset: {
    enabled: true,
    isBulk: false,
    label: 'Password Change / Reset Confirmation',
    subject: 'Security Alert: Your Password Was Updated',
    heading: 'Password Updated Successfully',
    body: 'Hi {{student_name}},\n\nYour CodeLift student portal password was successfully updated on {{updated_at}}.\n\nIf you did not authorize this change, please contact academic administration immediately.',
    actionText: 'Sign In to Portal',
    actionUrl: '/login'
  },
  batch_allotment: {
    enabled: true,
    isBulk: false,
    label: 'Student Cohort / Batch Allotment',
    subject: 'Cohort Allotment: You have been assigned to {{batch_name}}',
    heading: 'Welcome to {{batch_name}}!',
    body: 'Hi {{student_name}},\n\nYou have been enrolled into {{batch_name}}.\n\nPlease check your student dashboard to review your active syllabus, live schedules, and learning materials.',
    actionText: 'Go to Student Dashboard',
    actionUrl: '/student/dashboard'
  },
  fee_collected: {
    enabled: true,
    isBulk: false,
    label: 'Tuition Payment Receipt',
    subject: 'Official Tuition Receipt: {{amount_paid}} Received (Rec #{{receipt_no}})',
    heading: 'Tuition Fee Payment Confirmed',
    body: 'Hi {{student_name}},\n\nWe have received your tuition payment of {{amount_paid}} for {{batch_name}}.\n\nReceipt Number: {{receipt_no}}\nPayment Mode: {{payment_mode}}\nDate: {{date}}\nRemaining Tuition Due: {{remaining_due}}',
    actionText: 'View Fee Ledger',
    actionUrl: '/student/fees'
  },
  fee_reminder: {
    enabled: false, // Bulk action: admin activates when ready
    isBulk: true,
    label: 'Tuition Fee Reminder (Batch / Selective)',
    subject: 'Tuition Fee Reminder: Payment Due for {{batch_name}}',
    heading: 'Tuition Balance Reminder',
    body: 'Hi {{student_name}},\n\nThis is a friendly reminder regarding your outstanding tuition balance for {{batch_name}}.\n\nPending Amount: {{due_amount}}\nTotal Program Fee: {{total_fee}}\nPaid So Far: {{paid_amount}}\nDue Date: {{due_date}}\n\nPayment Details:\n{{payment_instructions}}',
    actionText: 'View Fee Status',
    actionUrl: '/student/fees'
  },
  course_allotment_batch: {
    enabled: false, // Bulk action: default off to protect monthly quota
    isBulk: true,
    label: 'Batch Notification: Course Allocated',
    subject: 'New Course Added to {{batch_name}}: {{course_title}}',
    heading: 'New Course Curriculum Available!',
    body: 'Hi {{student_name}},\n\nA new course, {{course_title}}, has just been added to your cohort {{batch_name}}.\n\nLog in now to review the modules and start learning.',
    actionText: 'Start Learning',
    actionUrl: '/student/courses'
  },
  test_allotment_batch: {
    enabled: false, // Bulk action: default off to protect monthly quota
    isBulk: true,
    label: 'Batch Notification: Test Scheduled',
    subject: 'New Assessment Scheduled: {{test_title}}',
    heading: 'New Test Assigned!',
    body: 'Hi {{student_name}},\n\nA new assessment, {{test_title}}, has been assigned to your batch {{batch_name}}.\n\nPlease review the syllabus topics and attempt the test on time.',
    actionText: 'View Test Schedule',
    actionUrl: '/student/tests'
  },
  assignment_allotment_batch: {
    enabled: false, // Bulk action: default off to protect monthly quota
    isBulk: true,
    label: 'Batch Notification: Assignment Given',
    subject: 'New Assignment Assigned: {{assignment_title}}',
    heading: 'New Practical Assignment!',
    body: 'Hi {{student_name}},\n\nA new assignment, {{assignment_title}}, has been assigned to {{batch_name}}.\n\nFollow the project brief, build your solution, and submit your GitHub/Drive repository.',
    actionText: 'View Assignment Brief',
    actionUrl: '/student/assignments'
  },
  certificate_issued: {
    enabled: true,
    isBulk: false,
    label: 'Official Certificate Issuance',
    subject: 'Verified Certificate Issued: {{course_title}}',
    heading: 'Your Verified Certificate is Ready!',
    body: 'Hi {{student_name}},\n\nCongratulations! Your official CodeLift Academy Certificate for {{course_title}} has been signed and issued.\n\nCertificate ID: {{certificate_id}}',
    actionText: 'View & Download Certificate',
    actionUrl: '/student/certificates'
  }
};

/**
 * Replace all {{key}} occurrences in a string with data[key]
 */
export function interpolateString(template = '', data = {}) {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
  });
}

/**
 * Fetch total emails dispatched in the current calendar month
 */
export async function getMonthlyEmailUsage() {
  if (!isSupabaseConfigured) {
    try {
      const cached = JSON.parse(localStorage.getItem('codelift_email_quota_cache') || '{"count":0,"month":""}');
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (cached.month === currentMonth) return cached.count;
    } catch (_) {}
    return 0;
  }

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('email_quota_log')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', startOfMonth.toISOString());

    if (error) {
      console.warn('[EmailService] Failed to query quota count:', error);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.warn('[EmailService] Quota query exception:', err);
    return 0;
  }
}

/**
 * Log email dispatch in Supabase for audit & quota calculation
 */
async function logEmailDispatch({ eventType, recipientEmail, recipientName, subject, success, errorMessage }) {
  // Update local fallback cache
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const cached = JSON.parse(localStorage.getItem('codelift_email_quota_cache') || '{"count":0,"month":""}');
    const nextCount = (cached.month === currentMonth ? cached.count : 0) + (success ? 1 : 0);
    localStorage.setItem('codelift_email_quota_cache', JSON.stringify({ count: nextCount, month: currentMonth }));
  } catch (_) {}

  if (!isSupabaseConfigured) return;

  try {
    await supabase.from('email_quota_log').insert({
      event_type: eventType,
      recipient_email: recipientEmail,
      recipient_name: recipientName || '',
      subject: subject || '',
      success: Boolean(success),
      error_message: errorMessage || null,
      sent_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[EmailService] Failed to log quota row:', err);
  }
}

/**
 * Send an individual notification email via EmailJS using the universal template
 *
 * @param {string} eventType - e.g. 'student_welcome', 'fee_collected'
 * @param {Object} recipient - { email, name }
 * @param {Object} dynamicData - Template replacement values
 * @param {Object} settings - Platform email settings object
 * @returns {Promise<{ success: boolean, reason?: string, error?: string }>}
 */
export async function sendNotificationEmail(eventType, recipient, dynamicData = {}, settings = {}) {
  // 1. Check master email toggle
  if (!settings.enabled) {
    return { success: false, reason: 'Email notifications globally disabled' };
  }

  // 2. Validate credentials
  const { serviceId, templateId, publicKey } = settings;
  if (!serviceId || !templateId || !publicKey) {
    return { success: false, reason: 'EmailJS credentials not fully configured' };
  }

  // 3. Check event template & event toggle
  const eventConfig = (settings.emailEventTemplates && settings.emailEventTemplates[eventType])
    || DEFAULT_EMAIL_TEMPLATES[eventType];

  if (!eventConfig || eventConfig.enabled === false) {
    return { success: false, reason: `Event ${eventType} is disabled` };
  }

  const recipientEmail = recipient?.email || dynamicData.student_email || dynamicData.to_email;
  const recipientName = recipient?.name || dynamicData.student_name || dynamicData.to_name || 'Learner';

  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, reason: 'Invalid or missing recipient email address' };
  }

  // 4. Merge default parameters with dynamic data
  const mergedData = {
    platform_name: settings.instituteName || 'CodeLift Academy',
    student_name: recipientName,
    student_email: recipientEmail,
    ...dynamicData
  };

  const subject = interpolateString(eventConfig.subject || DEFAULT_EMAIL_TEMPLATES[eventType]?.subject || 'Notification from CodeLift', mergedData);
  const heading = interpolateString(eventConfig.heading || DEFAULT_EMAIL_TEMPLATES[eventType]?.heading || 'Important Update', mergedData);
  const message = interpolateString(eventConfig.body || DEFAULT_EMAIL_TEMPLATES[eventType]?.body || '', mergedData);
  const actionText = interpolateString(eventConfig.actionText || DEFAULT_EMAIL_TEMPLATES[eventType]?.actionText || 'Open Portal', mergedData);
  
  // Construct absolute action URL
  let rawUrl = eventConfig.actionUrl || DEFAULT_EMAIL_TEMPLATES[eventType]?.actionUrl || '/';
  if (mergedData.action_url) rawUrl = mergedData.action_url;
  const actionUrl = rawUrl.startsWith('http') ? rawUrl : `${window.location.origin}${rawUrl}`;

  // 5. Build Universal EmailJS Template payload
  const templateParams = {
    to_name: recipientName,
    to_email: recipientEmail,
    reply_to: settings.supportEmail || 'support@codelift.dev',
    subject,
    heading,
    message,
    action_text: actionText,
    action_url: actionUrl,
    platform_name: mergedData.platform_name
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    
    await logEmailDispatch({
      eventType,
      recipientEmail,
      recipientName,
      subject,
      success: true
    });

    return { success: true, status: response.status, text: response.text };
  } catch (err) {
    console.warn(`[EmailService] Failed to send ${eventType} email to ${recipientEmail}:`, err);

    await logEmailDispatch({
      eventType,
      recipientEmail,
      recipientName,
      subject,
      success: false,
      errorMessage: err.message || String(err)
    });

    return { success: false, error: err.message || 'Email delivery failed' };
  }
}

/**
 * Send batch notifications with partial failure tracking and safe rate limiting
 *
 * @param {string} eventType - e.g. 'fee_reminder', 'course_allotment_batch'
 * @param {Array<Object>} students - Array of student records
 * @param {Object} dynamicData - Template replacement values
 * @param {Object} settings - Platform email settings object
 * @param {number} staggerMs - Delay between emails in milliseconds (default: 500ms)
 * @returns {Promise<{ sent: Array, failed: Array, skipped: Array, total: number }>}
 */
export async function sendBatchNotificationEmail(
  eventType,
  students = [],
  dynamicData = {},
  settings = {},
  staggerMs = 500
) {
  const results = {
    sent: [],
    failed: [],
    skipped: [],
    total: students.length
  };

  if (!Array.isArray(students) || students.length === 0) {
    return results;
  }

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    if (!student.email || !student.email.includes('@')) {
      results.skipped.push({ student, reason: 'No valid email address on file' });
      continue;
    }

    // Merge individual student-specific data
    const studentData = {
      ...dynamicData,
      student_name: student.name || 'Student',
      student_email: student.email,
      due_amount: student.pendingFee !== undefined ? `₹${Number(student.pendingFee).toLocaleString('en-IN')}` : dynamicData.due_amount,
      total_fee: student.totalFee !== undefined ? `₹${Number(student.totalFee).toLocaleString('en-IN')}` : dynamicData.total_fee,
      paid_amount: student.paidFee !== undefined ? `₹${Number(student.paidFee).toLocaleString('en-IN')}` : dynamicData.paid_amount
    };

    try {
      const res = await sendNotificationEmail(eventType, student, studentData, settings);
      if (res.success) {
        results.sent.push({ student });
      } else {
        results.failed.push({ student, error: res.error || res.reason });
      }
    } catch (err) {
      results.failed.push({ student, error: err.message || 'Unknown delivery failure' });
    }

    // Stagger to prevent rate-limiting on browser client
    if (i < students.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, staggerMs));
    }
  }

  return results;
}

/**
 * Send a quick test email to verify credentials and template bindings
 */
export async function testEmailConfiguration(testEmail, settings = {}) {
  const testData = {
    student_name: 'Test Administrator',
    student_email: testEmail,
    platform_name: settings.instituteName || 'CodeLift Academy'
  };

  const testConfig = {
    ...settings,
    enabled: true,
    emailEventTemplates: {
      test_verification: {
        enabled: true,
        subject: 'CodeLift EmailJS Integration Verified! 🚀',
        heading: 'Email Service Connected Successfully',
        body: 'Congratulations! Your EmailJS credentials and universal template are properly connected to the CodeLift Platform.\n\nAll automated emails will now dispatch according to your configured platform event toggles.',
        actionText: 'Return to Platform Settings',
        actionUrl: '/admin/settings'
      }
    }
  };

  return sendNotificationEmail('test_verification', { email: testEmail, name: 'Test Administrator' }, testData, testConfig);
}
