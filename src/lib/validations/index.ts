import { z } from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(3, "Enter a valid email address or 10-digit mobile number")
    .refine((val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^[6-9]\d{9}$/.test(val.replace(/[\s-]/g, ""));
      return isEmail || isPhone;
    }, "Must be a valid email or 10-digit mobile number"),
});

export const otpVerifySchema = z.object({
  identifier: z.string(),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain numbers only"),
});

export const joinRequestSchema = z.object({
  schoolName: z.string().default("MANAVI"),
  yearJoined: z.coerce
    .number()
    .int()
    .min(1986, "Navodaya was founded in 1986")
    .max(new Date().getFullYear(), "Cannot be in the future"),
  yearLeft: z.coerce
    .number()
    .int()
    .min(1986, "Invalid year")
    .max(new Date().getFullYear() + 7, "Invalid leaving year"),
  admissionNumber: z.string().optional(),
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  city: z.string().min(2, "Current city is required"),
  role: z.string().optional(),
  organisation: z.string().optional(),
}).refine((data) => data.yearLeft >= data.yearJoined, {
  message: "Year left must be after or equal to year joined",
  path: ["yearLeft"],
});

export const jobPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company name is required"),
  city: z.string().min(2, "City or 'Remote' is required"),
  type: z.enum(["Full-time", "Internship", "Contract", "Remote"]),
  experienceLevel: z.enum(["Fresher", "1-3 years", "Mid-Senior (4-8 yrs)", "Lead / Executive (8+ yrs)"]),
  description: z.string().min(30, "Please provide a detailed role overview and requirements"),
  applyMethod: z.string().min(5, "Enter application URL or recruiter email"),
});

export const storyPostSchema = z.object({
  headline: z.string().min(5, "Headline is required").max(140, "Keep headline under 140 characters"),
  type: z.enum(["news", "achievement", "memoir", "general"]),
  audience: z.enum(["all", "school", "batch"]),
  body: z.string().min(50, "Story content must be at least 50 characters"),
  coverImage: z.string().optional(),
});

export const eventHostSchema = z.object({
  name: z.string().min(3, "Event title is required"),
  description: z.string().min(20, "Please provide event details and agenda"),
  venue: z.string().min(3, "Venue or online link is required"),
  city: z.string().min(2, "City name is required"),
  startsAt: z.string().min(1, "Start date and time are required"),
  audience: z.enum(["all", "school", "batch"]),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().optional(),
  organisation: z.string().optional(),
  city: z.string().min(2, "City is required"),
  bio: z.string().max(300, "Bio should be concise").optional(),
  phoneVisibility: z.enum(["me", "batch", "school", "all"]),
  emailVisibility: z.enum(["me", "batch", "school", "all"]),
});
