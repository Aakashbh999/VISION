#!/usr/bin/env node

const bcrypt = require("bcrypt");
const pool = require("../config/db");

const testUsers = [
  // CSIT (1-10)
  { email: "aarav.sharma@example.com", name: "Aarav Sharma", program: 1 },
  { email: "bhavna.patel@example.com", name: "Bhavna Patel", program: 1 },
  { email: "chetan.kumar@example.com", name: "Chetan Kumar", program: 1 },
  { email: "deepika.singh@example.com", name: "Deepika Singh", program: 1 },
  { email: "esha.gupta@example.com", name: "Esha Gupta", program: 1 },
  { email: "farhan.khan@example.com", name: "Farhan Khan", program: 1 },
  {
    email: "geetanjali.verma@example.com",
    name: "Geetanjali Verma",
    program: 1,
  },
  { email: "harsh.mishra@example.com", name: "Harsh Mishra", program: 1 },
  { email: "isha.desai@example.com", name: "Isha Desai", program: 1 },
  { email: "jatin.rao@example.com", name: "Jatin Rao", program: 1 },
  // BIT (11-20)
  { email: "kavya.nair@example.com", name: "Kavya Nair", program: 2 },
  { email: "laksh.bansal@example.com", name: "Laksh Bansal", program: 2 },
  { email: "meera.saxena@example.com", name: "Meera Saxena", program: 2 },
  { email: "nikhil.joshi@example.com", name: "Nikhil Joshi", program: 2 },
  { email: "olivia.mehta@example.com", name: "Olivia Mehta", program: 2 },
  { email: "priya.malhotra@example.com", name: "Priya Malhotra", program: 2 },
  { email: "qadir.hassan@example.com", name: "Qadir Hassan", program: 2 },
  { email: "rahul.chopra@example.com", name: "Rahul Chopra", program: 2 },
  { email: "sneha.pandey@example.com", name: "Sneha Pandey", program: 2 },
  { email: "tanvi.roy@example.com", name: "Tanvi Roy", program: 2 },
  // BCA (21-30)
  { email: "uday.sinha@example.com", name: "Uday Sinha", program: 3 },
  { email: "vanessa.kumar@example.com", name: "Vanessa Kumar", program: 3 },
  { email: "vikram.singh@example.com", name: "Vikram Singh", program: 3 },
  { email: "wazim.ahmed@example.com", name: "Wazim Ahmed", program: 3 },
  { email: "xenophon.adams@example.com", name: "Xenophon Adams", program: 3 },
  { email: "yasmin.fatima@example.com", name: "Yasmin Fatima", program: 3 },
  { email: "zara.patel@example.com", name: "Zara Patel", program: 3 },
  { email: "arjun.das@example.com", name: "Arjun Das", program: 3 },
  { email: "brinda.iyer@example.com", name: "Brinda Iyer", program: 3 },
  { email: "chirag.verma@example.com", name: "Chirag Verma", program: 3 },
];

const testResources = [
  // User 1
  {
    title: "React Fundamentals",
    desc: "Learn React",
    type: "notes",
    program: 1,
    user: 1,
  },
  {
    title: "JavaScript Advanced",
    desc: "JS concepts",
    type: "book",
    program: 1,
    user: 1,
  },
  { title: "ML Basics", desc: "ML intro", type: "link", program: 1, user: 1 },
  {
    title: "Database Design",
    desc: "DB patterns",
    type: "project",
    program: 1,
    user: 1,
  },
  {
    title: "Web Performance",
    desc: "Speed optimization",
    type: "notes",
    program: 1,
    user: 1,
  },
  // Repeat similar pattern for users 2-30 (5 resources each)
];

const testDiscussions = Array.from({ length: 30 }, (_, userIdx) =>
  Array.from({ length: 5 }, (_, discIdx) => ({
    title: `Discussion ${discIdx + 1} by User ${userIdx + 1}`,
    content: `Content for discussion ${discIdx + 1}`,
    specialization: (userIdx % 6) + 1,
    user: userIdx + 1,
  })),
).flat();

