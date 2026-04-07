const dns = require("node:dns");
const nodemailer = require("nodemailer");
const {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  newLoginAlertTemplate,
  securityAlertTemplate,
} = require("./emailTemplates");

const RESEND_API_URL = "https://api.resend.com/emails";
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || "").toLowerCase();

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const isResendConfigured = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

const isSmtpConfigured = () =>
  Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_FROM,
  );

const resolveSmtpHostToIPv4 = async (host) => {
  try {
    const addresses = await dns.promises.resolve4(host);
    if (addresses.length > 0) {
      return addresses[0];
    }
  } catch (err) {
    console.warn(
      `[EMAIL] IPv4 DNS resolution failed for ${host}: ${err.message}`,
    );
  }

  return host;
};

const checkEmailHealth = () => {
  const provider = EMAIL_PROVIDER || (isResendConfigured() ? "resend" : "smtp");

  if (provider === "smtp") {
    const missing = [];

    if (!process.env.EMAIL_HOST) missing.push("EMAIL_HOST");
    if (!process.env.EMAIL_PORT) missing.push("EMAIL_PORT");
    if (!process.env.EMAIL_USER) missing.push("EMAIL_USER");
    if (!process.env.EMAIL_PASS) missing.push("EMAIL_PASS");
    if (!process.env.EMAIL_FROM) missing.push("EMAIL_FROM");

    return {
      ok: missing.length === 0,
      provider: "smtp",
      missing,
    };
  }

  const missing = [];

  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.EMAIL_FROM) missing.push("EMAIL_FROM");

  return {
    ok: missing.length === 0,
    provider: "resend",
    missing,
  };
};

const sendMail = async (mailOptions) => {
  const provider = EMAIL_PROVIDER || (isResendConfigured() ? "resend" : "smtp");

  if (provider === "smtp") {
    if (!isSmtpConfigured()) {
      throw new Error("Missing SMTP configuration");
    }

    const smtpHost = await resolveSmtpHostToIPv4(process.env.EMAIL_HOST);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
      family: 4,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 5000,
      socketTimeout: 10000,
      greetingTimeout: 10000,
      tls: {
        servername: process.env.EMAIL_HOST,
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    return { messageId: info.messageId };
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const payload = {
    from: mailOptions.from,
    to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
    subject: mailOptions.subject,
    html: mailOptions.html,
  };

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    const err = new Error(`Resend send failed: ${message}`);
    err.code = "RESEND_SEND_FAILED";
    err.status = response.status;
    throw err;
  }

  return { messageId: data?.id };
};

// Verify HTTP email config on startup
(async () => {
  try {
    const health = checkEmailHealth();
    if (!health.ok) {
      throw new Error(`Missing ${health.missing.join(", ")}`);
    }

    console.log(
      `[EMAIL] ✓ ${health.provider.toUpperCase()} email service initialized.`,
    );
  } catch (err) {
    console.error("[EMAIL] ✗ Email configuration error on startup:");
    console.error("[EMAIL] Error:", err.message);
    console.error("[EMAIL] Check EMAIL_PROVIDER and related env vars");
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

exports.checkEmailHealth = checkEmailHealth;
