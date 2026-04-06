/**
 * Quick SMTP Connection Tester
 * Run: node test-smtp.js
 * This will tell us exactly what's wrong with Gmail SMTP config
 */

const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("[SMTP TEST] Starting email configuration test...\n");

// Log env vars (without exposing the password)
console.log("[SMTP TEST] Configuration:");
console.log(`  HOST: ${process.env.EMAIL_HOST}`);
console.log(`  PORT: ${process.env.EMAIL_PORT}`);
console.log(`  USER: ${process.env.EMAIL_USER}`);
console.log(
  `  PASS: ${process.env.EMAIL_PASS ? "***" + process.env.EMAIL_PASS.slice(-4) : "MISSING"}`,
);
console.log(`  FROM: ${process.env.EMAIL_FROM}\n`);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

// Step 1: Verify SMTP connection
console.log("[SMTP TEST] Step 1: Verifying SMTP connection...");
transporter.verify((err, success) => {
  if (err) {
    console.error("[SMTP TEST] ✗ SMTP VERIFICATION FAILED");
    console.error(`[SMTP TEST] Error Code: ${err.code}`);
    console.error(`[SMTP TEST] Error Message: ${err.message}`);
    console.error(`[SMTP TEST] Full Error:`, err);
    console.error("\n[SMTP TEST] Possible fixes:");
    console.error("  - Check EMAIL_USER and EMAIL_PASS are correct");
    console.error("  - Gmail requires App Password (not account password)");
    console.error("  - Gmail 2FA must be ENABLED to use App Passwords");
    console.error(
      "  - Check that EMAIL_HOST=smtp.gmail.com and EMAIL_PORT=587",
    );
    process.exit(1);
  }

  console.log("[SMTP TEST] ✓ SMTP connection verified!\n");

  // Step 2: Send test email
  console.log("[SMTP TEST] Step 2: Sending test email...");

  const testEmail = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: "VISION SMTP Test",
    html: `
      <h2>SMTP Test Successful!</h2>
      <p>If you received this email, Gmail SMTP is correctly configured.</p>
      <p>Your server should now be able to send verification emails.</p>
    `,
  };

  transporter.sendMail(testEmail, (err, info) => {
    if (err) {
      console.error("[SMTP TEST] ✗ EMAIL SEND FAILED");
      console.error(`[SMTP TEST] Error Code: ${err.code}`);
      console.error(`[SMTP TEST] Error Message: ${err.message}`);
      console.error(`[SMTP TEST] Full Error:`, err);
      process.exit(1);
    }

    console.log("[SMTP TEST] ✓ Test email sent successfully!");
    console.log(`[SMTP TEST] Message ID: ${info.messageId}`);
    console.log("[SMTP TEST] Check your email inbox (or spam folder)");
    console.log(
      "\n[SMTP TEST] ✓ All tests passed! SMTP is working correctly.\n",
    );
    process.exit(0);
  });
});
