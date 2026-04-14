const trimPreview = (value, max = 70) => {
  if (!value) return "";
  const text = String(value).trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
};

export const formatNotificationMessage = (notification) => {
  const actor = notification.actor_name || "Someone";
  const discussionTitle = trimPreview(notification.discussion_title || "");
  const commentPreview = trimPreview(notification.comment_preview || "");
  const resourceTitle = trimPreview(notification.resource_title || "");
  const groupName = trimPreview(notification.group_name || "");

  switch (notification.type) {
    case "comment":
      return discussionTitle
        ? `${actor} commented on your post "${discussionTitle}"`
        : `${actor} commented on your post`;
    case "like":
      return discussionTitle
        ? `${actor} upvoted your post "${discussionTitle}"`
        : `${actor} upvoted your post`;
    case "comment_like":
      return commentPreview
        ? `${actor} upvoted your comment "${commentPreview}"`
        : `${actor} upvoted your comment`;
    case "resource_approved":
      return resourceTitle
        ? `${actor} approved your resource "${resourceTitle}"`
        : `${actor} approved your resource`;
    case "resource_rejected":
      return resourceTitle
        ? `${actor} reviewed your resource "${resourceTitle}"`
        : `${actor} reviewed your resource`;
    case "group_joined":
      return groupName
        ? `${actor} joined your group "${groupName}"`
        : `${actor} joined your group`;
    default:
      return notification.message || "You have a new notification";
  }
};

export const resolveNotificationPath = (notification) => {
  if (notification.route_path) return notification.route_path;

  const targetType =
    notification.target_type || notification.related_type || notification.reference_type;
  const targetId =
    notification.target_id || notification.related_id || notification.reference_id;

  if (targetType === "comment") {
    const discussionId =
      notification.comment_discussion_id || notification.discussion_id || null;
    if (discussionId && targetId) {
      return `/discussions/${discussionId}#comment-${targetId}`;
    }
    if (discussionId) return `/discussions/${discussionId}`;
    return null;
  }

  if (targetType === "discussion" && targetId) {
    return `/discussions/${targetId}`;
  }

  if (targetType === "group" && targetId) {
    return `/groups/${targetId}`;
  }

  if (targetType === "resource") {
    return "/resources";
  }

  if (targetType === "user" && targetId) {
    return `/profile/${targetId}`;
  }

  const discussionId = notification.discussion_id || notification.comment_discussion_id;
  if (discussionId) {
    if (notification.comment_id) {
      return `/discussions/${discussionId}#comment-${notification.comment_id}`;
    }
    return `/discussions/${discussionId}`;
  }

  if (notification.type === "comment" || notification.type === "like" || notification.type === "comment_like") {
    const discussionTarget = notification.reference_id || notification.related_id;
    if (discussionTarget) return `/discussions/${discussionTarget}`;
  }

  return null;
};
