/**
 * Notification Service for CodeLift Platform
 * Provides simulated email previews and real WhatsApp Web / wa.me deep links.
 * Works 100% client-side with zero backend dependencies, while also supporting
 * the optional backend API endpoint if configured.
 */

export const ADMIN_WA = import.meta.env.VITE_ADMIN_WHATSAPP || '919834671940';

export const INSTITUTE_INFO = {
  name: 'CodeLift Academy',
  phone: '919834671940',
  email: 'codelift.official@gmail.com',
  website: 'https://codelift.in'
};

export function buildAdminNotification(type, data) {
  const templates = {
    new_enquiry: `New enquiry from ${data.name}\nPhone: ${data.phone}\nInterest: ${data.interest}`,
    fee_recorded: `Fee of ₹${data.amount} recorded for ${data.studentName} on ${data.date}`,
    enrolment_verified: `Enrolment verified for ${data.studentName} in ${data.courseTitle}`,
    certificate_issued: `Certificate issued to ${data.studentName} for ${data.courseTitle}`,
    student_added: `New student added: ${data.name} (${data.email})\nPassword: ${data.password || 'codelift123'}`,
    password_reset_request: `🔑 CodeLift Password Reset Complaint\nTicket: ${data.ticketId || 'PWD-REQ'}\nStudent: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nReason: ${data.reason || 'Forgot student password'}\n\nPlease reset my student portal password to default.`,
    password_reset_resolved: `✅ CodeLift Password Reset\nHello ${data.name},\nYour student portal password has been reset by Admin to default: ${data.defaultPassword || 'codelift123'}\nEmail: ${data.email}\nPortal URL: ${window.location.origin}/login\n\nPlease log in and continue your coding learning!`,
  };
  return templates[type] || '';
}

