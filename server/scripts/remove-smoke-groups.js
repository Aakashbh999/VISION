const pool = require("../config/db");

async function removeSmokeGroups() {
  const hardDelete = process.argv.includes("--hard");

  const findQuery = `
    SELECT group_id, name, created_by, deleted_at
    FROM portal.study_groups
    WHERE deleted_at IS NULL
      AND (
        name ILIKE '%smoke%'
        OR COALESCE(description, '') ILIKE '%smoke%'
      )
    ORDER BY group_id
  `;

  const found = await pool.query(findQuery);

  if (found.rowCount === 0) {
    console.log("No active smoke groups found.");
    return;
  }

  console.log("Found smoke groups:");
  found.rows.forEach((row) => {
    console.log(`- #${row.group_id} ${row.name}`);
  });

  const ids = found.rows.map((row) => row.group_id);

  if (hardDelete) {
    const del = await pool.query(
      `DELETE FROM portal.study_groups WHERE group_id = ANY($1::int[]) RETURNING group_id, name`,
      [ids],
    );
    console.log(`Hard-deleted ${del.rowCount} group(s):`);
    del.rows.forEach((row) => console.log(`- #${row.group_id} ${row.name}`));
  } else {
    const del = await pool.query(
      `
      UPDATE portal.study_groups
      SET
        deleted_at = NOW(),
        deletion_reason = COALESCE(deletion_reason, 'Removed smoke test group')
      WHERE group_id = ANY($1::int[])
      RETURNING group_id, name, deleted_at
      `,
      [ids],
    );
    console.log(`Soft-deleted ${del.rowCount} group(s):`);
    del.rows.forEach((row) =>
      console.log(`- #${row.group_id} ${row.name} @ ${row.deleted_at}`),
    );
  }
}

removeSmokeGroups()
  .catch((err) => {
    console.error("Failed to remove smoke groups:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.end();
    } catch (_) {
      // no-op
    }
  });
