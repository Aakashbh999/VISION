const pool = require('../config/db');

async function main() {
  try {
    const roadmapId = process.argv[2] || 1;
    const stepId = process.argv[3] || null;

    console.log(`\n=== ROADMAP ${roadmapId} RESOURCES CHECK ===\n`);

    // Get all steps in roadmap
    const stepsRes = await pool.query(
      `SELECT step_id, step_order, title FROM portal.roadmap_steps 
       WHERE roadmap_id = $1 AND deleted_at IS NULL ORDER BY step_order`,
      [roadmapId]
    );

    console.log(`Found ${stepsRes.rows.length} steps:\n`);

    for (const step of stepsRes.rows) {
      // Get mapped resources
      const mappedRes = await pool.query(
        `SELECT r.resource_id, r.title, r.resource_type, sm.is_required
         FROM portal.step_resource_map sm
         JOIN portal.resources r ON sm.resource_id = r.resource_id
         WHERE sm.step_id = $1`,
        [step.step_id]
      );

      console.log(`Step ${step.step_order}: "${step.title}" (step_id: ${step.step_id})`);
      if (mappedRes.rows.length === 0) {
        console.log(`  ❌ NO RESOURCES MAPPED`);
      } else {
        console.log(`  Resources (${mappedRes.rows.length}):`);
        mappedRes.rows.forEach(r => {
          console.log(`    - [${r.resource_type}] ${r.title} (required: ${r.is_required})`);
        });
      }
      console.log('');
    }

    // Check if there are unmapped link resources that COULD be added
    const availableLinks = await pool.query(
      `SELECT COUNT(*) as total FROM portal.resources 
       WHERE resource_type = 'link' AND status = 'approved' AND deleted_at IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM portal.step_resource_map WHERE resource_id = portal.resources.resource_id
       )`
    );
    console.log(`Available link resources (not yet mapped): ${availableLinks.rows[0].total}`);

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

main();
