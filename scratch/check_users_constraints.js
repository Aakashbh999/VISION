const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vision'
});

async function checkConstraints() {
  try {
    console.log("Checking unique constraints for portal.users...");
    const res = await pool.query(`
      SELECT conname, contype, a.attname
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.conrelid = '"portal"."users"'::regclass;
    `);
    console.log("Constraints on portal.users:", res.rows);

    console.log("\nChecking unique constraints for auth.users...");
    const resAuth = await pool.query(`
      SELECT conname, contype, a.attname
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.conrelid = '"auth"."users"'::regclass;
    `);
    console.log("Constraints on auth.users:", resAuth.rows);

    console.log("\nChecking for duplicates in portal.users (tu_registration_no)...");
    const dups = await pool.query(`
      SELECT tu_registration_no, COUNT(*)
      FROM portal.users
      WHERE tu_registration_no IS NOT NULL
      GROUP BY tu_registration_no
      HAVING COUNT(*) > 1;
    `);
    console.log("Duplicates in portal.users:", dups.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkConstraints();
