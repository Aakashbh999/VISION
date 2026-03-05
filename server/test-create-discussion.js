const discussionService = require("./services/discussionService");
const profanityService = require("./services/profanityService");

async function testCreate() {
  try {
    console.log("Testing profanityService...");
    const cleanTitle = profanityService.cleanText("Test Title");
    console.log("Clean title:", cleanTitle);

    console.log("Testing createDiscussion...");
    const result = await discussionService.createDiscussion({
      userId: 1, // Use a valid user ID from your database
      title: "Test Discussion",
      content: "This is test content",
      specializationId: 1,
      degreeId: 1,
      jobRoleId: null,
      programId: null,
      tags: [3],
      imageUrl: null,
      imagePublicId: null,
    });
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Full error:", err);
  }
  process.exit(0);
}

testCreate();
