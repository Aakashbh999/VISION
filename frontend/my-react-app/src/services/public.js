import api from "./api";

export const getItFields = async (page = 1, limit = 9) => {
  const response = await api.get(`/it-fields?page=${page}&limit=${limit}`);
  return response.data; // { data: [...], pagination: {...} }
};

export const getAcademicDegrees = async (page = 1, limit = 9) => {
  const response = await api.get(
    `/academic-degrees?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const getJobMarket = async (page = 1, limit = 9) => {
  const response = await api.get(`/job-market?page=${page}&limit=${limit}`);
  return response.data;
};

export const getItClubs = async (page = 1, limit = 9) => {
  const response = await api.get(`/it-clubs?page=${page}&limit=${limit}`);
  return response.data;
};
