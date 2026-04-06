const dns = require("dns");
const nodemailer = require("nodemailer");
const {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  newLoginAlertTemplate,
  securityAlertTemplate,
} = require("./emailTemplates");

// Render environments can be IPv4-only for outbound traffic.
// Prefer IPv4 so smtp.gmail.com does not resolve to unreachable IPv6 addresses.
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // 5 seconds to establish connection
  socketTimeout: 10000, // 10 seconds per operation
  tls: {
    rejectUnauthorized: false, // Allow self-signed certs (Gmail may use intermediate)
  },
});

// Verify SMTP config on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("[EMAIL] ✗ SMTP configuration error on startup:");
    console.error("[EMAIL] Error:", err.message);
    console.error(
      "[EMAIL] Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS",
    );
  } else {
    console.log("[EMAIL] ✓ SMTP server is ready. Email service initialized.");
  }
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

  try {
    console.log(`[EMAIL] Sending verification email to ${to}...`);
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Verify Your Email - VISION",
      html,
    });
    console.log(
      `[EMAIL] ✓ Verification email sent successfully to ${to}. Message ID: ${result.messageId}`,
    );
    return result;
  } catch (err) {
    console.error(`[EMAIL] ✗ Failed to send verification email to ${to}:`);
    console.error(`[EMAIL] Error Code: ${err.code}`);
    console.error(`[EMAIL] Error Message: ${err.message}`);
    console.error(`[EMAIL] Full Error:`, err);
    throw err;
  }
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