export function openAdminWhatsApp(message) {
  const url = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Clean phone number to standard international format without '+' or spaces.
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return INSTITUTE_INFO.phone;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Build WhatsApp deep link URL.
 */
export function buildWhatsAppUrl(phone, text) {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Fee Payment Receipt Notification
 */
export function createFeeReceiptNotification({ student, fee, batch }) {
  const studentName = student?.name || 'Student';
  const studentPhone = student?.phone || '';
  const studentEmail = student?.email || '';
  const amountStr = formatCurrency(fee?.amount || 0);
  const dateStr = fee?.paidAt ? new Date(fee.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today';
  const mode = fee?.mode || 'Online';
  const batchName = batch?.name || 'CodeLift Batch';

  const emailSubject = `Fee Receipt: ${amountStr} received - ${INSTITUTE_INFO.name}`;
  const emailBody = `Dear ${studentName},

We have successfully received your fee payment. Here are your transaction details:

RECEIPT DETAILS

Student Name : ${studentName}
Batch        : ${batchName}
Amount Paid  : ${amountStr}
Payment Date : ${dateStr}
Payment Mode : ${mode}
Status       : CONFIRMED

Thank you for choosing ${INSTITUTE_INFO.name} for your tech career transformation!

Warm regards,
Accounts Desk
${INSTITUTE_INFO.name}
Email: ${INSTITUTE_INFO.email} | WhatsApp: +${INSTITUTE_INFO.phone}`;

  const whatsappMessage = `*FEE PAYMENT RECEIPT - ${INSTITUTE_INFO.name}*
Dear *${studentName}*,
We have received your payment of *${amountStr}*.

• *Batch:* ${batchName}
• *Date:* ${dateStr}
• *Mode:* ${mode}
• *Status:* CONFIRMED

Thank you for being part of CodeLift!
_For any queries, reply directly to this message._`;

  return {
    type: 'fee_receipt',
    recipientName: studentName,
    recipientPhone: studentPhone,
    recipientEmail: studentEmail,
    emailSubject,
    emailBody,
    whatsappMessage,
    whatsappUrl: buildWhatsAppUrl(studentPhone, whatsappMessage)
  };
}

/**
 * Fee Reminder Notification
 */
export function createFeeReminderNotification({ student, pendingAmount, dueDate, batch }) {
  const studentName = student?.name || 'Student';
  const studentPhone = student?.phone || '';
  const studentEmail = student?.email || '';
  const amountStr = formatCurrency(pendingAmount || 0);
  const dueStr = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'within 3 days';
  const batchName = batch?.name || 'your enrolled batch';

  const emailSubject = `Gentle Reminder: Pending Fee Payment of ${amountStr} - ${INSTITUTE_INFO.name}`;
  const emailBody = `Dear ${studentName},

This is a gentle reminder regarding your pending fee installment for *${batchName}*.

Pending Balance : ${amountStr}
Due Date        : ${dueStr}

Please ensure the clearance of the dues to maintain uninterrupted access to your live LMS portal, doubt sessions, and certification.

Payment modes accepted: UPI / Bank Transfer / Cash at Center.

Warm regards,
Administration
${INSTITUTE_INFO.name}`;

  const whatsappMessage = `*GENTLE FEE REMINDER - ${INSTITUTE_INFO.name}*

Dear *${studentName}*,

This is a friendly reminder that your pending balance of *${amountStr}* for *${batchName}* is due on *${dueStr}*.

Please clear the dues to ensure continuous LMS & mentor access.
UPI ID: \`\`

Thank you!
_${INSTITUTE_INFO.name}_`;

  return {
    type: 'fee_reminder',
    recipientName: studentName,
    recipientPhone: studentPhone,
    recipientEmail: studentEmail,
    emailSubject,
    emailBody,
    whatsappMessage,
    whatsappUrl: buildWhatsAppUrl(studentPhone, whatsappMessage)
  };
}

/**
 * Assignment Published Notification
 */
export function createAssignmentPublishedNotification({ student, assignment, batch }) {
  const studentName = student?.name || 'Student';
  const studentPhone = student?.phone || '';
  const studentEmail = student?.email || '';
  const title = assignment?.title || 'New Assignment';
  const dueDate = assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-IN') : 'Upcoming';
  const batchName = batch?.name || 'your batch';

  const emailSubject = `New Assignment Published: ${title} - ${INSTITUTE_INFO.name}`;
  const emailBody = `Hello ${studentName},

A new hands-on assignment has just been posted for ${batchName}:

Assignment : ${title}
Due Date   : ${dueDate}

Please log into your CodeLift Student Portal to view requirements, starter files, and submit your solution.

Happy coding!
Academic Team, ${INSTITUTE_INFO.name}`;

  const whatsappMessage = `*NEW ASSIGNMENT POSTED*

Hi *${studentName}*!
A new assignment *"${title}"* is now live for *${batchName}*.

• *Due Date:* ${dueDate}
Log in to your portal to begin!`;

  return {
    type: 'assignment_published',
    recipientName: studentName,
    recipientPhone: studentPhone,
    recipientEmail: studentEmail,
    emailSubject,
    emailBody,
    whatsappMessage,
    whatsappUrl: buildWhatsAppUrl(studentPhone, whatsappMessage)
  };
}

/**
 * Assignment Graded Notification
 */
export function createAssignmentResultNotification({ student, assignment, submission }) {
  const studentName = student?.name || 'Student';
  const studentPhone = student?.phone || '';
  const studentEmail = student?.email || '';
  const title = assignment?.title || 'Assignment';
  const grade = submission?.grade || 'Graded';
  const feedback = submission?.feedback || 'Great effort! Keep practicing.';

  const emailSubject = `Assignment Evaluated: ${title} (Score: ${grade}) - ${INSTITUTE_INFO.name}`;
  const emailBody = `Hello ${studentName},

Your submission for "${title}" has been evaluated by your faculty mentor:

Grade / Score: ${grade}
Feedback     : ${feedback}

Check your portal for detailed code notes and suggestions.`;

  const whatsappMessage = `*ASSIGNMENT EVALUATED*

Hi *${studentName}*!
Your score for *"${title}"* is *${grade}*.

• *Feedback:* "${feedback}"
Check your CodeLift Student Portal for full remarks!`;

  return {
    type: 'assignment_result',
    recipientName: studentName,
    recipientPhone: studentPhone,
    recipientEmail: studentEmail,
    emailSubject,
    emailBody,
    whatsappMessage,
    whatsappUrl: buildWhatsAppUrl(studentPhone, whatsappMessage)
  };
}

/**
 * Certificate Issued + Referral Code Notification
 */
export function createCertificateIssuedNotification({ student, certificate, referralCode }) {
  const studentName = student?.name || 'Student';
  const studentPhone = student?.phone || '';
  const studentEmail = student?.email || '';
  const courseName = certificate?.courseName || 'Full Stack Program';
  const certId = certificate?.certificateId || 'CERT-2026-0001';
  const refCode = referralCode || `LIFT-${studentName.slice(0, 4).toUpperCase()}2026`;

  const emailSubject = `Congratulations! Your Certificate is Ready + Your Referral Code - ${INSTITUTE_INFO.name}`;
  const emailBody = `Dear ${studentName},

Huge congratulations on successfully completing the ${courseName} at ${INSTITUTE_INFO.name}!

Your verified digital credential is now live:
Certificate ID : ${certId}


YOUR EXCLUSIVE REFERRAL CODE: ${refCode}

Share this code with your friends or college peers.
When they enroll at CodeLift using your code:
- They get an instant ₹500 discount on tuition fees
- You receive a ₹500 Amazon Voucher / direct UPI cashback!

Download your high-resolution certificate from the Student Portal today.

Warmest congratulations,
Director & Academic Board
${INSTITUTE_INFO.name}`;

  const whatsappMessage = `*CONGRATULATIONS ${studentName.toUpperCase()}!*

You have officially graduated in *${courseName}*!
• *Certificate ID:* ${certId}

*YOUR EXCLUSIVE REFERRAL CODE:* \`${refCode}\`
Share this with friends:
• They get *₹500 OFF* any CodeLift course
• You get *₹500 Cash reward* per enrollment!

Download your certificate now in the Student Portal!`;

  return {
    type: 'certificate_issued',
    recipientName: studentName,
    recipientPhone: studentPhone,
    recipientEmail: studentEmail,
    referralCode: refCode,
    emailSubject,
    emailBody,
    whatsappMessage,
    whatsappUrl: buildWhatsAppUrl(studentPhone, whatsappMessage)
  };
}
