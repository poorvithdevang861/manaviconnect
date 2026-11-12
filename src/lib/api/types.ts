export interface User {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
  phone: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  profession: string | null;
  company: string | null;
  website: string | null;
  batch: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  is_mentor: boolean;
  mentoring_areas: string | null;
  interests: string | null;
  consent_agreed: boolean;
}

export type UserUpdate = Partial<Omit<User, "id" | "email" | "created_at" | "is_admin" | "avatar_url">>;

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export type Paginated<K extends string, T> = { total: number; page: number; limit: number } & { [P in K]: T[] };

export interface PageQuery {
  page?: number;
  limit?: number;
}

export interface LikeResult {
  liked: boolean;
  like_count: number;
}

export interface MessageResult {
  message: string;
}

// Events
export interface EventItem {
  id: number;
  title: string;
  description: string;
  datetime: string;
  location: string;
  banner_url: string | null;
  max_participants: number | null;
  created_by: number;
  created_at: string;
  organizer: User;
  like_count: number;
  is_liked: boolean;
}

export interface EventInput {
  title: string;
  description: string;
  datetime: string;
  location: string;
  banner_url?: string | null;
  max_participants?: number | null;
}

// Stories
export interface Story {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  tags: string | null;
  created_by: number;
  created_at: string;
  author: User;
  like_count: number;
  is_liked: boolean;
}

export interface StoryInput {
  title: string;
  content: string;
  image_url?: string | null;
  tags?: string | null;
}

// News
export const NEWS_CATEGORIES = ["announcement", "update", "event", "general"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];
export type NewsSeverity = "critical" | "normal";

export interface NewsArticle {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  category: NewsCategory;
  severity: NewsSeverity;
  is_published: boolean;
  created_by: number;
  created_at: string;
  updated_at: string | null;
  author: User;
}

export interface NewsInput {
  title: string;
  content: string;
  summary?: string | null;
  category?: NewsCategory;
  severity?: NewsSeverity;
  is_published?: boolean;
}

// Timeline
export interface TimelineEntry {
  id: number;
  title: string;
  content: string;
  photo_url: string | null;
  photos: string[];
  entry_date: string;
  created_by: number;
  created_at: string;
  updated_at: string | null;
  author: User;
  like_count: number;
  is_liked: boolean;
  comment_count: number;
}

export interface TimelineInput {
  title: string;
  content: string;
  entry_date: string;
}

export interface TimelineComment {
  id: number;
  entry_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author: User;
}

// Gallery
export interface GalleryPhoto {
  id: number;
  photo_url: string;
  caption: string | null;
  uploaded_by: number;
  created_at: string;
  uploader: Pick<User, "id" | "name" | "avatar_url">;
}

// Jobs
export const JOB_TYPES = ["full-time", "part-time", "contract", "freelance"] as const;
export type JobType = (typeof JOB_TYPES)[number];

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string | null;
  job_type: JobType;
  salary_range: string | null;
  requirements: string | null;
  tags: string | null;
  contact_email: string | null;
  deadline: string | null;
  created_by: number;
  created_at: string;
  poster: User;
}

export type JobInput = Omit<Job, "id" | "created_by" | "created_at" | "poster">;

// Marketplace
export const MARKET_CATEGORIES = ["crops", "produce", "business", "services", "goods", "other"] as const;
export type MarketCategory = (typeof MARKET_CATEGORIES)[number];

export interface MarketListing {
  id: number;
  title: string;
  description: string;
  price: string | null;
  category: MarketCategory;
  location: string | null;
  image_url: string | null;
  contact_info: string | null;
  is_negotiable: boolean;
  tags: string | null;
  created_by: number;
  created_at: string;
  poster: User;
}

export interface MarketInput {
  title: string;
  description: string;
  price?: number | null;
  category: MarketCategory;
  location?: string | null;
  contact_info?: string | null;
  is_negotiable?: boolean;
  tags?: string | null;
}

// Transit
export const TRANSIT_TYPES = ["carpool", "rideshare", "bus", "other"] as const;
export type TransitType = (typeof TRANSIT_TYPES)[number];

export interface TransitListing {
  id: number;
  title: string;
  description: string | null;
  transit_type: TransitType;
  from_location: string;
  to_location: string;
  schedule: string | null;
  available_seats: number | null;
  contact_name: string | null;
  contact_info: string | null;
  created_by: number;
  created_at: string;
  poster: User;
}

export type TransitInput = Omit<TransitListing, "id" | "created_by" | "created_at" | "poster">;

// Spotlight
export interface SpotlightSlide {
  id: number;
  image: string;
  sponsor: string;
  headline: string;
  description: string;
  cta: string;
  ctaLink: string;
  badge: string;
  accentFrom: string;
  accentTo: string;
}

// Invites
export interface Invite {
  id: number;
  token: string;
  email: string;
  invited_by: number;
  status: "pending" | "accepted" | "expired";
  expires_at: string;
  created_at: string;
}

export interface InviteValidation {
  valid: boolean;
  email: string | null;
  message: string;
}

// Notifications
export interface AppNotification {
  id: number;
  title: string;
  body: string | null;
  url: string | null;
  type: string;
  created_at: string;
}

export interface PushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Admin bulk import
export interface BulkUploadResult {
  summary: { total: number; created: number; skipped: number; failed: number };
  rows: Array<{ row: number; email: string; name: string; status: "created" | "skipped" | "failed"; note: string }>;
}

export interface HealthStatus {
  status: "ok" | "degraded";
  version: string;
  database: string;
}
