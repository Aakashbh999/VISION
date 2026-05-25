const test = require("node:test");
const assert = require("node:assert/strict");

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} = require("../validation/registerSchema");

test("registerSchema accepts valid payload and normalizes fields", () => {
  const parsed = registerSchema.parse({
    email: " student@example.com ",
    password: "Password1",
    full_name: "  Aakash   Bhandari ",
    semester: "4",
    batch_year: "2023",
    semester_is_manual: "true",
    tu_registration_no: "2021-2-45-0001",
    date_of_birth: "2003-05-15",
    career_scope: "  Web Development  ",
  });

  assert.equal(parsed.email, "student@example.com");
  assert.equal(parsed.full_name, "Aakash Bhandari");
  assert.equal(parsed.semester, 4);
  assert.equal(parsed.batch_year, 2023);
  assert.equal(parsed.semester_is_manual, true);
  assert.equal(parsed.tu_registration_no, "2021-2-45-0001");
  assert.equal(parsed.date_of_birth, "2003-05-15");
  assert.equal(parsed.career_scope, "Web Development");
});

test("registerSchema allows missing registration number", () => {
  const parsed = registerSchema.parse({
    email: "firstyear@example.com",
    password: "Password1",
    full_name: "First Year",
    semester: "1",
    batch_year: "2081",
    semester_is_manual: "false",
    tu_registration_no: "",
    date_of_birth: "2060-01-01",
    career_scope: "",
  });

  assert.equal(parsed.tu_registration_no, null);
});

test("loginSchema rejects malformed email", () => {
  const result = loginSchema.safeParse({
    email: "not-an-email",
    password: "Password1",
  });
  assert.equal(result.success, false);
});

test("forgotPasswordSchema enforces valid email", () => {
  const result = forgotPasswordSchema.safeParse({ email: "x" });
  assert.equal(result.success, false);
});

test("resetPasswordSchema enforces password complexity", () => {
  const result = resetPasswordSchema.safeParse({
    token: "reset-token",
    newPassword: "password",
  });
  assert.equal(result.success, false);
});

test("refreshTokenSchema requires refresh token", () => {
  const result = refreshTokenSchema.safeParse({ refreshToken: "" });
  assert.equal(result.success, false);
});
