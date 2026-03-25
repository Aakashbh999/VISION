import api from "./api";

/**
 * Report Service
 * Handles reporting of discussions and comments
 */

export const createReport = async (targetType, targetId, reason) => {
  const response = await api.post("/api/reports", {
    target_type: targetType,
    target_id: targetId,
    reason: reason,
  });
  return response.data;
};
