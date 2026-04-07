const dns = require("node:dns");
const nodemailer = require("nodemailer");
const {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  newLoginAlertTemplate,
  securityAlertTemplate,
} = require("./emailTemplates");

const SMTP_HOST = process.env.EMAIL_HOST;
const SMTP_PORT = Number(process.env.EMAIL_PORT);

// Render environments can fail on outbound IPv6 routes; prefer IPv4 for DNS lookups.
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const resolveSmtpHostToIPv4 = async () => {
  try {
    const addresses = await dns.promises.resolve4(SMTP_HOST);
    if (addresses.length > 0) {
      return addresses[0];
    }
  } catch (err) {
    console.warn(
      `[EMAIL] IPv4 DNS resolution failed for ${SMTP_HOST}, falling back to hostname: ${err.message}`,
    );
  }

  return SMTP_HOST;
};

const createTransporter = async () => {
  const smtpIPv4Host = await resolveSmtpHostToIPv4();

  return nodemailer.createTransport({
    host: smtpIPv4Host,
    port: SMTP_PORT,
    secure: false,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000, // 5 seconds to establish connection
    socketTimeout: 10000, // 10 seconds per operation
    greetingTimeout: 10000,
    tls: {
      servername: SMTP_HOST,
      rejectUnauthorized: false, // Allow self-signed certs (Gmail may use intermediate)
    },
  });
};

const sendMail = async (mailOptions) => {
  const transporter = await createTransporter();
  return transporter.sendMail(mailOptions);
};

// Verify SMTP config on startup
(async () => {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    console.log("[EMAIL] ✓ SMTP server is ready. Email service initialized.");
  } catch (err) {
    console.error("[EMAIL] ✗ SMTP configuration error on startup:");
    console.error("[EMAIL] Error:", err.message);
    console.error(
      "[EMAIL] Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS",
    );
  }
})();

/**
 * Send a generic email
 */
exports.sendEmail = async ({ to, subject, html }) => {
  await sendMail({
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
    const result = await sendMail({
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

  await sendMail({
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

  await sendMail({
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

  await sendMail({
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

  await sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Security Alert - ${alertType || "VISION"}`,
    html,
  });
};
