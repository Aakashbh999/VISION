import { z } from "zod";
import rules from "../../../../shared/validation/authValidationRules.json";

const fullNameRegex = new RegExp(rules.fullName.pattern);

export const normalizeFullName = (value) => value.trim().replace(/\s+/g, " ");

export const registerStep1Schema = z
  .object({
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
    email: z.string().trim().email("Please enter a valid email address."),
    password: z
      .string()
      .min(rules.password.minLength, rules.password.minLengthMessage)
      .refine(
        (value) =>
          /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
        { message: rules.password.complexityMessage },
      ),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });
