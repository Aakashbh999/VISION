import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from "./http";

// Dashboard stats (Aggregated)
export const getAdminDashboardStats = async () => {
  return httpGet("/admin/dashboard");
};

// Legacy/Basic student stats
export const getAdminStats = async () => {
  return httpGet("/admin/stats");
};

// Pending students
export const getPendingStudents = async () => {
  return httpGet("/admin/pending");
};

// Get students by status (approved, pending_review, rejected, suspended)
export const getStudentsByStatus = async (status, page = 1, limit = 10, search = "") => {
  return httpGet("/admin/students", { status, page, limit, search });
};

// Approve student
export const approveStudent = async (userId) => {
  return httpPatch(`/admin/approve/${userId}`);
};

// Reject student
export const rejectStudent = async (userId, reason = null) => {
  return httpPatch(`/admin/reject/${userId}`, { reason });
};

// Suspend student
export const suspendStudent = async (userId) => {
  return httpPatch(`/admin/suspend/${userId}`);
};

// Reactivate student
export const reactivateStudent = async (userId) => {
  return httpPatch(`/admin/reactivate/${userId}`);
};

// Get open reports (with pagination)
export const getReports = async (page = 1, limit = 10, search = "") => {
  return httpGet("/admin/reports", { page, limit, search });
};

// Close a report
export const closeReport = async (reportId) => {
  return httpPatch(`/admin/reports/${reportId}/close`);
};

// Get moderation logs
export const getModerationLogs = async (page = 1, limit = 20) => {
  return httpGet("/admin/logs", { page, limit });
};

// Permanently delete content
export const permanentlyDeleteContent = async (type, id) => {
  return httpDelete("/admin/content", {
    data: { type, id },
  });
};

// Permanently delete user
export const permanentlyDeleteUser = async (userId) => {
  return httpDelete(`/admin/users/${userId}`);
};

// Resolve report with specific action
export const resolveReportAction = async (reportId, action) => {
  return httpPost(`/admin/reports/${reportId}/resolve`, {
    action,
  });
};

export const examineReport = async (reportId) => {
  return httpGet(`/admin/reports/${reportId}/examine`);
};

// Registration Whitelist
export const getRegistrationWhitelist = async (params) => {
  return httpGet("/admin/registration-whitelist", params);
};

export const addRegistrationWhitelist = async (data) => {
  return httpPost("/admin/registration-whitelist", data);
};

export const updateRegistrationWhitelist = async (regNo, data) => {
  return httpPut(`/admin/registration-whitelist/${regNo}`, data);
};

export const deleteRegistrationWhitelist = async (regNo) => {
  return httpDelete(`/admin/registration-whitelist/${regNo}`);
};


// Campus Management
export const getAdminCampuses = async () => {
  return httpGet("/admin/campuses");
};

export const createAdminCampus = async (data) => {
  return httpPost("/admin/campuses", data);
};

export const updateAdminCampus = async (campusId, data) => {
  return httpPut(`/admin/campuses/${campusId}`, data);
};

export const deleteAdminCampus = async (campusId) => {
  return httpDelete(`/admin/campuses/${campusId}`);
};

// Reference Data Management Generator
const createReferenceApi = (endpoint) => ({
  getAll: () => httpGet(`/admin/reference/${endpoint}`),
  create: (data) => httpPost(`/admin/reference/${endpoint}`, data),
  update: (id, data) => httpPut(`/admin/reference/${endpoint}/${id}`, data),
  delete: (id) => httpDelete(`/admin/reference/${endpoint}/${id}`)
});

export const itFieldsApi = createReferenceApi("it-fields");
export const academicDegreesApi = createReferenceApi("academic-degrees");
export const jobMarketApi = createReferenceApi("job-market");
export const itClubsApi = createReferenceApi("it-clubs");
export const programsApi = createReferenceApi("programs");
export const tagsApi = createReferenceApi("tags");
