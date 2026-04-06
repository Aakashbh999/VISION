import api from "../../../services/api";
import { toggleLike, toggleSave } from "../../../services/discussion";

export const toggleLikeDiscussion = (discussionId) => toggleLike(discussionId);

export const toggleSaveDiscussion = (discussionId) => toggleSave(discussionId);

export const getDiscussionDegrees = async () => {
  const response = await api.get("/discussions/degrees");
  return response.data || [];
};
