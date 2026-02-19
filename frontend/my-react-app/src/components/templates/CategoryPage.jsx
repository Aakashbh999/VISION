import { useState } from "react";

const CategoryPage = ({
  title,
  description,
  data,
  CardComponent,
  filterKey,
  filterOptions = ["All"],
  getFilterValue = (item) => item[filterKey], // default: get value from item[filterKey]
}) => {
  const [filter, setFilter] = useState("All");

  const filteredData =
    filter === "All"
      ? data
      : data.filter((item) => getFilterValue(item) === filter);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="text-gray-600 mt-3 text-base sm:text-lg leading-relaxed">
          {description}
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mt-8">
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === option
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredData.map((item) => (
          <CardComponent key={item.id} item={item} />
        ))}
      </div>

      {/* Empty state */}
      {filteredData.length === 0 && (
        <p className="text-center text-gray-500 mt-12">
          No items found for {filter}.
        </p>
      )}
    </div>
  );
};

export default CategoryPage;
