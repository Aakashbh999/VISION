const path = require("path");
const { z } = require("zod");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional()
    .default("development"),
  PORT: z.coerce.number().int().positive().optional().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  FRONTEND_URL: z.string().url().optional(),
  BASE_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().optional(),
  EMAIL_PROVIDER: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${missing}`);
}

module.exports = parsed.data;
