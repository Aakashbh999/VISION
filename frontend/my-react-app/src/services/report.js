import api from "./api";

export const createReport = async (targetType, targetId, reason) => {
  const response = await api.post("/reports", {
    target_type: targetType,
    target_id: targetId,
    reason: reason,
  });
  return response.data;
};
