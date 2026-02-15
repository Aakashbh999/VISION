const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      university,
      campus,
      program_id,
      semester,
      tu_registration_no,
    } = req.body;

    // Check existing email
    const existing = await pool.query(
      "SELECT * FROM auth.users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into auth.users
    const authInsert = await pool.query(
      `INSERT INTO auth.users (email, password_hash)
       VALUES ($1, $2)
       RETURNING auth_user_id, email`,
      [email, hashedPassword],
    );

    const authUser = authInsert.rows[0];

    // Insert into portal.users
    await pool.query(
      `INSERT INTO portal.users 
      (auth_user_id, full_name, university, campus, program_id, semester, tu_registration_no)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        authUser.auth_user_id,
        full_name,
        university,
        campus,
        program_id,
        semester,
        tu_registration_no,
      ],
    );

    // Generate Email Verification Token
    const emailToken = jwt.sign(
      { auth_user_id: authUser.auth_user_id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Save token in DB
    await pool.query(
      `INSERT INTO auth.email_verification_tokens
   (auth_user_id, token, expires_at)
   VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [authUser.auth_user_id, emailToken],
    );

    // For now we log the link (later we send real email)
    console.log("Verify Email URL:");
    console.log(
      `${process.env.BASE_URL}/api/auth/verify-email?token=${emailToken}`,
    );

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM auth.users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { auth_user_id: user.auth_user_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).json({ error: "Token missing" });

    // Check token exists in DB
    const tokenCheck = await pool.query(
      `SELECT * FROM auth.email_verification_tokens
       WHERE token = $1`,
      [token],
    );

    if (tokenCheck.rows.length === 0)
      return res.status(400).json({ error: "Invalid or expired token" });

    const tokenData = tokenCheck.rows[0];

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: "Token expired" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update email status
    await pool.query(
      `UPDATE auth.users
       SET email_status = 'verified'
       WHERE auth_user_id = $1`,
      [decoded.auth_user_id],
    );

    // Delete token (replay protection)
    await pool.query(
      `DELETE FROM auth.email_verification_tokens
       WHERE token = $1`,
      [token],
    );

    res.json({ message: "Email successfully verified 🎉" });
  } catch (err) {
    res.status(400).json({ error: "Verification failed" });
  }
};
