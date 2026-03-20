import api from "./api";

// Upload a new resource (handles both file uploads and link resources)
export const uploadResource = async (formData) => {
  const isFormData = formData instanceof FormData;

  const response = await api.post("/resources", formData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

// Get resources (with optional filters)
export const getResources = async (filters = {}) => {
  const { view, ...otherFilters } = filters;
  
  if (view === "my") {
    const response = await api.get("/resources/my");
    // Standardize 'my' resources response to match the paginated format
    // as Resources.jsx expects { data: [...] }
    return { data: response.data };
  }

  // Handle pagination and other filters
  const response = await api.get("/resources", { params: otherFilters });
  return response.data;
};

// Get current user's uploaded resources directly
export const getMyResources = async () => {
  const response = await api.get("/resources/my");
  return response.data;
};

// Soft delete a resource
export const softDeleteResource = async (resourceId, reason) => {
  const response = await api.post(`/resources/${resourceId}/soft-delete`, {
    reason,
  });
  return response.data;
};
