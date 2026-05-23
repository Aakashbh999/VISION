/**
 * Tag Utilities
 * Shared helpers for managing resource tags (system and custom).
 *
 * Used by resourceController for both user uploads and admin CRUD operations.
 */

/**
 * Fetches an existing custom tag by slug or name, or creates a new one.
 * Slugifies the name before lookup to prevent near-duplicate tags.
 *
 * @param {import('pg').PoolClient} db - Active DB client (within a transaction)
 * @param {string} name - Raw tag name supplied by the user
 * @returns {Promise<number|null>} - The tag_id, or null if the name is unusable
 */
async function getOrCreateCustomTag(db, name) {
  const clean = String(name).trim().slice(0, 50);
  if (!clean) return null;

  const slug = clean
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (!slug) return null;

  const existing = await db.query(
    `SELECT tag_id FROM portal.tags WHERE slug = $1 OR LOWER(name) = LOWER($2) LIMIT 1`,
    [slug, clean],
  );
  if (existing.rows.length > 0) return existing.rows[0].tag_id;

  const result = await db.query(
    `INSERT INTO portal.tags (name, slug, tag_type) VALUES ($1, $2, 'custom')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING tag_id`,
    [clean, slug],
  );
  return result.rows[0].tag_id;
}

/**
 * Parses a raw JSON-array string of system tag IDs from a form submission.
 *
 * @param {string|undefined} raw - JSON string of tag IDs (e.g. "[1, 2, 3]")
 * @returns {number[]} - Validated array of positive integer tag IDs
 */
function parseSystemTagIds(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed)
      ? parsed.map(Number).filter((n) => Number.isInteger(n) && n > 0)
      : [];
  } catch (_) {
    return [];
  }
}

/**
 * Parses a raw JSON-array string of custom tag names from a form submission.
 *
 * @param {string|undefined} raw - JSON string of tag names (e.g. '["react", "node"]')
 * @returns {string[]} - Trimmed, non-empty tag name strings
 */
function parseCustomTagNames(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed)
      ? parsed
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  } catch (_) {
    return [];
  }
}

/**
 * Inserts validated system tag associations for a resource inside an active transaction.
 *
 * @param {import('pg').PoolClient} client - Active transactional DB client
 * @param {number} resourceId
 * @param {number[]} systemTagIds - Candidate tag IDs (will be validated against DB)
 * @returns {Promise<void>}
 */
async function insertSystemTags(client, resourceId, systemTagIds) {
  if (systemTagIds.length === 0) return;

  const validCheck = await client.query(
    `SELECT tag_id FROM portal.tags WHERE tag_id = ANY($1) AND tag_type = 'system'`,
    [systemTagIds],
  );
  const validIds = validCheck.rows.map((r) => r.tag_id);
  if (validIds.length === 0) return;

  const tagValues = validIds.map((_, i) => `($1, $${i + 2})`).join(", ");
  await client.query(
    `INSERT INTO portal.resource_tags (resource_id, tag_id) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
    [resourceId, ...validIds],
  );
}

/**
 * Inserts (or finds) custom tag associations for a resource inside an active transaction.
 *
 * @param {import('pg').PoolClient} client - Active transactional DB client
 * @param {number} resourceId
 * @param {string[]} customTagNames - Raw custom tag names
 * @returns {Promise<void>}
 */
async function insertCustomTags(client, resourceId, customTagNames) {
  for (const name of customTagNames) {
    const tagId = await getOrCreateCustomTag(client, name);
    if (tagId) {
      await client.query(
        `INSERT INTO portal.resource_tags (resource_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [resourceId, tagId],
      );
    }
  }
}

module.exports = {
  getOrCreateCustomTag,
  parseSystemTagIds,
  parseCustomTagNames,
  insertSystemTags,
  insertCustomTags,
};
