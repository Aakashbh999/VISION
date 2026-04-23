const pool = require('../config/db');
const discussionQueryService = require('../services/discussionQueryService');

async function verify() {
  try {
    // 1. Check program name
    const programRes = await pool.query("SELECT program_name FROM portal.programs WHERE program_id = 1");
    console.log('Program 1 Name:', programRes.rows[0].program_name);

    // 2. Check a discussion that was previously "missing"
    // Discussion 36 has program_id=1 and degree_id=null
    const discussionRes = await pool.query("SELECT discussion_id, program_id, degree_id FROM portal.discussions WHERE discussion_id = 36");
    console.log('Discussion 36 state:', JSON.stringify(discussionRes.rows[0]));

    // 3. Test filtering logic (mocking the building of the query)
    const { whereClause, params } = discussionQueryService.buildFilterConditions({ degree: 1 });
    console.log('Where Clause for degree=1:', whereClause);
    console.log('Params:', params);

    // 4. Run the actual query to see if it catches it
    const finalQuery = `SELECT discussion_id FROM portal.discussions d WHERE ${whereClause} AND d.discussion_id = 36`;
    const finalRes = await pool.query(finalQuery, params);
    if (finalRes.rows.length > 0) {
      console.log('VERIFICATION SUCCESS: Filter correctly caught discussion 36!');
    } else {
      console.error('VERIFICATION FAILED: Filter did not catch discussion 36.');
    }

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await pool.end();
  }
}

verify();
