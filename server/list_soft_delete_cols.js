require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(async () => {
  const result = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'portal' 
      AND column_name IN ('deleted_at', 'is_deleted', 'is_active', 'status')
    ORDER BY table_name, column_name;
  `);
  
  const tables = {};
  for (const row of result.rows) {
    if (!tables[row.table_name]) tables[row.table_name] = [];
    tables[row.table_name].push(row.column_name);
  }
  console.log(JSON.stringify(tables, null, 2));
  client.end();
}).catch(console.error);
