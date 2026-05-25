const pool = require('./server/config/db');

async function debugDates() {
  try {
    const res = await pool.query(
      `SELECT DISTINCT DATE(created_at) AS activity_date
       FROM portal.xp_activity_log
       WHERE user_id = 44
         AND reason != '7_day_streak_bonus'
         AND created_at >= NOW() - INTERVAL '60 days'
       ORDER BY activity_date DESC`
    );
    console.log("DB rows:", res.rows);
    
    const dates = res.rows.map((r) => {
        const d = new Date(r.activity_date);
        console.log(`Parsed ${r.activity_date} -> ${d.toISOString()}`);
        return d;
    });

    let streak = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    console.log("Today UTC Midnight:", today.toISOString());

    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setUTCDate(today.getUTCDate() - i);
      const actual = new Date(dates[i]);
      actual.setUTCHours(0, 0, 0, 0);

      console.log(`i=${i}, expected: ${expected.toISOString()}, actual: ${actual.toISOString()}`);
      if (actual.getTime() === expected.getTime()) {
        streak++;
        console.log("Match!");
      } else {
        console.log("Mismatch!");
        break;
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
debugDates();
