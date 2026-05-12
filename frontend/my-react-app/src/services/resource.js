import api from "./api";

export const uploadResource = async (formData) => {
  const isFormData = formData instanceof FormData;

  const response = await api.post("/resources", formData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const getResources = async (filters = {}, signal) => {
  const { view, ...otherFilters } = filters;

  if (view === "my") {
    const response = await api.get("/resources/my", {
      params: otherFilters,
      signal,
    });

    return { data: response.data };
  }

  const response = await api.get("/resources", {
    params: otherFilters,
    signal,
  });
  return response.data;
};

export const getMyResources = async () => {
  const response = await api.get("/resources/my");
  return response.data;
};

export const softDeleteResource = async (resourceId, reason) => {
  const response = await api.post(`/resources/${resourceId}/soft-delete`, {
    reason,
  });
  return response.data;
};
