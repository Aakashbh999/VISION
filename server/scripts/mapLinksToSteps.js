require('dotenv').config({ path: '../.env' });
const pool = require('../config/db');

async function mapLinks() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log("Starting link mapping process...");

    // 1. Delete duplicate unmapped links (keep only the lowest resource_id for each title)
    console.log("Cleaning up duplicate unmapped links...");
    const duplicatesResult = await client.query(`
      WITH duplicates AS (
        SELECT r.resource_id,
               ROW_NUMBER() OVER (PARTITION BY r.title ORDER BY r.resource_id ASC) as rn
        FROM portal.resources r
        LEFT JOIN portal.step_resource_map srm ON r.resource_id = srm.resource_id
        WHERE r.resource_type = 'link' AND srm.step_id IS NULL
      )
      DELETE FROM portal.resources
      WHERE resource_id IN (SELECT resource_id FROM duplicates WHERE rn > 1)
      RETURNING resource_id;
    `);
    console.log(`Deleted ${duplicatesResult.rowCount} duplicate links.`);

    // 2. Fetch the remaining unique unmapped links
    const unmapped = await client.query(`
      SELECT r.resource_id, r.title 
      FROM portal.resources r 
      LEFT JOIN portal.step_resource_map srm ON r.resource_id = srm.resource_id 
      WHERE r.resource_type = 'link' 
      AND srm.step_id IS NULL;
    `);

    // 3. Define the mapping logic
    // Maps title keywords to step_id
    const mappingRules = {
      'Flexbox': 2,        // CSS & Responsive Design
      'ML Basics': 19,     // Machine Learning with Scikit-Learn
      'Encryption': 22,    // Authentication & API Security
      'System Design': 13, // Distributed Databases & Scaling
      'DevOps': 20         // Node.js & Express.js Fundamentals
    };

    let mappedCount = 0;
    
    // 4. Map them
    for (const link of unmapped.rows) {
      let targetStepId = null;
      
      for (const [keyword, stepId] of Object.entries(mappingRules)) {
        if (link.title.includes(keyword)) {
          targetStepId = stepId;
          break;
        }
      }

      if (targetStepId) {
        await client.query(
          `INSERT INTO portal.step_resource_map (step_id, resource_id, is_required) VALUES ($1, $2, true)`,
          [targetStepId, link.resource_id]
        );
        console.log(`Mapped '${link.title}' (ID: ${link.resource_id}) -> Step ${targetStepId}`);
        mappedCount++;
      } else {
        console.log(`WARNING: Could not find mapping rule for '${link.title}'`);
      }
    }

    console.log(`Successfully mapped ${mappedCount} links.`);
    
    await client.query('COMMIT');
    console.log("Transaction committed successfully.");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error occurred, transaction rolled back:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

mapLinks();
