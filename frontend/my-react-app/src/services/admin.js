import api from "./api";

// Dashboard stats
export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// Pending students
export const getPendingStudents = async () => {
  const response = await api.get("/admin/pending");
  return response.data;
};

// Get students by status (approved, pending_review, rejected, suspended)
export const getStudentsByStatus = async (status, page = 1, limit = 10) => {
  const params = new URLSearchParams({ status, page, limit }).toString();
  const response = await api.get(`/admin/students?${params}`);
  return response.data;
};

// Approve student
export const approveStudent = async (userId) => {
  const response = await api.patch(`/admin/approve/${userId}`);
  return response.data;
};

// Reject student
export const rejectStudent = async (userId) => {
  const response = await api.patch(`/admin/reject/${userId}`);
  return response.data;
};

// Suspend student
export const suspendStudent = async (userId) => {
  const response = await api.patch(`/admin/suspend/${userId}`);
  return response.data;
};

// Reactivate student
export const reactivateStudent = async (userId) => {
  const response = await api.patch(`/admin/reactivate/${userId}`);
  return response.data;
};

// Get open reports (with pagination)
export const getReports = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({ page, limit }).toString();
  const response = await api.get(`/admin/reports?${params}`);
  return response.data;
};

// Close a report
export const closeReport = async (reportId) => {
  const response = await api.patch(`/admin/reports/${reportId}/close`);
  return response.data;
};

// Get moderation logs
export const getModerationLogs = async (page = 1, limit = 20) => {
  const params = new URLSearchParams({ page, limit }).toString();
  const response = await api.get(`/admin/logs?${params}`);
  return response.data;
};
