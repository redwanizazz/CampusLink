const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendPasswordResetEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@campuslink.edu',
    to,
    subject: 'CampusLink — Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#4f46e5">CampusLink</h2>
        <p>You requested a password reset for your CampusLink account.</p>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">Reset Password</a>
        </p>
        <p style="color:#6b7280;font-size:13px">If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#9ca3af;font-size:12px">CampusLink &mdash; Campus Communication Platform</p>
      </div>
    `,
  });
};

const sendUrgentNoticeEmail = async (to, title, content, noticeUrl) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@campuslink.edu',
    to,
    subject: `[URGENT] CampusLink Notice: ${title}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#dc2626">⚠ Urgent Notice — CampusLink</h2>
        <h3 style="color:#111827">${title}</h3>
        <p style="color:#374151;line-height:1.6">${content}</p>
        <p style="margin:24px 0">
          <a href="${noticeUrl}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600">View Full Notice</a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#9ca3af;font-size:12px">CampusLink &mdash; Campus Communication Platform</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail, sendUrgentNoticeEmail };
