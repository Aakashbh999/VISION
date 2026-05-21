const pool = require('../config/db');

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || 'admin';

  if (!email) {
    console.error('Usage: node setAdminRole.js <email> [role]');
    process.exit(2);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const res = await client.query(
      `UPDATE auth.users SET role = $1 WHERE LOWER(email) = LOWER($2) RETURNING auth_user_id, email, role`,
      [role, email]
    );

    if (res.rowCount === 0) {
      console.log('NOT_FOUND');
      await client.query('ROLLBACK');
      process.exit(0);
    }

    console.log('UPDATED:', res.rows[0]);
    await client.query('COMMIT');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR:', err.message || err);
    process.exit(1);
  } finally {
    client.release();
  }
}

main();
