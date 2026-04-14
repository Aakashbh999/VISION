const parsePagination = (query = {}, defaults = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 20,
    maxLimit = 50,
  } = defaults;

  const pageValue = Number.parseInt(query.page, 10);
  const limitValue = Number.parseInt(query.limit, 10);

  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : defaultPage;
  const limit =
    Number.isInteger(limitValue) && limitValue > 0
      ? Math.min(limitValue, maxLimit)
      : defaultLimit;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const buildPaginationMeta = ({ total, page, limit }) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
