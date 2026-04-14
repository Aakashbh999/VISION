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

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const currentYear = new Date().getFullYear();

export const registerStep2Schema = z.object({
  university: z.string().trim().min(1, "University is required."),
  campus: z.string().trim().min(2, "Campus is required."),
  program_id: z.coerce.number().int().positive("Please select a program."),
  semester: z.coerce
    .number()
    .int()
    .min(1, "Semester must be between 1 and 12.")
    .max(12, "Semester must be between 1 and 12."),
  batch_year: z.coerce
    .number()
    .int()
    .min(2000, "Batch year is invalid.")
    .max(currentYear, "Batch year cannot be in the future."),
  tu_registration_no: z.string().trim().min(3, "TU registration number is required."),
  career_scope: z.array(z.string()).max(5, "You can select up to 5 interests."),
});
