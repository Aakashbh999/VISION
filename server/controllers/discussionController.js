const discussionService = require("../services/discussionService");
const profanityService = require("../services/profanityService");

/* ===============================
    GET ALL DISCUSSIONS (with filters)
  ================================ */
exports.getAllDiscussions = async (req, res) => {
  try {
    const userId = req.user?.portal_user_id || null;
    const filters = {
      specialization: req.query.specialization,
      degree: req.query.degree,
      jobRole: req.query.jobRole,
      program: req.query.program,
      tag: req.query.tag,
      search: req.query.search,
      sort: req.query.sort || "latest",
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await discussionService.getDiscussions(filters, userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch discussions" });
  }
};

/* ===============================
    GET TRENDING DISCUSSIONS
  ================================ */
exports.getTrendingDiscussions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const trending = await discussionService.getTrendingDiscussions(limit);
    res.json(trending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trending discussions" });
  }
};

/* ===============================
    GET USER'S DEFAULT FILTERS
  ================================ */
exports.getUserDefaults = async (req, res) => {
  try {
    const userId = req.user.portal_user_id;
    const defaults = await discussionService.getUserFilterDefaults(userId);
    res.json(defaults || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user defaults" });
  }
};

/* ===============================
    GET ALL TAGS
  ================================ */
exports.getAllTags = async (req, res) => {
  try {
    const tags = await discussionService.getAllTags();
    res.json(tags || []);
  } catch (err) {
    console.error("Error fetching tags:", err.message);
    // Return empty array instead of error - table may not exist yet
    res.json([]);
  }
};

/* ===============================
    GET SPECIALIZATIONS (Static)
  ================================ */
const SPECIALIZATIONS = [
  { id: 1, name: "Web Development", slug: "web-development" },
  { id: 2, name: "Mobile App Development", slug: "mobile-app-development" },
  { id: 3, name: "Software Engineering", slug: "software-engineering" },
  { id: 4, name: "Cyber Security", slug: "cyber-security" },
  { id: 5, name: "Data Science", slug: "data-science" },
  { id: 6, name: "Cloud Computing", slug: "cloud-computing" },
  { id: 7, name: "AI & Machine Learning", slug: "ai-machine-learning" },
  { id: 8, name: "UI/UX Design", slug: "ui-ux-design" },
  { id: 9, name: "DevOps", slug: "devops" },
  { id: 10, name: "Database Management", slug: "database-management" },
  { id: 11, name: "Networking", slug: "networking" },
  { id: 12, name: "Game Development", slug: "game-development" },
];

exports.getSpecializations = (req, res) => {
  try {
    res.json(SPECIALIZATIONS);
  } catch (err) {
    console.error("Error in getSpecializations:", err);
    res.status(500).json({ error: "Failed to fetch specializations" });
  }
};

/* ===============================
    GET DEGREES (Static)
  ================================ */
const DEGREES = [
  { id: 1, code: "BSc.CSIT", name: "Bachelor of Science in CSIT" },
  { id: 2, code: "BCA", name: "Bachelor in Computer Applications" },
  { id: 3, code: "BIT", name: "Bachelor in Information Technology" },
  { id: 4, code: "BE Computer", name: "Bachelor of Engineering in Computer" },
  { id: 5, code: "BE Software", name: "Bachelor of Engineering in Software" },
  { id: 6, code: "BSc AI", name: "Bachelor of Science in AI" },
  {
    id: 7,
    code: "BSc Data Science",
    name: "Bachelor of Science in Data Science",
  },
  { id: 8, code: "BBA IT", name: "Bachelor of Business Administration in IT" },
  { id: 9, code: "BSc Multimedia", name: "Bachelor of Science in Multimedia" },
  { id: 10, code: "MCA", name: "Master of Computer Applications" },
  { id: 11, code: "MSc IT", name: "Master of Science in IT" },
  { id: 12, code: "MIT", name: "Master in Information Technology" },
];

exports.getDegrees = (req, res) => {
  try {
    res.json(DEGREES);
  } catch (err) {
    console.error("Error in getDegrees:", err);
    res.status(500).json({ error: "Failed to fetch degrees" });
  }
};

/* ===============================
    DISCUSSION DETAILS
  ================================ */
exports.getDiscussionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.portal_user_id || null;

    const discussion = await discussionService.getDiscussionById(id, userId);

    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    const comments = await discussionService.getComments(id);

    res.json({
      discussion,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch discussion" });
  }
};

/* ===============================
    CREATE DISCUSSION
  ================================ */
exports.createDiscussion = async (req, res) => {
  try {
    const userId = req.user.portal_user_id;
    let {
      title,
      content,
      specializationId,
      degreeId,
      jobRoleId,
      programId,
      tags,
      imageUrl,
      imagePublicId,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!specializationId) {
      return res.status(400).json({ error: "Specialization is required" });
    }

    // Content is optional - default to empty string
    content = content || "";

    // Clean profanity (auto-clean mode)
    title = profanityService.cleanText(title);
    content = profanityService.cleanText(content);

    // Process tags - convert tag names to IDs if needed
    let tagIds = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Separate numeric IDs from string names
      const numericIds = tags.filter((t) => typeof t === "number");
      const stringNames = tags.filter(
        (t) => typeof t === "string" && isNaN(Number(t)),
      );
      const numericStrings = tags
        .filter((t) => typeof t === "string" && !isNaN(Number(t)))
        .map(Number);

      // Get IDs for string tag names
      let convertedIds = [];
      if (stringNames.length > 0) {
        convertedIds = await discussionService.getOrCreateTags(stringNames);
      }

      tagIds = [...numericIds, ...numericStrings, ...convertedIds];
    }

    const discussion = await discussionService.createDiscussion({
      userId,
      title,
      content,
      specializationId,
      degreeId,
      jobRoleId,
      programId,
      tags: tagIds,
      imageUrl,
      imagePublicId,
    });

    res.status(201).json(discussion);
  } catch (err) {
    console.error("Create discussion error:", err.message);
    console.error("Full error:", err);
    res
      .status(500)
      .json({ error: "Failed to create discussion", details: err.message });
  }
};

/* ===============================
    UPDATE DISCUSSION (24h limit)
  ================================ */
exports.updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const isAdmin = req.user.role === "admin";
    let { title, content, specializationId, degreeId, jobRoleId, tags } =
      req.body;

    // Clean profanity if title/content provided
    if (title) title = profanityService.cleanText(title);
    if (content) content = profanityService.cleanText(content);

    // Process tags
    let tagIds = null;
    if (tags && Array.isArray(tags)) {
      if (tags.length > 0) {
        // Separate numeric IDs from string names
        const numericIds = tags.filter((t) => typeof t === "number");
        const stringNames = tags.filter(
          (t) => typeof t === "string" && isNaN(Number(t)),
        );
        const numericStrings = tags
          .filter((t) => typeof t === "string" && !isNaN(Number(t)))
          .map(Number);

        // Get IDs for string tag names
        let convertedIds = [];
        if (stringNames.length > 0) {
          convertedIds = await discussionService.getOrCreateTags(stringNames);
        }

        tagIds = [...numericIds, ...numericStrings, ...convertedIds];
      } else {
        tagIds = [];
      }
    }

    const discussion = await discussionService.updateDiscussion(
      id,
      userId,
      { title, content, specializationId, degreeId, jobRoleId, tags: tagIds },
      isAdmin,
    );

    res.json(discussion);
  } catch (err) {
    console.error(err);
    if (err.message === "Edit window expired (24 hours)") {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === "Not authorized to edit this discussion") {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === "Discussion not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to update discussion" });
  }
};

