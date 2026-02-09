const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const pool = require("../../pool"); // Import the shared connection

async function ensureTablesExist() {
  console.log("🏗️ Building tables in the cloud...");
  const queries = [
    // 1. IT FIELDS
    `CREATE TABLE IF NOT EXISTS it_fields (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    field_name TEXT,
    short_description TEXT,
    description_full TEXT,
    tech_stack_hint TEXT,
    demand_level TEXT,
    icon_name TEXT
  );`,

    // 2. ACADEMIC DEGREES
    `CREATE TABLE IF NOT EXISTS academic_degrees (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    degree_code TEXT,
    full_name TEXT,
    university TEXT,
    duration TEXT,
    eligibility TEXT,
    focus_area TEXT,
    admission_process TEXT
  );`,

    // 3. JOB MARKET INSIGHTS
    `CREATE TABLE IF NOT EXISTS job_market_insights (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    role_name TEXT,
    salary_range TEXT,
    market_demand TEXT,
    key_skills TEXT,
    job_summary TEXT,
    description TEXT
  );`,

    // 4. IT CLUBS
    `CREATE TABLE IF NOT EXISTS it_clubs (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    club_name TEXT,
    location TEXT,
    institution TEXT,
    specialty TEXT,
    is_public TEXT, 
    contact_info TEXT
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
    // THIS IS THE MISSING STEP: Create the "rooms" before moving in the "furniture"
    await ensureTablesExist();

    await seedTable("it_fields.csv", "it_fields");
    await seedTable("academic_degrees.csv", "academic_degrees");
    await seedTable("job_market_insights.csv", "job_market_insights");
    await seedTable("it_clubs.csv", "it_clubs");

    console.log("⭐ Neon Cloud is now perfectly in sync!");
  } catch (error) {
    console.error("💀 Seed failed:", error.message);
  } finally {
    process.exit();
  }
}

run();
