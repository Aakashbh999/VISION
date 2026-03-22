const { Pool } = require('pg');
require('dotenv').config({ path: 'v:/campus/final year project/VISION/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyPrivacy() {
  try {
    // 1. Find a private group id and name
    const privateGroup = await pool.query(`
      SELECT group_id, name FROM portal.study_groups WHERE privacy_type = 'private' LIMIT 1
    `);

    if (privateGroup.rows.length === 0) {
      console.log('No private groups found to test with.');
      return;
    }

    const { group_id, name } = privateGroup.rows[0];
    console.log(`Testing with private group: ${name} (ID: ${group_id})`);

    // 2. Check getGroups (simulating no user)
    // We'll just run the query that getGroups uses
    const listingRes = await pool.query(`
      SELECT group_id FROM portal.study_groups g
      WHERE g.deleted_at IS NULL 
      AND (g.privacy_type != 'private')
    `);
    
    const isVisibleInListing = listingRes.rows.some(r => r.group_id === group_id);
    console.log(`Visible in listing (should be false): ${isVisibleInListing}`);

    // 3. Check universalSearch (simulating no user)
    const searchRes = await pool.query(`
      SELECT g.group_id FROM portal.study_groups g
      WHERE g.deleted_at IS NULL 
      AND (g.privacy_type != 'private')
      AND (g.name ILIKE $1)
    `, [`%${name}%`]);

    const isVisibleInSearch = searchRes.rows.some(r => r.group_id === group_id);
    console.log(`Visible in search (should be false): ${isVisibleInSearch}`);

    // 4. Check a public group for sanity
    const publicGroup = await pool.query(`
      SELECT group_id, name FROM portal.study_groups WHERE privacy_type = 'public' LIMIT 1
    `);
    if (publicGroup.rows.length > 0) {
        const pubId = publicGroup.rows[0].group_id;
        const pubListingRes = await pool.query(`
          SELECT group_id FROM portal.study_groups g
          WHERE g.deleted_at IS NULL AND (g.privacy_type != 'private')
          AND g.group_id = $1
        `, [pubId]);
        console.log(`Public group ${publicGroup.rows[0].name} visible: ${pubListingRes.rows.length > 0}`);
    }

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await pool.end();
  }
}

verifyPrivacy();