/* ===============================
    DELETE DISCUSSION (soft delete)
  ================================ */
exports.deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const isAdmin = req.user.role === "admin";

    await discussionService.deleteDiscussion(id, userId, isAdmin);
    res.json({ message: "Discussion deleted successfully" });
  } catch (err) {
    console.error(err);
    if (err.message === "Not authorized to delete this discussion") {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === "Discussion not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to delete discussion" });
  }
};

/* ===============================
    ADD COMMENT
  ================================ */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    let { content } = req.body;
    const userId = req.user.portal_user_id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Clean profanity
    content = profanityService.cleanText(content);

    const comment = await discussionService.addComment(id, userId, content);

    // Get discussion owner for notification
    const discussion = await discussionService.getDiscussionById(id);
    if (discussion && discussion.author_id !== userId) {
      await discussionService.createNotification(
        discussion.author_id,
        "comment",
        `Someone commented on your discussion "${discussion.title}"`,
        userId,
        id,
        "discussion",
      );
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

/* ===============================
    DELETE COMMENT
  ================================ */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.portal_user_id;
    const isAdmin = req.user.role === "admin";

    await discussionService.deleteComment(commentId, userId, isAdmin);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    if (err.message === "Not authorized to delete this comment") {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === "Comment not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

/* ===============================
    TOGGLE LIKE
  ================================ */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    const result = await discussionService.toggleLike(id, userId);

    // Send notification if liked (not unliked) - don't fail if notification fails
    if (result.liked) {
      try {
        const discussion = await discussionService.getDiscussionById(id);
        if (discussion && discussion.author_id !== userId) {
          await discussionService.createNotification(
            discussion.author_id,
            "like",
            `Someone liked your discussion "${discussion.title}"`,
            userId,
            id,
            "discussion",
          );
        }
      } catch (notifErr) {
        console.error("Failed to send like notification:", notifErr.message);
        // Continue - notification failure shouldn't break the like
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Toggle like error:", err.message);
    res.status(500).json({ error: "Like failed", details: err.message });
  }
};

/* ===============================
    TOGGLE SAVE
  ================================ */
exports.toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    const result = await discussionService.toggleSave(id, userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    // Check if it's a max limit error
    if (err.message && err.message.includes("Maximum")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Save failed" });
  }
};

/* ===============================
    GET SAVED DISCUSSIONS
  ================================ */
exports.getSavedDiscussions = async (req, res) => {
  try {
    const userId = req.user.portal_user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await discussionService.getSavedDiscussions(
      userId,
      page,
      limit,
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch saved discussions" });
  }
};

/* ===============================
    GET MY POSTS
  ================================ */
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.portal_user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await discussionService.getMyPosts(userId, page, limit);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your posts" });
  }
};
