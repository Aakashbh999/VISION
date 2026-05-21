require('dotenv').config({ path: '../.env' });
const pool = require('../config/db');

async function checkLinks() {
  try {
    console.log("Checking for unmapped link resources...");
    
    // Find links not mapped to any step
    const unmapped = await pool.query(`
      SELECT r.resource_id, r.title, r.resource_type, r.file_url 
      FROM portal.resources r 
      LEFT JOIN portal.step_resource_map srm ON r.resource_id = srm.resource_id 
      WHERE r.resource_type = 'link' 
      AND srm.step_id IS NULL;
    `);
    
    console.log(`Found ${unmapped.rows.length} unmapped links:`);
    console.table(unmapped.rows);

    // Find all roadmap steps
    const steps = await pool.query(`
      SELECT rm.roadmap_id, rm.title as roadmap_title, rs.step_id, rs.title as step_title
      FROM portal.roadmaps rm
      JOIN portal.roadmap_steps rs ON rm.roadmap_id = rs.roadmap_id
      ORDER BY rm.roadmap_id, rs.step_order;
    `);
    console.log(`\nFound ${steps.rows.length} roadmap steps:`);
    console.table(steps.rows);


  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

checkLinks();
