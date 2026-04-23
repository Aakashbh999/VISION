const pool = require("./config/db");

async function findDuplicates() {
  const query = `
    SELECT tu_registration_no, COUNT(*) 
    FROM portal.users 
    WHERE tu_registration_no IS NOT NULL
    GROUP BY tu_registration_no 
    HAVING COUNT(*) > 1
  `;

  try {
    const result = await pool.query(query);
    console.log("Duplicate Registration Numbers and their counts:");
    console.table(result.rows);
    
    if (result.rows.length > 0) {
        console.log("\nDetails of users with duplicates:");
        for (const row of result.rows) {
            const detailRes = await pool.query(
                "SELECT user_id, full_name, tu_registration_no FROM portal.users WHERE tu_registration_no = $1",
                [row.tu_registration_no]
            );
            console.table(detailRes.rows);
        }
    } else {
        console.log("No duplicates found. Check if the error message had more detail (like a specific value).");
        // Check if there are some specific values like empty strings or 'None' that are considered duplicates
    }

  } catch (err) {
    console.error("Error finding duplicates:", err.message);
  } finally {
    process.exit();
  }
}

findDuplicates();
