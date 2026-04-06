import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const parsePageParam = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

export const useDiscussionFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    specialization: searchParams.get("specialization") || "",
    degree: searchParams.get("degree") || "",
    tag: searchParams.get("tag") || "",
    sort: searchParams.get("sort") || "latest",
    search: searchParams.get("search") || "",
    page: parsePageParam(searchParams.get("page")),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "latest" && value !== 1) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return {
    filters,
    setFilters,
    updateFilter,
  };
};
