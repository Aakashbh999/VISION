const dns = require("node:dns");
const nodemailer = require("nodemailer");
const createError = require("http-errors");
const env = require("../config/env");
const logger = require("./logger");
const {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  newLoginAlertTemplate,
  securityAlertTemplate,
} = require("./emailTemplates");

const RESEND_API_URL = "https://api.resend.com/emails";
const EMAIL_PROVIDER = (env.EMAIL_PROVIDER || "").toLowerCase();

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const isResendConfigured = () => Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);

const isSmtpConfigured = () =>
  Boolean(
    env.EMAIL_HOST &&
    env.EMAIL_PORT &&
    env.EMAIL_USER &&
    env.EMAIL_PASS &&
    env.EMAIL_FROM,
  );

const resolveSmtpHostToIPv4 = async (host) => {
  try {
    const addresses = await dns.promises.resolve4(host);
    if (addresses.length > 0) {
      return addresses[0];
    }
  } catch (err) {
    logger.warn({ err, host }, "IPv4 DNS resolution failed for SMTP host");
  }

  return host;
};

const checkEmailHealth = () => {
  const provider = EMAIL_PROVIDER || (isResendConfigured() ? "resend" : "smtp");

  if (provider === "smtp") {
    const missing = [];

    if (!env.EMAIL_HOST) missing.push("EMAIL_HOST");
    if (!env.EMAIL_PORT) missing.push("EMAIL_PORT");
    if (!env.EMAIL_USER) missing.push("EMAIL_USER");
    if (!env.EMAIL_PASS) missing.push("EMAIL_PASS");
    if (!env.EMAIL_FROM) missing.push("EMAIL_FROM");

    return {
      ok: missing.length === 0,
      provider: "smtp",
      missing,
    };
  }

  const missing = [];

  if (!env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!env.EMAIL_FROM) missing.push("EMAIL_FROM");

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
      throw createError(500, "Missing SMTP configuration");
    }

    const smtpHost = await resolveSmtpHostToIPv4(env.EMAIL_HOST);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(env.EMAIL_PORT),
      secure: Number(env.EMAIL_PORT) === 465,
      family: 4,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
      connectionTimeout: 5000,
      socketTimeout: 10000,
      greetingTimeout: 10000,
      tls: {
        servername: env.EMAIL_HOST,
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    return { messageId: info.messageId };
  }

  if (!env.RESEND_API_KEY) {
    throw createError(500, "Missing RESEND_API_KEY");
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
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
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
      throw createError(500, `Missing ${health.missing.join(", ")}`);
    }

    logger.info({ provider: health.provider }, "Email service initialized");
  } catch (err) {
    logger.error({ err }, "Email configuration error on startup");
  }
})();

/**
 * Send a generic email
 */
exports.sendEmail = async ({ to, subject, html }) => {
  await sendMail({
    from: env.EMAIL_FROM,
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
    logger.info({ to }, "Sending verification email");
    const result = await sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: "Verify Your Email - VISION",
      html,
    });
    logger.info({ to, messageId: result.messageId }, "Verification email sent");
    return result;
  } catch (err) {
    logger.error({ err, to }, "Failed to send verification email");
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
    from: env.EMAIL_FROM,
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
    loginLink: `${env.FRONTEND_URL || "http://localhost:5173"}/login`,
  });

  await sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Welcome to VISION!",
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
    from: env.EMAIL_FROM,
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
    from: env.EMAIL_FROM,
    to,
    subject: `Security Alert - ${alertType || "VISION"}`,
    html,
  });
};

exports.checkEmailHealth = checkEmailHealth;
