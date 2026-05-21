const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_yfV6HDsqC5Wh@ep-billowing-recipe-a1rlsjts-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected!');

    await client.query("SET search_path TO portal, auth, public;");
    const res = await client.query("SELECT user_id, full_name, email, created_at FROM portal.users WHERE full_name ILIKE '%test%' OR email ILIKE '%test%' LIMIT 100;");
    console.log('Found', res.rowCount, 'users');
    console.log(JSON.stringify(res.rows, null, 2));

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
