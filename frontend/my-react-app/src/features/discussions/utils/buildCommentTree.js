export const buildCommentTree = (rawComments = []) => {
  const filteredComments = rawComments.filter((comment) => !comment.deleted);
  const commentMap = {};
  const rootComments = [];

  filteredComments.forEach((comment) => {
    commentMap[comment.comment_id] = { ...comment, replies: [] };
  });

  filteredComments.forEach((comment) => {
    if (comment.parent_id && commentMap[comment.parent_id]) {
      commentMap[comment.parent_id].replies.push(
        commentMap[comment.comment_id],
      );
      return;
    }

    if (!comment.parent_id) {
      rootComments.push(commentMap[comment.comment_id]);
    }
  });

  return rootComments;
};
