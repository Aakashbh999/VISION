require('dotenv').config();
const pool = require('./config/db');

async function testReject() {
  try {
    const id = 74;
    const reason = "This is a test rejection reason";
    console.log(`Rejecting resource ${id} with reason: ${reason}`);
    
    const res = await pool.query(
      `UPDATE portal.resources
       SET status = 'rejected', rejection_reason = $2
       WHERE resource_id = $1
       RETURNING resource_id, status, rejection_reason`,
      [id, reason]
    );
    
    console.log("Result:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

testReject();
