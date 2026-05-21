/**
 * clearNonLinkResources.js
 *
 * One-shot admin utility script that permanently deletes ALL resources
 * whose resource_type is NOT 'link' (i.e. 'notes', 'book', 'project').
 *
 * ─── WHAT IT DOES ────────────────────────────────────────────────────────────
 *  1. Fetches every resource where resource_type != 'link' (including soft-deleted ones).
 *  2. Opens a DB transaction and deletes all related child-table rows:
 *       portal.resource_tags
 *       portal.step_resource_map
 *       portal.resource_scores
 *       portal.user_resource_interactions
 *  3. Deletes the resource rows from portal.resources.
 *  4. Commits the transaction.
 *  5. Calls cloudinary.uploader.destroy() for every resource that had a file.
 *
 * ─── SAFETY ──────────────────────────────────────────────────────────────────
 *  • Runs in DRY-RUN mode by default (set DRY_RUN=false to actually delete).
 *  • All DB work is wrapped in a single transaction – if anything fails the
 *    whole operation rolls back so the DB stays consistent.
 *  • Cloudinary deletions happen AFTER the DB transaction commits so a partial
 *    Cloudinary failure does not leave orphaned DB rows.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────
 *  Dry-run (default – shows what would be deleted):
 *    node scripts/clearNonLinkResources.js
 *
 *  Actually delete:
 *    DRY_RUN=false node scripts/clearNonLinkResources.js
 */

require("../config/env"); // loads .env

const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

const DRY_RUN = process.env.DRY_RUN !== "false";

// Resource types that will be KEPT (not deleted)
const PRESERVED_TYPES = ["link"];

async function main() {
  console.log("=============================================================");
  console.log("  VISION Library Clearance – Non-Link Resources");
  console.log("=============================================================");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no changes will be made)" : "⚠️  LIVE – resources WILL be permanently deleted"}`);
  console.log(`Preserving resource types: ${PRESERVED_TYPES.join(", ")}`);
  console.log("=============================================================\n");

  const client = await pool.connect();

  try {
    // ── 1. Discover what we are about to delete ────────────────────────────
    const targetRes = await client.query(
      `SELECT resource_id, title, resource_type, file_public_id, file_url
       FROM portal.resources
       WHERE resource_type NOT IN (${PRESERVED_TYPES.map((_, i) => `$${i + 1}`).join(", ")})
       ORDER BY resource_type, resource_id`,
      PRESERVED_TYPES
    );

    const targets = targetRes.rows;

    if (targets.length === 0) {
      console.log("✅ Nothing to delete – no non-link resources found.");
      return;
    }

    // Summary
    const byType = targets.reduce((acc, r) => {
      acc[r.resource_type] = (acc[r.resource_type] || 0) + 1;
      return acc;
    }, {});

    console.log(`Found ${targets.length} resource(s) to delete:`);
    Object.entries(byType).forEach(([type, count]) =>
      console.log(`  • ${type}: ${count}`)
    );

    const withFiles = targets.filter((r) => r.file_public_id);
    console.log(`  → ${withFiles.length} have Cloudinary file assets to destroy\n`);

    if (DRY_RUN) {
      console.log("─── DRY RUN PREVIEW (first 20) ─────────────────────────────");
      targets.slice(0, 20).forEach((r) =>
        console.log(
          `  [${r.resource_id}] ${r.resource_type.padEnd(8)} "${r.title}" | cloud_id: ${r.file_public_id || "none"}`
        )
      );
      if (targets.length > 20) console.log(`  … and ${targets.length - 20} more`);
      console.log("\n✅ DRY RUN complete. Set DRY_RUN=false to execute.");
      return;
    }

    // ── 2. Database transaction ────────────────────────────────────────────
    console.log("Starting database transaction…");
    await client.query("BEGIN");

    const ids = targets.map((r) => r.resource_id);
    // Use ANY($1::int[]) for bulk operations
    const idArray = `{${ids.join(",")}}`;

    // Delete child-table rows (order matters for FK chains, though all have ON DELETE CASCADE)
    const tagsDel = await client.query(
      "DELETE FROM portal.resource_tags WHERE resource_id = ANY($1::int[])",
      [idArray]
    );
    console.log(`  Deleted ${tagsDel.rowCount} rows from resource_tags`);

    const mapDel = await client.query(
      "DELETE FROM portal.step_resource_map WHERE resource_id = ANY($1::int[])",
      [idArray]
    );
    console.log(`  Deleted ${mapDel.rowCount} rows from step_resource_map`);

    const scoresDel = await client.query(
      "DELETE FROM portal.resource_scores WHERE resource_id = ANY($1::int[])",
      [idArray]
    );
    console.log(`  Deleted ${scoresDel.rowCount} rows from resource_scores`);

    const interDel = await client.query(
      "DELETE FROM portal.user_resource_interactions WHERE resource_id = ANY($1::int[])",
      [idArray]
    );
    console.log(`  Deleted ${interDel.rowCount} rows from user_resource_interactions`);

    // Delete the resources themselves
    const resDel = await client.query(
      "DELETE FROM portal.resources WHERE resource_id = ANY($1::int[])",
      [idArray]
    );
    console.log(`  Deleted ${resDel.rowCount} rows from resources`);

    await client.query("COMMIT");
    console.log("\n✅ Database transaction committed successfully.\n");

    // ── 3. Cloudinary cleanup (best-effort, outside the transaction) ────────
    if (withFiles.length > 0) {
      console.log(`Destroying ${withFiles.length} Cloudinary asset(s)…`);
      let destroyed = 0;
      let failed = 0;

      for (const r of withFiles) {
        try {
          const result = await cloudinary.uploader.destroy(r.file_public_id);
          if (result.result === "ok" || result.result === "not found") {
            destroyed++;
          } else {
            console.warn(`  ⚠ Unexpected Cloudinary result for "${r.file_public_id}":`, result.result);
            failed++;
          }
        } catch (err) {
          console.error(`  ✗ Cloudinary error for "${r.file_public_id}": ${err.message}`);
          failed++;
        }
      }

      console.log(`  Destroyed: ${destroyed} | Failed: ${failed}`);
    }

    console.log("\n🎉 Library clearance complete!");
    console.log(`   Removed ${targets.length} resource(s) (${Object.entries(byType).map(([t, c]) => `${c} ${t}`).join(", ")})`);
    console.log("   External links/videos category is untouched.");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("\n❌ ERROR – transaction rolled back:", err.message);
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
