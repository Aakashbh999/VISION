const MODERATION_TARGETS = {
  discussion: {
    tableName: "portal.discussions",
    idColumn: "discussion_id",
    cloudinaryIdColumn: "image_public_id",
    softDeleteSetsDeletedFlag: true,
    examineQuery:
      "SELECT discussion_id, title, content, image_url, created_at FROM portal.discussions WHERE discussion_id = $1",
  },
  comment: {
    tableName: "portal.discussion_comments",
    idColumn: "comment_id",
    softDeleteSetsDeletedFlag: true,
    examineQuery: `SELECT c.comment_id, c.content, c.created_at, d.title as discussion_title
      FROM portal.discussion_comments c
      JOIN portal.discussions d ON c.discussion_id = d.discussion_id
      WHERE c.comment_id = $1`,
  },
  resource: {
    tableName: "portal.resources",
    idColumn: "resource_id",
    cloudinaryIdColumn: "cloudinary_public_id",
    examineQuery:
      "SELECT resource_id, title, description as content, file_url as image_url, created_at FROM portal.resources WHERE resource_id = $1",
  },
  group: {
    tableName: "portal.study_groups",
    idColumn: "group_id",
    cloudinaryIdColumn: "group_image_public_id",
  },
};

const getModerationTargetConfig = (targetType) => MODERATION_TARGETS[targetType] || null;

module.exports = {
  getModerationTargetConfig,
};
