import { pgTable, text, timestamp, uuid, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

export const memberStatusEnum = pgEnum("member_status", ["pending", "verified", "suspended"]);
export const visibilityEnum = pgEnum("visibility", ["me", "batch", "school", "all"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "pending", "published", "rejected"]);
export const rsvpAnswerEnum = pgEnum("rsvp_answer", ["going", "maybe", "not_going"]);
export const adminScopeEnum = pgEnum("admin_scope", ["batch", "school", "platform"]);
export const storyTypeEnum = pgEnum("story_type", ["news", "achievement", "memoir", "general"]);

// 1. Schools
export const schools = pgTable("schools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  code: text("code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Batches
export const batches = pgTable("batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").references(() => schools.id, { onDelete: "cascade" }).notNull(),
  yearJoined: integer("year_joined").notNull(),
  yearLeft: integer("year_left").notNull(),
  batchName: text("batch_name"), // e.g. "Class of 2012"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Members
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").unique(),
  schoolId: uuid("school_id").references(() => schools.id).notNull(),
  batchId: uuid("batch_id").references(() => batches.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  admissionNumber: text("admission_number"),
  role: text("role"), // professional title, e.g. "Software Architect", "Cardiologist", "IAS Officer"
  organisation: text("organisation"),
  city: text("city"),
  photo: text("photo"),
  bio: text("bio"),
  status: memberStatusEnum("status").default("pending").notNull(),
  legacyId: text("legacy_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Member Privacy
export const memberPrivacy = pgTable("member_privacy", {
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).primaryKey(),
  phoneVisibility: visibilityEnum("phone_visibility").default("batch").notNull(),
  emailVisibility: visibilityEnum("email_visibility").default("school").notNull(),
  cityVisibility: visibilityEnum("city_visibility").default("all").notNull(),
});

// 5. Admin Roles
export const adminRoles = pgTable("admin_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  scope: adminScopeEnum("scope").notNull(),
  scopeId: uuid("scope_id"), // school_id or batch_id
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. Jobs & Saved Jobs
export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").references(() => schools.id).notNull(),
  authorId: uuid("author_id").references(() => members.id).notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  city: text("city").notNull(),
  type: text("type").notNull(), // Full-time, Internship, Contract, Remote
  experienceLevel: text("experience_level"), // Fresher, 1-3 years, Mid-Senior, Executive
  description: text("description").notNull(),
  applyMethod: text("apply_method").notNull(), // url or email or internal message
  status: contentStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const savedJobs = pgTable("saved_jobs", {
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. Stories / News
export const stories = pgTable("stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").references(() => schools.id).notNull(),
  authorId: uuid("author_id").references(() => members.id).notNull(),
  type: storyTypeEnum("type").default("news").notNull(),
  headline: text("headline").notNull(),
  body: text("body").notNull(),
  coverImage: text("cover_image"),
  audience: visibilityEnum("audience").default("school").notNull(),
  status: contentStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 8. Events, RSVPs & Questions
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  schoolId: uuid("school_id").references(() => schools.id).notNull(),
  hostId: uuid("host_id").references(() => members.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  audience: visibilityEnum("audience").default("school").notNull(),
  status: contentStatusEnum("status").default("published").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  answer: rsvpAnswerEnum("answer").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventQuestions = pgTable("event_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 9. Threads & Messages
export const threads = pgTable("threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberA: uuid("member_a").references(() => members.id).notNull(),
  memberB: uuid("member_b").references(() => members.id).notNull(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").references(() => threads.id, { onDelete: "cascade" }).notNull(),
  senderId: uuid("sender_id").references(() => members.id).notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
});

// 10. Reviews, Reports & Audit Log
export const reviewsAndReports = pgTable("reviews_and_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemType: text("item_type").notNull(), // member, job, story, event, message_thread
  itemId: uuid("item_id").notNull(),
  reviewerId: uuid("reviewer_id").references(() => members.id),
  decision: text("decision").notNull(), // approved, rejected, reported, resolved
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
