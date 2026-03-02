/**
 * VISION - Branded HTML Email Templates
 * Consistent styling across all emails
 */

const brandColors = {
  primary: "#4F46E5", // Indigo
  secondary: "#7C3AED", // Purple
  accent: "#06B6D4", // Cyan
  success: "#10B981", // Emerald
  warning: "#F59E0B", // Amber
  danger: "#EF4444", // Red
  dark: "#1F2937", // Gray-800
  light: "#F9FAFB", // Gray-50
  white: "#FFFFFF",
};

/**
 * Base email template wrapper
 */
const baseTemplate = (content, previewText = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>VISION</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: ${brandColors.light};
    }
    a {
      color: ${brandColors.primary};
    }
    @media screen and (max-width: 600px) {
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .mobile-full-width {
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${brandColors.light};">
  <!-- Preview text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>
  
  <!-- Main wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${brandColors.light};">
    <tr>
      <td align="center" style="padding: 40px 0;">
        
        <!-- Email container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="mobile-full-width" style="max-width: 600px; background-color: ${brandColors.white}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); padding: 30px 40px; border-radius: 12px 12px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 28px; font-weight: 700; color: ${brandColors.white}; letter-spacing: -0.5px;">
                      VISION
                    </h1>
                    <p style="margin: 5px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: rgba(255,255,255,0.85);">
                      Your Academic Journey Starts Here
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="mobile-padding" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${brandColors.light}; padding: 30px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #E5E7EB;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6B7280;">
                      This email was sent by VISION Academic Portal
                    </p>
                    <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #9CA3AF;">
                      &copy; ${new Date().getFullYear()} VISION. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Email Verification Template
 */
const emailVerificationTemplate = ({
  userName,
  verificationLink,
  expiresIn = "24 hours",
}) => {
  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <h2 style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: ${brandColors.dark};">
            Verify Your Email Address
          </h2>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            Hi${userName ? ` <strong>${userName}</strong>` : ""},
          </p>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            Welcome to VISION! Please verify your email address to complete your registration and unlock all features of our academic portal.
          </p>
          
          <!-- CTA Button -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; color: ${brandColors.white}; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">
                  Verify Email Address
                </a>
              </td>
            </tr>
          </table>
          
          <p style="margin: 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 22px; color: #6B7280;">
            Or copy and paste this link into your browser:
          </p>
          
          <p style="margin: 0 0 20px 0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 20px; color: ${brandColors.primary}; word-break: break-all; background-color: ${brandColors.light}; padding: 12px; border-radius: 6px;">
            ${verificationLink}
          </p>
          
          <!-- Info box -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF3C7; border-radius: 8px; border-left: 4px solid ${brandColors.warning};">
            <tr>
              <td style="padding: 16px;">
                <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 20px; color: #92400E;">
                  <strong>Note:</strong> This link will expire in <strong>${expiresIn}</strong>. If you didn't create an account with VISION, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(
    content,
    "Please verify your email address to complete your VISION registration.",
  );
};

/**
 * Password Reset Template
 */
const passwordResetTemplate = ({
  userName,
  resetLink,
  expiresIn = "1 hour",
  ipAddress,
  userAgent,
}) => {
  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <h2 style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: ${brandColors.dark};">
            Reset Your Password
          </h2>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            Hi${userName ? ` <strong>${userName}</strong>` : ""},
          </p>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <!-- CTA Button -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; color: ${brandColors.white}; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">
                  Reset Password
                </a>
              </td>
            </tr>
          </table>
          
          <p style="margin: 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 22px; color: #6B7280;">
            Or copy and paste this link into your browser:
          </p>
          
          <p style="margin: 0 0 20px 0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 20px; color: ${brandColors.primary}; word-break: break-all; background-color: ${brandColors.light}; padding: 12px; border-radius: 6px;">
            ${resetLink}
          </p>
          
          <!-- Security info -->
          ${
            ipAddress || userAgent
              ? `
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${brandColors.light}; border-radius: 8px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 16px;">
                <p style="margin: 0 0 8px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 600; color: ${brandColors.dark};">
                  Request Details:
                </p>
                ${ipAddress ? `<p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">IP Address: ${ipAddress}</p>` : ""}
                ${userAgent ? `<p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">Device: ${userAgent}</p>` : ""}
              </td>
            </tr>
          </table>
          `
              : ""
          }
          
          <!-- Warning box -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEE2E2; border-radius: 8px; border-left: 4px solid ${brandColors.danger};">
            <tr>
              <td style="padding: 16px;">
                <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 20px; color: #991B1B;">
                  <strong>Security Notice:</strong> This link expires in <strong>${expiresIn}</strong>. If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(content, "Reset your VISION password");
};

/**
 * Welcome Email Template (after verification)
 */
const welcomeTemplate = ({ userName, loginLink }) => {
  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <!-- Success icon -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <div style="width: 60px; height: 60px; background-color: ${brandColors.success}; border-radius: 50%; display: inline-block; line-height: 60px; text-align: center;">
                  <span style="color: ${brandColors.white}; font-size: 30px;">✓</span>
                </div>
              </td>
            </tr>
          </table>
          
          <h2 style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: ${brandColors.dark}; text-align: center;">
            Welcome to VISION!
          </h2>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            Hey${userName ? ` <strong>${userName}</strong>` : ""},
          </p>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            Your email has been verified successfully! You're now part of the VISION academic community. Here's what you can do:
          </p>
          
          <!-- Features list -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="40" style="vertical-align: top;">
                      <span style="color: ${brandColors.primary}; font-size: 20px;">📚</span>
                    </td>
                    <td>
                      <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 600; color: ${brandColors.dark};">Explore Roadmaps</p>
                      <p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6B7280;">Personalized learning paths for your academic journey</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="40" style="vertical-align: top;">
                      <span style="color: ${brandColors.primary}; font-size: 20px;">💬</span>
                    </td>
                    <td>
                      <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 600; color: ${brandColors.dark};">Join Discussions</p>
                      <p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6B7280;">Connect with peers and share knowledge</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="40" style="vertical-align: top;">
                      <span style="color: ${brandColors.primary}; font-size: 20px;">🎯</span>
                    </td>
                    <td>
                      <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 600; color: ${brandColors.dark};">Get Recommendations</p>
                      <p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #6B7280;">AI-powered suggestions tailored to your goals</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <!-- CTA Button -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <a href="${loginLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; color: ${brandColors.white}; background: linear-gradient(135deg, ${brandColors.success} 0%, #059669 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">
                  Start Exploring
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(
    content,
    "Welcome to VISION! Your email has been verified.",
  );
};

/**
 * New Login Alert Template
 */
const newLoginAlertTemplate = ({
  userName,
  deviceInfo,
  ipAddress,
  loginTime,
  location,
}) => {
  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <h2 style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: ${brandColors.dark};">
            New Login Detected
          </h2>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            Hi${userName ? ` <strong>${userName}</strong>` : ""},
          </p>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            We noticed a new login to your VISION account:
          </p>
          
          <!-- Login details -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${brandColors.light}; border-radius: 8px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">Device</p>
                      <p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 500; color: ${brandColors.dark};">${deviceInfo || "Unknown Device"}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">IP Address</p>
                      <p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 500; color: ${brandColors.dark};">${ipAddress || "Unknown"}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">Time</p>
                      <p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 500; color: ${brandColors.dark};">${loginTime || new Date().toISOString()}</p>
                    </td>
                  </tr>
                  ${
                    location
                      ? `
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #E5E7EB;">
                      <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #6B7280;">Location</p>
                      <p style="margin: 4px 0 0 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; font-weight: 500; color: ${brandColors.dark};">${location}</p>
                    </td>
                  </tr>
                  `
                      : ""
                  }
                </table>
              </td>
            </tr>
          </table>
          
          <!-- Warning box -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF3C7; border-radius: 8px; border-left: 4px solid ${brandColors.warning};">
            <tr>
              <td style="padding: 16px;">
                <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 20px; color: #92400E;">
                  <strong>Wasn't you?</strong> If you didn't log in, please reset your password immediately and contact support.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(content, "New login detected on your VISION account");
};

/**
 * Session Expired / Security Alert Template
 */
const securityAlertTemplate = ({
  userName,
  alertType,
  message,
  actionLink,
  actionText,
}) => {
  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <!-- Alert icon -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <div style="width: 60px; height: 60px; background-color: ${brandColors.warning}; border-radius: 50%; display: inline-block; line-height: 60px; text-align: center;">
                  <span style="color: ${brandColors.white}; font-size: 30px;">⚠</span>
                </div>
              </td>
            </tr>
          </table>
          
          <h2 style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 24px; font-weight: 600; color: ${brandColors.dark}; text-align: center;">
            ${alertType || "Security Alert"}
          </h2>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            Hi${userName ? ` <strong>${userName}</strong>` : ""},
          </p>
          
          <p style="margin: 0 0 20px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; line-height: 24px; color: #4B5563;">
            ${message}
          </p>
          
          ${
            actionLink && actionText
              ? `
          <!-- CTA Button -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <a href="${actionLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 600; color: ${brandColors.white}; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">
                  ${actionText}
                </a>
              </td>
            </tr>
          </table>
          `
              : ""
          }
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(content, alertType || "Security Alert from VISION");
};

module.exports = {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  newLoginAlertTemplate,
  securityAlertTemplate,
  brandColors,
};
