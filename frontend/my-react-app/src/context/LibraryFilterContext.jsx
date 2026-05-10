import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};

const initialFilters = {
  search: "",
  resource_type: "",
  program_id: "",
  semester: "",
  degree_id: "",
  view: "all", // "all" or "my"
  status: "all",
  page: 1,
  limit: 12,
};

export const FilterProvider = ({ children, initialFilters: propInitialFilters = initialFilters }) => {
  const [filters, setFilters] = useState(propInitialFilters);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
