require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(async () => {
  const result = await client.query(`
    SELECT
      tc.table_name, 
      kcu.column_name
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'portal'
      AND tc.table_name IN ('study_groups', 'discussions', 'resources', 'roadmaps');
  `);
  
  console.log(JSON.stringify(result.rows, null, 2));
  client.end();
}).catch(console.error);
