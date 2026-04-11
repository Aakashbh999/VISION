const { ZodError } = require("zod");
const createError = require("http-errors");

const validateBody = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const validationError = createError(
        400,
        err.issues[0]?.message || "Invalid request data.",
      );
      return next(validationError);
    }

    return next(err);
  }
};

module.exports = validateBody;
