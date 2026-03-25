require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(async () => {
  const result = await client.query(`
    SELECT enumlabel 
    FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE typname = 'membership_status_type';
  `);
  
  console.log(JSON.stringify(result.rows, null, 2));
  client.end();
}).catch(console.error);
