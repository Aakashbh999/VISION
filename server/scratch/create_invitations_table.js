const pool = require("../config/db");

const sql = `
CREATE TABLE IF NOT EXISTS portal.group_invitations (
    invitation_id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES portal.study_groups(group_id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES portal.users(user_id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES portal.users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    CONSTRAINT status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'))
);

-- Ensure we have indices for fast lookups
CREATE INDEX IF NOT EXISTS idx_group_invitations_receiver ON portal.group_invitations(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group ON portal.group_invitations(group_id);
`;

async function setup() {
  try {
    console.log("Creating portal.group_invitations table...");
    await pool.query(sql);
    console.log("Table created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit();
  }
}

setup();
