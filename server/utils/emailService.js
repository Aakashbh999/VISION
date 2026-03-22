const nodemailer = require("nodemailer");
const {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  newLoginAlertTemplate,
  securityAlertTemplate,
} = require("./emailTemplates");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a generic email
 */
exports.sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

/**
 * Send email verification email
 */
exports.sendVerificationEmail = async ({ to, userName, verificationLink }) => {
  const html = emailVerificationTemplate({
    userName,
    verificationLink,
    expiresIn: "24 hours",
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify Your Email - VISION",
    html,
  });
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async ({
  to,
  userName,
  resetLink,
  ipAddress,
  userAgent,
}) => {
  const html = passwordResetTemplate({
    userName,
    resetLink,
    expiresIn: "1 hour",
    ipAddress,
    userAgent,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset Your Password - VISION",
    html,
  });
};

/**
 * Send welcome email after verification
 */
exports.sendWelcomeEmail = async ({ to, userName }) => {
  const html = welcomeTemplate({
    userName,
    loginLink: `${process.env.FRONTEND_URL}/login`,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Welcome to VISION! 🎉",
    html,
  });
};

/**
 * Send new login alert email
 */
exports.sendNewLoginAlert = async ({
  to,
  userName,
  deviceInfo,
  ipAddress,
  loginTime,
  location,
}) => {
  const html = newLoginAlertTemplate({
    userName,
    deviceInfo,
    ipAddress,
    loginTime,
    location,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "New Login to Your VISION Account",
    html,
  });
};

/**
 * Send security alert email
 */
exports.sendSecurityAlert = async ({
  to,
  userName,
  alertType,
  message,
  actionLink,
  actionText,
}) => {
  const html = securityAlertTemplate({
    userName,
    alertType,
    message,
    actionLink,
    actionText,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Security Alert - ${alertType || "VISION"}`,
    html,
  });
};
