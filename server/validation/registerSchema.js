const { z } = require("zod");
const validator = require("validator");
const rules = require("../../shared/validation/authValidationRules.json");

const fullNameRegex = new RegExp(rules.fullName.pattern);

const normalizeFullName = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

const toNullableInteger = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? value : parsed;
};

const toBoolean = (value) => value === true || value === "true";

const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((value) => validator.isEmail(value), {
      message: "Please enter a valid email address.",
    }),
  password: z
    .string()
    .min(rules.password.minLength, rules.password.minLengthMessage)
    .refine(
      (value) =>
        /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
      { message: rules.password.complexityMessage },
    ),
  full_name: z
    .string()
    .transform(normalizeFullName)
    .refine(
      (value) =>
        value.length >= rules.fullName.minLength &&
        value.length <= rules.fullName.maxLength,
      { message: rules.fullName.message },
    )
    .refine((value) => fullNameRegex.test(value), {
      message: rules.fullName.message,
    }),
  university: z.string().trim().optional(),
  campus_id: z.preprocess(
    toNullableInteger,
    z.number().int().positive().nullable().optional(),
  ),
  program_id: z.preprocess(
    toNullableInteger,
    z.number().int().positive().nullable().optional(),
  ),
  semester: z.preprocess(
    toNullableInteger,
    z.number().int().min(1).max(12).nullable().optional(),
  ),
  batch_year: z.preprocess(
    toNullableInteger,
    z.number().int().min(1900).max(2100).nullable().optional(),
  ),
  semester_is_manual: z.preprocess(toBoolean, z.boolean().optional()),
  tu_registration_no: z.preprocess((value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
  }, z.string().min(3, "Registration number must be at least 3 characters.").max(50, "Registration number is too long.").nullable()),
  date_of_birth: z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[012])$/, {
      message:
        "Please enter a valid date of birth in YYYY-MM-DD format (B.S.).",
    }),
  career_scope: z

    .string()
    .optional()
    .transform((value) => (typeof value === "string" ? value.trim() : value)),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((value) => validator.isEmail(value), {
      message: "Please enter a valid email address.",
    }),
  password: z.string().min(1, "Password is required."),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((value) => validator.isEmail(value), {
      message: "Please enter a valid email address.",
    }),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z
    .string()
    .min(rules.password.minLength, rules.password.minLengthMessage)
    .refine(
      (value) =>
        /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
      { message: rules.password.complexityMessage },
    ),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema,
};
