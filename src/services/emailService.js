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
import * as _supabaseClient from './supabaseClient.js';

// Lazy value accessors: defer reading exported bindings until call-time.
// This avoids `Cannot access 'X' before initialization` (TDZ) when Vite/Rollup
// evaluates this module before supabaseClient has finished initializing its
// exports (circular chunk ordering on /admin/fees and /admin/batches routes).
function getSupabase() {
  return { supabase: _supabaseClient.supabase, isSupabaseConfigured: _supabaseClient.isSupabaseConfigured };
}

export const MONTHLY_EMAIL_QUOTA = 200;
export const QUOTA_WARNING_THRESHOLD = 160; // 80%
export const QUOTA_BLOCK_THRESHOLD = 190;   // 95%

/**
 * Universal HTML Email Template
 * Adheres strictly to the official CodeLift email design standard.
 *
 * Variables:
 *   {{to_name}}     - Student / Recipient Name
 *   {{message}}     - Dynamic notification body
 *   {{action_text}} - Button label
 *   {{action_url}}  - Target destination link
 */
export const UNIVERSAL_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodeLift</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; background-color: #f5f7f5; color: #171717;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f7f5; padding: 32px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header with text logo -->
          <tr>
            <td style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #e8ebe8;">
              <a href="https://codelift-official.github.io/platform/" style="text-decoration: none; outline: none;">
                <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #171717; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Code<span style="color: #15803D;">Li</span>ft
                </span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #171717; line-height: 1.3;">
                Hi {{to_name}},
              </h1>

              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6; white-space: pre-line;">
                {{message}}
              </p>

              <p style="margin: 28px 0 32px 0; text-align: left;">
                <a
                  href="{{action_url}}"
                  target="_blank"
                  style="display: inline-block; text-decoration: none; outline: none; color: #ffffff; background-color: #15803D; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.2px;"
                >
                  {{action_text}}
                </a>
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top: 1px solid #e8ebe8; margin-top: 8px;">
                <tr>
                  <td style="padding-top: 24px;">
                    <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                      Need help? Our team is just a message away.
                    </p>
                    <p style="margin: 0 0 4px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                       <a href="mailto:codelift.official@gmail.com" style="color: #15803D; text-decoration: none; font-weight: 600;">codelift.official@gmail.com</a>
                    </p>
                    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                      <a href="https://wa.me/919834671940" style="color: #15803D; text-decoration: none; font-weight: 600;">+91 9834671940</a>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                Best regards,<br />
                <strong style="color: #171717;">Team CodeLift</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e8ebe8;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                <strong style="color: #171717;">CodeLift</strong><br />
                Plot 25, Gayatri Colony, Hazari Pahad, Nagpur
              </p>
              <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                <a href="https://www.instagram.com/codelift._/" style="color: #15803D; text-decoration: none; font-weight: 600;">Instagram</a>
                &nbsp;·&nbsp;
                <a href="https://share.google/qZlZpyhvHoGCLU4aZ" style="color: #15803D; text-decoration: none; font-weight: 600;">Google</a>
                &nbsp;·&nbsp;
                <a href="https://maps.app.goo.gl/GoQbaPXr3Gc5YvaB7" style="color: #15803D; text-decoration: none; font-weight: 600;">Maps</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

/**
 * Render complete HTML string using the universal template
 */
export function renderEmailHtml({
  to_name = 'Learner',
  message = '',
  action_url = 'https://codelift-official.github.io/platform/',
  action_text = 'Open Portal'
} = {}) {
  return UNIVERSAL_EMAIL_TEMPLATE
    .replace(/\{\{\s*to_name\s*\}\}/g, to_name || 'Learner')
    .replace(/\{\{\s*message\s*\}\}/g, message || '')
    .replace(/\{\{\s*action_url\s*\}\}/g, action_url || 'https://codelift-official.github.io/platform/')
    .replace(/\{\{\s*action_text\s*\}\}/g, action_text || 'Open Portal');
}

/**
 * Strip redundant greeting prefixes (e.g. "Hi {{student_name}},") from message body
 * since the universal template already renders a dedicated <h1>Hi {{to_name}},</h1>.
 */
