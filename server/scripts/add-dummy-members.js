const pool = require("../config/db");

async function addDummyMembers() {
  const groupName = process.argv[2] || "the_developers";
  const count = Number(process.argv[3] || 10);

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("Count must be a positive integer.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const groupResult = await client.query(
      `
      SELECT group_id, name
      FROM portal.study_groups
      WHERE LOWER(name) = LOWER($1)
        AND deleted_at IS NULL
      ORDER BY group_id DESC
      LIMIT 1
      `,
      [groupName],
    );

    if (groupResult.rowCount === 0) {
      throw new Error(`Group '${groupName}' not found.`);
    }

    const { group_id: groupId, name: foundGroupName } = groupResult.rows[0];
    const stamp = Date.now();

    let insertedMembers = 0;

    for (let i = 1; i <= count; i += 1) {
      const email = `dummy.${stamp}.${i}@vision.local`;
      const fullName = `Dummy Member ${i}`;

      const authResult = await client.query(
        `
        INSERT INTO auth.users (email, password_hash, email_status, role)
        VALUES ($1, $2, 'verified', 'student')
        RETURNING auth_user_id
        `,
        [email, "dummy_hash_not_for_login"],
      );

      const authUserId = authResult.rows[0].auth_user_id;

      const portalResult = await client.query(
        `
        INSERT INTO portal.users (auth_user_id, full_name, student_status, is_verified, status, role)
        VALUES ($1, $2, 'approved', true, 'active', 'student')
        RETURNING user_id
        `,
        [authUserId, fullName],
      );

      const userId = portalResult.rows[0].user_id;

      const memberResult = await client.query(
        `
        INSERT INTO portal.group_members (group_id, user_id, role, status)
        VALUES ($1, $2, 'member', 'approved')
        ON CONFLICT (group_id, user_id) DO NOTHING
        RETURNING user_id
        `,
        [groupId, userId],
      );

      if (memberResult.rowCount > 0) {
        insertedMembers += 1;
      }
    }

    const totalMembersResult = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM portal.group_members
      WHERE group_id = $1
      `,
      [groupId],
    );

    await client.query("COMMIT");

    console.log(`Group: ${foundGroupName} (#${groupId})`);
    console.log(`Dummy members requested: ${count}`);
    console.log(`Dummy members inserted: ${insertedMembers}`);
    console.log(`Total members now: ${totalMembersResult.rows[0].total}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

addDummyMembers()
  .catch((error) => {
    console.error("Failed to add dummy members:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.end();
    } catch (_) {
      // no-op
    }
  });