async function loadTestData() {
  const client = await pool.connect();
  try {
    console.log("🔄 Loading test data...\n");

    await client.query("BEGIN");

    // Password: TestPassword123!
    const hashedPwd =
      "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUGyemAm";

    // Step 1: Create auth users
    console.log("📝 Creating auth users...");
    const authUsers = {};
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const result = await client.query(
        "INSERT INTO auth.users (email, password_hash) VALUES ($1, $2) RETURNING auth_user_id",
        [user.email, hashedPwd],
      );
      authUsers[user.email] = result.rows[0].auth_user_id;
      process.stdout.write(`\r  ${i + 1}/${testUsers.length} auth users`);
    }
    console.log(" ✅");

    // Step 2: Create portal users
    console.log("📝 Creating portal users...");
    const portalUsers = {};
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const authUserId = authUsers[user.email];
      const result = await client.query(
        `INSERT INTO portal.users (auth_user_id, full_name, program_id, semester, batch_year, student_status, tu_registration_no) 
         VALUES ($1, $2, $3, 4, 2023, 'approved', $4) RETURNING user_id`,
        [
          authUserId,
          user.name,
          user.program,
          `TU-2023-${String(i + 1).padStart(5, "0")}`,
        ],
      );
      portalUsers[user.email] = result.rows[0].user_id;
      process.stdout.write(`\r  ${i + 1}/${testUsers.length} portal users`);
    }
    console.log(" ✅");

    // Step 3: Create resources (5 per user, 150 total)
    console.log("📝 Creating 150 resources...");
    const resourceTitles = [
      "React Fundamentals",
      "JavaScript Advanced",
      "ML Basics",
      "Database Design",
      "Web Performance",
      "Data Science Intro",
      "Cloud Computing",
      "DevOps Essentials",
      "Python Advanced",
      "API Design",
      "Security 101",
      "Networking Basics",
      "Encryption Guide",
      "Mobile Dev",
      "Frontend Design",
      "Backend Architecture",
      "UI/UX Principles",
      "System Design",
      "Performance Tuning",
      "Testing Guide",
    ];

    let resourceCount = 0;
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const userId = portalUsers[user.email];

      for (let r = 0; r < 5; r++) {
        await client.query(
          `INSERT INTO portal.resources (title, description, resource_type, program_id, semester, status, created_by, created_at)
           VALUES ($1, $2, $3, $4, $5, 'approved', $6, NOW())`,
          [
            resourceTitles[(i * 5 + r) % resourceTitles.length],
            "Test resource description for learning",
            ["notes", "book", "link", "project"][r % 4],
            user.program,
            3 + (r % 3),
            userId,
          ],
        );
        resourceCount++;
        process.stdout.write(`\r  ${resourceCount}/150 resources`);
      }
    }
    console.log(" ✅");

    // Step 4: Create discussions (5 per user, 150 total)
    console.log("📝 Creating 150 discussions...");
    const discussionTitles = [
      "React vs Vue",
      "Machine Learning",
      "Cloud Architecture",
      "Security Best Practices",
      "Database Design",
      "API Design",
      "Mobile Dev",
      "UI/UX Trends",
      "DevOps Workflow",
      "Performance",
    ];

    let discussionCount = 0;
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const userId = portalUsers[user.email];

      for (let d = 0; d < 5; d++) {
        await client.query(
          `INSERT INTO portal.discussions (title, content, specialization_id, program_id, user_id, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            discussionTitles[(i * 5 + d) % discussionTitles.length],
            "Discussion content about the topic and related feedback",
            (i % 6) + 1,
            user.program,
            userId,
          ],
        );
        discussionCount++;
        process.stdout.write(`\r  ${discussionCount}/150 discussions`);
      }
    }
    console.log(" ✅");

    // Step 5: Create interactions (10+ per user)
    console.log("📝 Creating interactions...");
    let interactionCount = 0;

    // First, get all resources to map them properly
    const resourcesResult = await client.query(
      "SELECT resource_id, created_by FROM portal.resources ORDER BY resource_id",
    );
    const resourcesByUser = {};
    resourcesResult.rows.forEach((r) => {
      if (!resourcesByUser[r.created_by]) {
        resourcesByUser[r.created_by] = [];
      }
      resourcesByUser[r.created_by].push(r.resource_id);
    });

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const userId = portalUsers[user.email];
      const userResources = resourcesByUser[userId] || [];

      if (userResources.length === 0) continue;

      // Each user interacts with 10-15 resources
      for (
        let in_idx = 0;
        in_idx < Math.min(15, userResources.length + 5);
        in_idx++
      ) {
        const resourceIdx = in_idx % userResources.length;
        const resourceId = userResources[resourceIdx];
        const interactionType = in_idx % 3 === 0 ? "complete" : "view";

        try {
          await client.query(
            `INSERT INTO portal.user_resource_interactions (user_id, resource_id, interaction_type, created_at)
             VALUES ($1, $2, $3, NOW())`,
            [userId, resourceId, interactionType],
          );
          interactionCount++;
        } catch (err) {
          // Skip duplicate or constraint errors
        }
      }
      process.stdout.write(`\r  User ${i + 1}/30 interactions`);
    }
    console.log(` (${interactionCount} total) ✅`);

    await client.query("COMMIT");

    // Verify
    console.log("\n🔍 Verification:\n");
    const authCount = await client.query(
      "SELECT COUNT(*) as cnt FROM auth.users WHERE email LIKE '%example.com'",
    );
    const portalCount = await client.query(
      "SELECT COUNT(*) as cnt FROM portal.users WHERE is_suspended = false",
    );
    const resourceCount_ = await client.query(
      "SELECT COUNT(*) as cnt FROM portal.resources WHERE status = 'approved'",
    );
    const discussionCount_ = await client.query(
      "SELECT COUNT(*) as cnt FROM portal.discussions",
    );
    const interactionCount_ = await client.query(
      "SELECT COUNT(*) as cnt FROM portal.user_resource_interactions",
    );

    console.log(`  ✅ Auth users: ${authCount.rows[0].cnt}`);
    console.log(`  ✅ Portal users: ${portalCount.rows[0].cnt}`);
    console.log(`  ✅ Resources: ${resourceCount_.rows[0].cnt}`);
    console.log(`  ✅ Discussions: ${discussionCount_.rows[0].cnt}`);
    console.log(`  ✅ Interactions: ${interactionCount_.rows[0].cnt}`);

    console.log("\n✅ Test data loaded successfully!\n");
    console.log("🚀 Next: Start the server with: npm run dev\n");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

loadTestData();