export function cleanEmailMessage(text = '') {
  if (!text) return '';
  return text.replace(/^Hi\s+[^,\n]+,\s*\n*/i, '').trim();
}

/**
 * Human-readable fallback formatter for event types
 */
export function formatEventType(eventType = '') {
  if (!eventType) return 'Notification';
  return eventType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const DEFAULT_EMAIL_TEMPLATES = {
  signup_request: {
    enabled: true,
    isBulk: false,
    label: 'Course Registration / Inquiry',
    emailType: 'Course Registration',
    emailtype: 'Course Registration',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Welcome to CodeLift, {{student_name}}!',
    body: 'Thank you for registering your interest in {{course_title}}.\n\nOur admissions team will reach out to you within 24 hours on WhatsApp ({{phone}}) with syllabus details and upcoming commencement dates.',
    actionText: 'Explore CodeLift Courses',
    actionUrl: '/courses'
  },
  student_welcome: {
    enabled: true,
    isBulk: false,
    label: 'New Student Account Creation',
    emailType: 'Welcome to CodeLift',
    emailtype: 'Welcome to CodeLift',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Welcome Aboard, {{student_name}}!',
    body: 'Your student portal account has been provisioned for {{batch_name}}.\n\nYou can now log in to access your course syllabus, assignments, coding arena, and live assessments.\n\nRegistered Email: {{student_email}}\nDefault Password: {{password}}',
    actionText: 'Log In to Student Portal',
    actionUrl: '/login'
  },
  test_submission: {
    enabled: true,
    isBulk: false,
    label: 'Test Submission Confirmation',
    emailType: 'Test Submission',
    emailtype: 'Test Submission',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Assessment Completed!',
    body: 'You have successfully completed {{test_title}}.\n\nScore: {{score}} / {{total_questions}} ({{percentage}}%)\nStatus: {{status}}',
    actionText: 'View Test Results',
    actionUrl: '/student/tests'
  },
  test_retake: {
    enabled: true,
    isBulk: false,
    label: 'Test Retake Granted',
    emailType: 'Test Retake Granted',
    emailtype: 'Test Retake Granted',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Retake Unlocked!',
    body: 'Your instructor has granted you a retake attempt for {{test_title}}.\n\nYou may now re-attempt the assessment from your student portal.',
    actionText: 'Start Retake Attempt',
    actionUrl: '/student/tests'
  },
  assignment_submission: {
    enabled: true,
    isBulk: false,
    label: 'Assignment Submission Confirmation',
    emailType: 'Assignment Submission',
    emailtype: 'Assignment Submission',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Submission Received!',
    body: 'Your assignment submission for {{assignment_title}} has been received and queued for faculty review.\n\nSubmitted URL: {{submission_url}}',
    actionText: 'View Assignments',
    actionUrl: '/student/assignments'
  },
  assignment_graded: {
    enabled: true,
    isBulk: false,
    label: 'Assignment Evaluation & Marks',
    emailType: 'Assignment Graded',
    emailtype: 'Assignment Graded',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Assignment Evaluation Complete',
    body: 'Your submission for {{assignment_title}} has been evaluated by your instructor.\n\nMarks Awarded: {{marks}} / {{max_marks}}\nInstructor Feedback: {{feedback}}',
    actionText: 'View Detailed Review',
    actionUrl: '/student/assignments'
  },
  course_completion: {
    enabled: true,
    isBulk: false,
    label: '100% Course Completion',
    emailType: 'Course Completion',
    emailtype: 'Course Completion',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Curriculum Completed!',
    body: 'Congratulations on completing all modules and final requirements for {{course_title}}!\n\nYour achievement has been submitted to the academy office for verified certificate issuance.',
    actionText: 'View Course Dashboard',
    actionUrl: '/student/courses'
  },
  forgot_password: {
    enabled: true,
    isBulk: false,
    label: 'Password Reset Ticket Request',
    emailType: 'Password Reset Request',
    emailtype: 'Password Reset Request',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Password Reset Request',
    body: 'We received a password reset request for your account ({{student_email}}).\n\nTicket ID: {{ticket_id}}\nOur academic administrator has been notified and will assist you directly.',
    actionText: 'Visit CodeLift Portal',
    actionUrl: '/login'
  },
  password_reset: {
    enabled: true,
    isBulk: false,
    label: 'Password Change / Reset Confirmation',
    emailType: 'Password Reset',
    emailtype: 'Password Reset',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Password Updated Successfully',
    body: 'Your CodeLift student portal password was successfully updated on {{updated_at}}.\n\nRegistered Email: {{student_email}}\nUpdated Password: {{password}}\n\nIf you did not authorize this change, please contact academic administration immediately.',
    actionText: 'Sign In to Portal',
    actionUrl: '/login'
  },
  batch_allotment: {
    enabled: true,
    isBulk: false,
    label: 'Student Cohort / Batch Allotment',
    emailType: 'Batch Allotment',
    emailtype: 'Batch Allotment',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Welcome to {{batch_name}}!',
    body: 'You have been enrolled into {{batch_name}}.\n\nPlease check your student dashboard to review your active syllabus, live schedules, and learning materials.',
    actionText: 'Go to Student Dashboard',
    actionUrl: '/student/dashboard'
  },
  fee_collected: {
    enabled: true,
    isBulk: false,
    label: 'Tuition Payment Receipt',
    emailType: 'Fee Receipt',
    emailtype: 'Fee Receipt',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Tuition Fee Payment Confirmed',
    body: 'We have received your tuition payment of {{amount_paid}} for {{batch_name}}.\n\nReceipt Number: {{receipt_no}}\nPayment Mode: {{payment_mode}}\nDate: {{date}}\nRemaining Tuition Due: {{remaining_due}}',
    actionText: 'View Fee Ledger',
    actionUrl: '/student/fees'
  },
  fee_reminder: {
    enabled: false, // Bulk action: admin activates when ready
    isBulk: true,
    label: 'Tuition Fee Reminder (Batch / Selective)',
    emailType: 'Fee Reminder',
    emailtype: 'Fee Reminder',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Tuition Balance Reminder',
    body: 'This is a friendly reminder regarding your outstanding tuition balance for {{batch_name}}.\n\nPending Amount: {{due_amount}}\nTotal Program Fee: {{total_fee}}\nPaid So Far: {{paid_amount}}\nDue Date: {{due_date}}\n\nPayment Details:\n{{payment_instructions}}',
    actionText: 'View Fee Status',
    actionUrl: '/student/fees'
  },
  course_allotment_batch: {
    enabled: false, // Bulk action: default off to protect monthly quota
    isBulk: true,
    label: 'Batch Notification: Course Allocated',
    emailType: 'Course Allotment',
    emailtype: 'Course Allotment',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'New Course Curriculum Available!',
    body: 'A new course, {{course_title}}, has just been added to your cohort {{batch_name}}.\n\nLog in now to review the modules and start learning.',
    actionText: 'Start Learning',
    actionUrl: '/student/courses'
  },
  test_allotment_batch: {
    enabled: false, // Bulk action: default off to protect monthly quota
    isBulk: true,
    label: 'Batch Notification: Test Scheduled',
    emailType: 'Test Scheduled',
    emailtype: 'Test Scheduled',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'New Test Assigned!',
    body: 'A new assessment, {{test_title}}, has been assigned to your batch {{batch_name}}.\n\nPlease review the syllabus topics and attempt the test on time.',
    actionText: 'View Test Schedule',
    actionUrl: '/student/tests'
  },
  assignment_allotment_batch: {
    enabled: false, // Bulk action: default off to protect monthly quota
    isBulk: true,
    label: 'Batch Notification: Assignment Given',
    emailType: 'Assignment Allotment',
    emailtype: 'Assignment Allotment',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'New Practical Assignment!',
    body: 'A new assignment, {{assignment_title}}, has been assigned to {{batch_name}}.\n\nFollow the project brief, build your solution, and submit your GitHub/Drive repository.',
    actionText: 'View Assignment Brief',
    actionUrl: '/student/assignments'
  },
  certificate_issued: {
    enabled: true,
    isBulk: false,
    label: 'Official Certificate Issuance',
    emailType: 'Certificate Issued',
    emailtype: 'Certificate Issued',
    subject: '{{emailtype}} — {{studentname}}',
    heading: 'Your Verified Certificate is Ready!',
    body: 'Congratulations! Your official CodeLift Academy Certificate for {{course_title}} has been signed and issued.\n\nCertificate ID: {{certificate_id}}',
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
  const { supabase, isSupabaseConfigured } = getSupabase();
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
 * Fully protected by try-catch so it never disrupts caller operations.
 */
async function logEmailDispatch({ eventType, recipientEmail, recipientName, subject, success, errorMessage }) {
  // Update local fallback cache
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const cached = JSON.parse(localStorage.getItem('codelift_email_quota_cache') || '{"count":0,"month":""}');
    const nextCount = (cached.month === currentMonth ? cached.count : 0) + (success ? 1 : 0);
    localStorage.setItem('codelift_email_quota_cache', JSON.stringify({ count: nextCount, month: currentMonth }));
  } catch (_) {}

  const { supabase, isSupabaseConfigured } = getSupabase();
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
 * Resilience Architecture:
 * This function NEVER throws unhandled exceptions. Failures (network timeouts,
 * quota exhaustion, invalid credentials, SMTP rejections) are safely captured,
 * logged to audit logs and console, and return { success: false, error: ... }
 * without impeding or crashing any primary business operation.
 *
 * Model Binding:
 * Automatically normalizes heterogeneous model bindings across students,
 * courses, fees, tests, and certificates (e.g. studentName, name, email,
 * studentEmail, course_title, courseTitle, due_amount, amount_paid).
 *
 * @param {string} eventType - e.g. 'student_welcome', 'fee_collected'
 * @param {Object} recipient - { email, name } or student entity
 * @param {Object} dynamicData - Template replacement values
 * @param {Object} settings - Platform email settings object
 * @returns {Promise<{ success: boolean, reason?: string, error?: string }>}
 */
/**
 * Build and normalize complete EmailJS template payload.
 *
 * Guarantees all 6 core template parameters:
 *   - emailtype:    Formatted event type label (e.g. "Welcome to CodeLift")
 *   - studentname:  Normalized recipient / student name
 *   - message:      Notification body (cleaned of redundant greetings)
 *   - action_url:   Full absolute destination URL with /platform/ base
 *   - action_text:  Call-to-action button label
 *   - to_email:     Validated recipient email address (plus email aliases)
 */
export function buildEmailTemplateParams({ eventType, recipient, dynamicData = {}, settings = {} }) {
  // 1. Recipient Email Normalization
  const recipientEmail = (
    recipient?.email
    || recipient?.studentEmail
    || recipient?.to_email
    || dynamicData?.student_email
    || dynamicData?.studentEmail
    || dynamicData?.email
    || dynamicData?.to_email
    || ''
  ).trim();

  // 2. Recipient Name Normalization
  const recipientName = (
    recipient?.name
    || recipient?.studentName
    || recipient?.to_name
    || dynamicData?.student_name
    || dynamicData?.studentname
    || dynamicData?.studentName
    || dynamicData?.name
    || dynamicData?.to_name
    || 'Learner'
  ).trim() || 'Learner';

  const eventConfig = (settings?.emailEventTemplates && settings?.emailEventTemplates[eventType])
    || DEFAULT_EMAIL_TEMPLATES[eventType]
    || {};

  // 3. Dynamic Entity Data Normalization
  const normalizedData = {
    course_title: dynamicData.course_title || dynamicData.courseTitle || dynamicData.courseName || dynamicData.course || '',
    batch_name: dynamicData.batch_name || dynamicData.batchName || dynamicData.batchId || '',
    test_title: dynamicData.test_title || dynamicData.testTitle || dynamicData.title || 'Assessment',
    assignment_title: dynamicData.assignment_title || dynamicData.assignmentTitle || dynamicData.title || 'Assignment',
    due_amount: dynamicData.due_amount !== undefined ? dynamicData.due_amount : (dynamicData.pendingFee !== undefined ? `₹${Number(dynamicData.pendingFee).toLocaleString('en-IN')}` : ''),
    amount_paid: dynamicData.amount_paid !== undefined ? dynamicData.amount_paid : (dynamicData.paidFee !== undefined ? `₹${Number(dynamicData.paidFee).toLocaleString('en-IN')}` : ''),
    total_fee: dynamicData.total_fee !== undefined ? dynamicData.total_fee : (dynamicData.totalFee !== undefined ? `₹${Number(dynamicData.totalFee).toLocaleString('en-IN')}` : ''),
    receipt_no: dynamicData.receipt_no || dynamicData.receiptNo || dynamicData.receiptId || '',
    certificate_id: dynamicData.certificate_id || dynamicData.certificateId || '',
    phone: dynamicData.phone || dynamicData.mobile || dynamicData.whatsapp || '',
    password: dynamicData.password || dynamicData.new_password || dynamicData.newPassword || dynamicData.defaultPassword || dynamicData.default_password || (eventType === 'student_welcome' ? 'codelift123' : ''),
    default_password: dynamicData.default_password || dynamicData.defaultPassword || 'codelift123',
    new_password: dynamicData.new_password || dynamicData.newPassword || dynamicData.password || '',
    updated_at: dynamicData.updated_at || dynamicData.updatedAt || new Date().toLocaleString('en-IN')
  };

  // 4. Resolve Email Type (e.g. "Welcome to CodeLift", "Test Submission")
  const emailType = eventConfig.emailType
    || eventConfig.emailtype
    || DEFAULT_EMAIL_TEMPLATES[eventType]?.emailType
    || eventConfig.label
    || formatEventType(eventType);

  const mergedData = {
    platform_name: settings.instituteName || 'CodeLift Academy',
    student_name: recipientName,
    studentname: recipientName,
    studentName: recipientName,
    to_name: recipientName,
    student_email: recipientEmail,
    emailtype: emailType,
    email_type: emailType,
    ...normalizedData,
    ...dynamicData
  };

  mergedData.studentname = mergedData.studentname || recipientName;
  mergedData.emailtype = mergedData.emailtype || emailType;

  // 5. Enforce Standardized Subject: {{emailtype}} — {{studentname}}
  const rawSubject = eventConfig.subject || DEFAULT_EMAIL_TEMPLATES[eventType]?.subject || '{{emailtype}} — {{studentname}}';
  const isLegacySubject = rawSubject && (
    !rawSubject.includes('{{studentname}}') &&
    !rawSubject.includes('{{student_name}}') &&
    !rawSubject.includes('{{to_name}}')
  );

  const subjectTemplate = isLegacySubject ? '{{emailtype}} — {{studentname}}' : rawSubject;
  const subject = interpolateString(subjectTemplate, mergedData) || `${emailType} — ${recipientName}`;

  // 6. Body & Message Processing (cleaned of redundant greetings)
  const heading = interpolateString(eventConfig.heading || DEFAULT_EMAIL_TEMPLATES[eventType]?.heading || 'Important Update', mergedData);
  const rawBody = dynamicData?.message || eventConfig.body || DEFAULT_EMAIL_TEMPLATES[eventType]?.body || 'You have a new update from CodeLift Academy.';
  const message = cleanEmailMessage(interpolateString(rawBody, mergedData));
  const actionText = interpolateString(eventConfig.actionText || DEFAULT_EMAIL_TEMPLATES[eventType]?.actionText || 'Open Portal', mergedData) || 'Open Portal';

  // 7. Construct Absolute Action URL with correct /platform/ base path
  let rawUrl = eventConfig.actionUrl || DEFAULT_EMAIL_TEMPLATES[eventType]?.actionUrl || '/';
  if (mergedData.action_url) rawUrl = mergedData.action_url;

  let actionUrl = rawUrl;
  if (!actionUrl.startsWith('http://') && !actionUrl.startsWith('https://')) {
    const cleanPath = actionUrl.startsWith('/') ? actionUrl : `/${actionUrl}`;
    const isLocal = typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1');
    if (isLocal) {
      actionUrl = `${window.location.origin}${cleanPath}`;
    } else {
      const pathWithBase = cleanPath.startsWith('/platform') ? cleanPath : `/platform${cleanPath}`;
      actionUrl = `https://codelift-official.github.io${pathWithBase}`;
    }
  }

  // 8. Build Universal Template Params matching EmailJS dashboard requirements
  const templateParams = {
    // 1. emailtype
    emailtype: emailType,
    email_type: emailType,

    // 2. studentname
    studentname: recipientName,
    student_name: recipientName,
    to_name: recipientName,
    name: recipientName,
    user_name: recipientName,

    // 3. message
    message,

    // 4. action_url
    action_url: actionUrl,

    // 5. action_text
    action_text: actionText,

    // 6. to_email & email aliases
    to_email: recipientEmail,
    email: recipientEmail,
    user_email: recipientEmail,
    recipient_email: recipientEmail,
    student_email: recipientEmail,
    studentemail: recipientEmail,
    to: recipientEmail,
    recipient: recipientEmail,

    // 7. Dynamic credential & entity parameters
    password: mergedData.password,
    new_password: mergedData.new_password,
    default_password: mergedData.default_password,
    updated_at: mergedData.updated_at,

    // Additional standard fields
    subject,
    heading,
    reply_to: settings.supportEmail || 'codelift.official@gmail.com',
    platform_name: mergedData.platform_name,
    html_message: renderEmailHtml({
      to_name: recipientName,
      message,
      action_url: actionUrl,
      action_text: actionText
    })
  };

  return {
    recipientEmail,
    recipientName,
    subject,
    templateParams
  };
}

export async function sendNotificationEmail(eventType, recipient, dynamicData = {}, settings = {}) {
  try {
    // 1. Check master email toggle
    if (!settings?.enabled) {
      return { success: false, reason: 'Email notifications globally disabled' };
    }

    // 2. Validate credentials
    const { serviceId, templateId, publicKey } = settings;
    if (!serviceId || !templateId || !publicKey) {
      console.warn(`[EmailService] Discarding ${eventType} dispatch: EmailJS credentials not fully configured.`);
      return { success: false, reason: 'EmailJS credentials not fully configured' };
    }

    // 3. Check event template & event toggle
    const eventConfig = (settings?.emailEventTemplates && settings?.emailEventTemplates[eventType])
      || DEFAULT_EMAIL_TEMPLATES[eventType]
      || {};

    if (eventConfig.enabled === false) {
      return { success: false, reason: `Event ${eventType} is disabled` };
    }

    const { recipientEmail, recipientName, subject, templateParams } = buildEmailTemplateParams({
      eventType,
      recipient,
      dynamicData,
      settings
    });

    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn(`[EmailService] Discarding ${eventType} dispatch: Missing or invalid email for recipient "${recipientName}".`);
      return { success: false, reason: 'Invalid or missing recipient email address' };
    }

    // 11. Dispatch via EmailJS SDK
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
    // Non-blocking catch-all: log error and return failure status without throwing
    console.error(`[EmailService] Failed to dispatch ${eventType} email to ${recipient?.email || dynamicData?.student_email || 'recipient'}:`, err);

    try {
      await logEmailDispatch({
        eventType,
        recipientEmail: recipient?.email || dynamicData?.student_email || 'unknown',
        recipientName: recipient?.name || dynamicData?.student_name || '',
        subject: `[Failed] ${eventType}`,
        success: false,
        errorMessage: err.message || String(err)
      });
    } catch (_) {}

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
    const studentEmail = student?.email || student?.studentEmail;
    if (!studentEmail || !studentEmail.includes('@')) {
      results.skipped.push({ student, reason: 'No valid email address on file' });
      continue;
    }

    // Merge individual student-specific data
    const studentData = {
      ...dynamicData,
      student_name: student.name || 'Student',
      student_email: studentEmail,
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
    studentname: 'Test Administrator',
    to_name: 'Test Administrator',
    student_email: testEmail,
    emailtype: 'Email Service Verification',
    platform_name: settings.instituteName || 'CodeLift Academy'
  };

  const testConfig = {
    ...settings,
    enabled: true,
    emailEventTemplates: {
      test_verification: {
        enabled: true,
        emailType: 'Email Service Verification',
        emailtype: 'Email Service Verification',
        subject: '{{emailtype}} — {{studentname}}',
        heading: 'Email Service Connected Successfully',
        body: 'Congratulations! Your EmailJS credentials and universal template are properly connected to the CodeLift Platform.\n\nAll automated emails will now dispatch according to your configured platform event toggles.',
        actionText: 'Return to Platform Settings',
        actionUrl: '/admin/settings'
      }
    }
  };

  return sendNotificationEmail('test_verification', { email: testEmail, name: 'Test Administrator' }, testData, testConfig);
}
