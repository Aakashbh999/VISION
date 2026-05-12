const pool = require('../config/db');

async function main() {
  try {
    console.log('=== LINK RESOURCES CHECK ===\n');

    // Check 1: Total link resources in DB
    const linkRes = await pool.query(
      `SELECT COUNT(*) as total FROM portal.resources WHERE resource_type = 'link'`
    );
    console.log('1. Total link resources in DB:', linkRes.rows[0].total);

    // Check 2: Link resources mapped to roadmap steps
    const mappedLinks = await pool.query(
      `SELECT COUNT(*) as total FROM portal.step_resource_map srm
       JOIN portal.resources r ON srm.resource_id = r.resource_id
       WHERE r.resource_type = 'link'`
    );
    console.log('2. Link resources mapped to roadmap steps:', mappedLinks.rows[0].total);

    // Check 3: Sample of link resources with their details
    const samples = await pool.query(
      `SELECT r.resource_id, r.title, r.url, r.status, r.created_at, r.created_by,
              (SELECT COUNT(*) FROM portal.step_resource_map WHERE resource_id = r.resource_id) as step_count
       FROM portal.resources r
       WHERE r.resource_type = 'link'
       LIMIT 10`
    );
    console.log('\n3. Sample link resources:');
    console.log(samples.rows.length === 0 ? 'NONE' : samples.rows);

    // Check 4: Deleted link resources
    const deletedLinks = await pool.query(
      `SELECT COUNT(*) as total FROM portal.resources WHERE resource_type = 'link' AND deleted_at IS NOT NULL`
    );
    console.log('\n4. Deleted link resources:', deletedLinks.rows[0].total);

    // Check 5: Resource type distribution
    const distribution = await pool.query(
      `SELECT resource_type, COUNT(*) as count FROM portal.resources WHERE deleted_at IS NULL GROUP BY resource_type`
    );
    console.log('\n5. Active resources by type:');
    console.log(distribution.rows);

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

main();
