import { z } from "zod";
import { JOB_TYPES, MARKET_CATEGORIES, NEWS_CATEGORIES, TRANSIT_TYPES } from "@/lib/api/types";

const optionalText = z.string().trim().optional().or(z.literal(""));
const notBlank = (label: string) => z.string().trim().min(1, `${label} is required`);

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/\d/, "Include at least one digit");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email address"),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, { message: "Passwords don't match", path: ["confirm_password"] });

export const resetPasswordSchema = z
  .object({ new_password: passwordSchema, confirm: z.string() })
  .refine((d) => d.new_password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export const eventSchema = z.object({
  title: notBlank("Title"),
  description: notBlank("Description"),
  location: notBlank("Location"),
  datetime: z.string().min(1, "Pick a date and time"),
  max_participants: z.union([z.coerce.number().int().positive("Must be a positive number"), z.literal("")]).optional(),
});

export const storySchema = z.object({
  title: notBlank("Title"),
  content: notBlank("Story"),
  tags: optionalText,
});

export const newsSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(255, "At most 255 characters"),
  content: z.string().trim().min(10, "At least 10 characters"),
  summary: z.string().trim().max(500, "At most 500 characters").optional(),
  category: z.enum(NEWS_CATEGORIES),
  severity: z.enum(["critical", "normal"]),
  is_published: z.boolean(),
});

export const timelineSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(255, "At most 255 characters"),
  content: z.string().trim().min(5, "At least 5 characters"),
  entry_date: z.string().min(1, "Pick the date this happened"),
});

export const jobSchema = z.object({
  title: notBlank("Title"),
  company: notBlank("Company"),
  description: notBlank("Description"),
  job_type: z.enum(JOB_TYPES),
  contact_email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
});

export const marketSchema = z.object({
  title: notBlank("Title"),
  description: notBlank("Description"),
  category: z.enum(MARKET_CATEGORIES),
  price: z.union([z.coerce.number().nonnegative("Price can't be negative"), z.literal("")]).optional(),
});

export const transitSchema = z.object({
  title: notBlank("Title"),
  transit_type: z.enum(TRANSIT_TYPES),
  from_location: notBlank("From"),
  to_location: notBlank("To"),
  available_seats: z.union([z.coerce.number().int().nonnegative("Can't be negative"), z.literal("")]).optional(),
});

/** Flattens a failed parse into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.errors) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
