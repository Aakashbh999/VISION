import api from "./api";

const buildQueryString = (params = {}) => {
  const filteredEntries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  return new URLSearchParams(filteredEntries).toString();
};

const withData = (promise) => promise.then((response) => response.data);

export const httpGet = (url, params) => {
  if (params && Object.keys(params).length > 0) {
    const queryString = buildQueryString(params);
    return withData(api.get(queryString ? `${url}?${queryString}` : url));
  }
  return withData(api.get(url));
};

export const httpPost = (url, payload) => withData(api.post(url, payload));
export const httpPatch = (url, payload) => withData(api.patch(url, payload));
export const httpPut = (url, payload) => withData(api.put(url, payload));
export const httpDelete = (url, config) => withData(api.delete(url, config));

export { buildQueryString };
