/**
 * VISION - Branded HTML Email Templates
 * Uses Handlebars templates for base and email bodies.
 */
const fs = require("node:fs");
const path = require("node:path");
const Handlebars = require("handlebars");

const brandColors = {
  primary: "#4F46E5",
  secondary: "#7C3AED",
  accent: "#06B6D4",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  dark: "#1F2937",
  light: "#F9FAFB",
  white: "#FFFFFF",
};

const compileTemplate = (templatePath) => {
  const source = fs.readFileSync(templatePath, "utf8");
  return Handlebars.compile(source);
};

const templatesDir = path.join(__dirname, "../templates");
const emailTemplatesDir = path.join(templatesDir, "emails");

const renderBaseTemplate = compileTemplate(
  path.join(templatesDir, "baseEmail.hbs"),
);

const renderEmailVerification = compileTemplate(
  path.join(emailTemplatesDir, "emailVerification.hbs"),
);
const renderPasswordReset = compileTemplate(
  path.join(emailTemplatesDir, "passwordReset.hbs"),
);
const renderWelcome = compileTemplate(
  path.join(emailTemplatesDir, "welcome.hbs"),
);
const renderNewLoginAlert = compileTemplate(
  path.join(emailTemplatesDir, "newLoginAlert.hbs"),
);
const renderSecurityAlert = compileTemplate(
  path.join(emailTemplatesDir, "securityAlert.hbs"),
);

const renderWithBase = (content, previewText = "") =>
  renderBaseTemplate({
    content,
    previewText,
    year: new Date().getFullYear(),
    primaryColor: brandColors.primary,
    secondaryColor: brandColors.secondary,
    lightColor: brandColors.light,
    whiteColor: brandColors.white,
  });

const userNameHtml = (name) => (name ? ` <strong>${name}</strong>` : "");

const emailVerificationTemplate = ({
  userName,
  verificationLink,
  expiresIn = "24 hours",
}) => {
  const content = renderEmailVerification({
    userNameHtml: userNameHtml(userName),
    verificationLink,
    expiresIn,
    darkColor: brandColors.dark,
    warningColor: brandColors.warning,
    primaryColor: brandColors.primary,
    secondaryColor: brandColors.secondary,
    lightColor: brandColors.light,
    whiteColor: brandColors.white,
  });

  return renderWithBase(
    content,
    "Please verify your email address to complete your VISION registration.",
  );
};

const passwordResetTemplate = ({
  userName,
  resetLink,
  expiresIn = "1 hour",
  ipAddress,
  userAgent,
}) => {
  const requestDetailsHtml =
    ipAddress || userAgent
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${brandColors.light}; border-radius: 8px; margin-bottom: 20px;"><tr><td style="padding: 16px;"><p style="margin: 0 0 8px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 600; color: ${brandColors.dark};">Request Details:</p>${ipAddress ? `<p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">IP Address: ${ipAddress}</p>` : ""}${userAgent ? `<p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">Device: ${userAgent}</p>` : ""}</td></tr></table>`
      : "";

  const content = renderPasswordReset({
    userNameHtml: userNameHtml(userName),
    resetLink,
    expiresIn,
    requestDetailsHtml,
    darkColor: brandColors.dark,
    dangerColor: brandColors.danger,
    primaryColor: brandColors.primary,
    secondaryColor: brandColors.secondary,
    lightColor: brandColors.light,
    whiteColor: brandColors.white,
  });

  return renderWithBase(content, "Reset your VISION password");
};

const welcomeTemplate = ({ userName, loginLink }) => {
  const content = renderWelcome({
    userNameHtml: userNameHtml(userName),
    loginLink,
    darkColor: brandColors.dark,
    successColor: brandColors.success,
    whiteColor: brandColors.white,
  });

  return renderWithBase(
    content,
    "Welcome to VISION! Your email has been verified.",
  );
};

const newLoginAlertTemplate = ({
  userName,
  deviceInfo,
  ipAddress,
  loginTime,
  location,
}) => {
  const locationRowHtml = location
    ? `<tr><td style="padding: 8px 0; border-top: 1px solid #E5E7EB;"><p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">Location</p><p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 500; color: ${brandColors.dark};">${location}</p></td></tr>`
    : "";

  const content = renderNewLoginAlert({
    userNameHtml: userNameHtml(userName),
    deviceInfo: deviceInfo || "Unknown Device",
    ipAddress: ipAddress || "Unknown",
    loginTime: loginTime || new Date().toISOString(),
    locationRowHtml,
    darkColor: brandColors.dark,
    warningColor: brandColors.warning,
    lightColor: brandColors.light,
  });

  return renderWithBase(content, "New login detected on your VISION account");
};

const securityAlertTemplate = ({
  userName,
  alertType,
  message,
  actionLink,
  actionText,
}) => {
  const actionButtonHtml =
    actionLink && actionText
      ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding: 20px 0;"><a href="${actionLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; color: ${brandColors.white}; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">${actionText}</a></td></tr></table>`
      : "";

  const content = renderSecurityAlert({
    userNameHtml: userNameHtml(userName),
    alertType: alertType || "Security Alert",
    message,
    actionButtonHtml,
    darkColor: brandColors.dark,
    warningColor: brandColors.warning,
    whiteColor: brandColors.white,
  });

  return renderWithBase(content, alertType || "Security Alert from VISION");
};

module.exports = {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  newLoginAlertTemplate,
  securityAlertTemplate,
  brandColors,
};
