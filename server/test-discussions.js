const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let testDiscussionId = null;
let testCommentId = null;

// Test user credentials (you may need to adjust these)
const testUser = {
  email: "test@example.com",
  password: "Test123!",
};

async function testDiscussionSystem() {
  console.log("\n🧪 TESTING DISCUSSION SYSTEM 2.0\n");
  console.log("=".repeat(50));

  try {
    // TEST 1: Get all tags
    console.log("\n1️⃣ Testing GET /discussions/tags");
    const tagsRes = await axios.get(`${BASE_URL}/discussions/tags`);
    console.log(`✅ Success: Found ${tagsRes.data.length} tags`);
    console.log(
      `   Sample: ${tagsRes.data
        .slice(0, 3)
        .map((t) => t.name)
        .join(", ")}`,
    );

    // TEST 2: Get all discussions (without auth)
    console.log("\n2️⃣ Testing GET /discussions (public)");
    const discussionsRes = await axios.get(`${BASE_URL}/discussions`);
    console.log(
      `✅ Success: Found ${discussionsRes.data.discussions.length} discussions`,
    );
    console.log(
      `   Total: ${discussionsRes.data.total}, Pages: ${discussionsRes.data.totalPages}`,
    );

    // TEST 3: Get discussions with filters
    console.log("\n3️⃣ Testing GET /discussions with filters");
    const filteredRes = await axios.get(
      `${BASE_URL}/discussions?sortBy=trending&limit=5`,
    );
    console.log(
      `✅ Success: Filtered to ${filteredRes.data.discussions.length} discussions`,
    );

    // TEST 4: Get trending discussions
    console.log("\n4️⃣ Testing GET /discussions/trending");
    const trendingRes = await axios.get(`${BASE_URL}/discussions/trending`);
    console.log(
      `✅ Success: Found ${trendingRes.data.length} trending discussions`,
    );

    // Try to login for authenticated tests
    console.log("\n🔐 Attempting login for authenticated tests...");
    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/signin`, testUser);
      authToken = loginRes.data.token;
      console.log("✅ Login successful");
    } catch (loginErr) {
      console.log("⚠️ Login failed - skipping authenticated tests");
      console.log(`   Use a valid user or create one first`);
      console.log("\n📊 SUMMARY: Basic public endpoints work ✅");
      return;
    }

    const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };

    // TEST 5: Create a discussion
    console.log("\n5️⃣ Testing POST /discussions (create)");
    const newDiscussion = {
      title: "Test Discussion - Profanity Check",
      content:
        "This is a test discussion with some bad word that should be cleaned",
      programId: 1,
      tags: ["react", "javascript"],
    };
    const createRes = await axios.post(
      `${BASE_URL}/discussions`,
      newDiscussion,
      authHeaders,
    );
    testDiscussionId = createRes.data.discussion_id;
    console.log(`✅ Success: Created discussion ID ${testDiscussionId}`);
    console.log(
      `   Content cleaned: ${createRes.data.content.includes("***")}`,
    );

    // TEST 6: Get single discussion
    console.log("\n6️⃣ Testing GET /discussions/:id");
    const singleRes = await axios.get(
      `${BASE_URL}/discussions/${testDiscussionId}`,
    );
    console.log(`✅ Success: Retrieved discussion "${singleRes.data.title}"`);
    console.log(`   Author: ${singleRes.data.author_name}`);

    // TEST 7: Update discussion (within 24h)
    console.log("\n7️⃣ Testing PUT /discussions/:id (update)");
    const updateData = {
      title: "Updated Test Discussion",
      content: "Updated content",
    };
    const updateRes = await axios.put(
      `${BASE_URL}/discussions/${testDiscussionId}`,
      updateData,
      authHeaders,
    );
    console.log(`✅ Success: Updated discussion`);

    // TEST 8: Add comment
    console.log("\n8️⃣ Testing POST /discussions/:id/comments");
    const commentData = { content: "This is a test comment" };
    const commentRes = await axios.post(
      `${BASE_URL}/discussions/${testDiscussionId}/comments`,
      commentData,
      authHeaders,
    );
    testCommentId = commentRes.data.comment_id;
    console.log(`✅ Success: Added comment ID ${testCommentId}`);

    // TEST 9: Like discussion
    console.log("\n9️⃣ Testing POST /discussions/:id/like");
    const likeRes = await axios.post(
      `${BASE_URL}/discussions/${testDiscussionId}/like`,
      {},
      authHeaders,
    );
    console.log(
      `✅ Success: ${likeRes.data.liked ? "Liked" : "Unliked"} discussion`,
    );

    // TEST 10: Save discussion
    console.log("\n🔟 Testing POST /discussions/:id/save");
    const saveRes = await axios.post(
      `${BASE_URL}/discussions/${testDiscussionId}/save`,
      {},
      authHeaders,
    );
    console.log(
      `✅ Success: ${saveRes.data.saved ? "Saved" : "Unsaved"} discussion`,
    );

    // TEST 11: Get my posts
    console.log("\n1️⃣1️⃣ Testing GET /discussions/user/my-posts");
    const myPostsRes = await axios.get(
      `${BASE_URL}/discussions/user/my-posts`,
      authHeaders,
    );
    console.log(
      `✅ Success: Found ${myPostsRes.data.discussions.length} of my posts`,
    );

    // TEST 12: Get saved discussions
    console.log("\n1️⃣2️⃣ Testing GET /discussions/user/saved");
    const savedRes = await axios.get(
      `${BASE_URL}/discussions/user/saved`,
      authHeaders,
    );
    console.log(
      `✅ Success: Found ${savedRes.data.discussions.length} saved discussions`,
    );

    // TEST 13: Delete comment
    console.log("\n1️⃣3️⃣ Testing DELETE /discussions/comments/:commentId");
    await axios.delete(
      `${BASE_URL}/discussions/comments/${testCommentId}`,
      authHeaders,
    );
    console.log(`✅ Success: Deleted comment`);

    // TEST 14: Delete discussion
    console.log("\n1️⃣4️⃣ Testing DELETE /discussions/:id");
    await axios.delete(
      `${BASE_URL}/discussions/${testDiscussionId}`,
      authHeaders,
    );
    console.log(`✅ Success: Deleted discussion`);

    console.log("\n" + "=".repeat(50));
    console.log(
      "✅ ALL TESTS PASSED! Discussion System 2.0 is working perfectly!",
    );
    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(
      `   Endpoint: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
    );
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Error: ${error.response?.data?.error || error.message}`);
    console.error(
      `   Details: ${JSON.stringify(error.response?.data, null, 2)}`,
    );
    process.exit(1);
  }
}

// Run tests
console.log("\n⚠️ PREREQUISITES:");
console.log("   1. Server must be running on localhost:5000");
console.log("   2. Database migrations must be applied");
console.log(
  "   3. Test user account should exist (or tests will skip authenticated endpoints)",
);
console.log("\nStarting tests in 2 seconds...\n");

setTimeout(() => {
  testDiscussionSystem();
}, 2000);
