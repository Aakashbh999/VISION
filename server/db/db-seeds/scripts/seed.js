const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const pool = require("../../pool");

async function ensureTablesExist() {
  console.log("🏗️ Building tables in the cloud...");
  const queries = [

    `CREATE TABLE IF NOT EXISTS portal.it_fields (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    field_name TEXT,
    short_description TEXT,
    description_full TEXT,
    tech_stack_hint TEXT,
    demand_level TEXT,
    icon_name TEXT,
    is_public BOOLEAN DEFAULT true
  );`,

    `CREATE TABLE IF NOT EXISTS portal.academic_degrees (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    degree_code TEXT,
    full_name TEXT,
    university TEXT,
    duration TEXT,
    eligibility TEXT,
    focus_area TEXT,
    admission_process TEXT,
    is_public BOOLEAN DEFAULT true
  );`,

    `CREATE TABLE IF NOT EXISTS portal.job_market_insights (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    role_name TEXT,
    salary_range TEXT,
    market_demand TEXT,
    key_skills TEXT,
    job_summary TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT true
  );`,

    `CREATE TABLE IF NOT EXISTS portal.it_clubs (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    club_name TEXT,
    location TEXT,
    institution TEXT,
    specialty TEXT,
    is_public BOOLEAN DEFAULT true,
    contact_info TEXT
  );`,

    `CREATE TABLE IF NOT EXISTS portal.it_club_members (
    club_id INTEGER NOT NULL REFERENCES portal.it_clubs(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (club_id, user_id)
  );`,
  ];
  for (let q of queries) {
    await pool.query(q);
  }
}

async function seedTable(fileName, tableName) {
  const results = [];
  const filePath = path.join(__dirname, "../data", fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${tableName}: File not found.`);
    return;
  }
  console.log(`🚿 Cleaning old data from ${tableName}...`);
  await pool.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (const row of results) {
            const columns = Object.keys(row).join(", ");
            const values = Object.values(row);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

            const query = `
              INSERT INTO ${tableName} (${columns})
              VALUES (${placeholders})
              ON CONFLICT (slug) DO UPDATE SET
              ${Object.keys(row)
                .map((col) => `${col} = EXCLUDED.${col}`)
                .join(", ")};
            `;
            await pool.query(query, values);
          }
          console.log(`✅ ${tableName} synced (${results.length} rows).`);
          resolve();
        } catch (err) {
          console.error(`❌ Error seeding ${tableName}:`, err.message);
          reject(err);
        }
      });
  });
}

async function run() {
  console.log("🚀 Starting Cloud Data Sync...");
  try {

    await ensureTablesExist();

    await seedTable("it_fields.csv", "portal.it_fields");
    await seedTable("academic_degrees.csv", "portal.academic_degrees");
    await seedTable("job_market_insights.csv", "portal.job_market_insights");
    await seedTable("it_clubs.csv", "portal.it_clubs");

    console.log("⭐ Neon Cloud is now perfectly in sync!");
  } catch (error) {
    console.error("💀 Seed failed:", error.message);
  } finally {
    process.exit();
  }
}

run();
