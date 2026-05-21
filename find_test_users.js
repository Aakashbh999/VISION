const pool = require('./server/config/db');

async function findTestUsers() {
  try {
    const result = await pool.query(`
      SELECT user_id, full_name, email, student_status
      FROM portal.users
      WHERE full_name ILIKE '%test%' OR email ILIKE '%test%'
    `);
    console.log('Test Users found:', result.rowCount);
    console.log(JSON.stringify(result.rows, null, 2));

    if (result.rowCount > 0) {
        const userIds = result.rows.map(r => r.user_id);
        
        // Check discussions
        const discussions = await pool.query(`
            SELECT COUNT(*) FROM portal.discussions WHERE author_id = ANY($1)
        `, [userIds]);
        console.log('Discussions by test users:', discussions.rows[0].count);

        // Check comments
        const comments = await pool.query(`
            SELECT COUNT(*) FROM portal.discussion_comments WHERE author_id = ANY($1)
        `, [userIds]);
        console.log('Comments by test users:', comments.rows[0].count);

        // Check resources (if they created any)
        const resources = await pool.query(`
            SELECT COUNT(*) FROM portal.resources WHERE added_by = ANY($1)
        `, [userIds]);
        console.log('Resources added by test users:', resources.rows[0].count);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findTestUsers();
