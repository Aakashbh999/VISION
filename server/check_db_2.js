const pool = require("./config/db");
async function check() {
  try {
    const tables = ['users', 'roadmap_steps', 'roadmaps'];
    for (const table of tables) {
      const schema = table === 'users' ? 'portal' : 'portal'; // wait, users is in portal?
      // actually, users is usually in portal.users or auth.users. 
      // check index.js: app.use("/api/auth", authRoutes);
      // Let's find where users table is.
      const res = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = $1", [table]);
      console.log(`${table} location:`, res.rows);
      
      const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", [table]);
      console.log(`${table} columns:`, cols.rows.map(r => r.column_name));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
