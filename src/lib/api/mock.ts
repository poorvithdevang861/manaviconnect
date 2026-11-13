/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError, type Method, type RequestOptions } from "./client";
import type { SpotlightSlide, User } from "./types";
import { MOCK_ADMIN_EMAIL, MOCK_GOOGLE_PROFILE, MOCK_GOOGLE_TOKEN, MOCK_MEMBER_EMAIL, MOCK_PASSWORD } from "./demo";
import { dummyImage as photo } from "@/lib/placeholder";

const avatar = (n: number) => `https://i.pravatar.cc/160?img=${n}`;

const STORAGE_KEY = "community_hub_mock_db_v4";
const E401 = () => new ApiError(401, "Could not validate credentials");

type Row = Record<string, any> & { id: number };

interface DB {
  seq: number;
  users: Row[];
  events: Row[];
  stories: Row[];
  news: Row[];
  timeline: Row[];
  comments: Row[];
  gallery: Row[];
  jobs: Row[];
  marketplace: Row[];
  transit: Row[];
  likes: string[];
  slides: SpotlightSlide[];
  invites: Row[];
  notifications: Row[];
  subscriptions: string[];
  resetTokens: Record<string, number>;
}

const iso = (offsetDays = 0, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const day = (offsetDays: number) => iso(offsetDays).slice(0, 10);

function blankUser(id: number, name: string, email: string, extra: Partial<User> = {}): Row {
  return {
    id, name, email, password: MOCK_PASSWORD, is_active: true,
    bio: null, avatar_url: null, created_at: iso(-200), is_admin: false,
    phone: null, address: null, city: null, district: null, state: "Karnataka", pincode: null,
    profession: null, company: null, website: null, batch: null,
    linkedin_url: null, twitter_url: null, instagram_url: null, facebook_url: null,
    is_mentor: false, mentoring_areas: null, interests: null, consent_agreed: true,
    ...extra,
  };
}

function seed(): DB {
  const users = [
    blankUser(1, "Poorvith Devang", MOCK_ADMIN_EMAIL, {
      is_admin: true, batch: "2014", city: "Bengaluru", profession: "Software Architect", company: "Fascinateit",
      bio: "2014 batch. Building the alumni platform and mentoring engineering aspirants.", is_mentor: true,
      mentoring_areas: "Web development, career guidance", phone: "+91 98450 12345",
    }),
    blankUser(2, "Ananya Hegde", "ananya@example.com", { avatar_url: avatar(47), batch: "2010", city: "Mysuru", profession: "Consultant Pediatrician", company: "Apollo Hospitals", is_mentor: true, mentoring_areas: "NEET preparation" }),
    blankUser(3, "Rohit Kulkarni", "rohit@example.com", { avatar_url: avatar(12), batch: "2008", city: "Shivamogga", profession: "Assistant Commissioner", company: "Government of Karnataka" }),
    blankUser(4, "Sneha Bharadwaj", MOCK_MEMBER_EMAIL, { avatar_url: avatar(45), batch: "2012", city: "Bengaluru", profession: "Founder", company: "AgriNext Labs" }),
    blankUser(5, "Kiran Prasad", "kiran@example.com", { avatar_url: avatar(59), batch: "2016", city: "Hyderabad", profession: "Cloud Engineer", company: "TCS" }),
  ];

  return {
    seq: 100,
    users,
    events: [
      { id: 1, title: "Annual Winter Alumni Reunion", description: "The yearly gathering on the school quadrangle. Felicitation for the 2001 and 2016 batches, lunch, and a cultural evening in the multipurpose hall.", datetime: iso(38, 10), location: "Main Quadrangle, MANAVI Campus", banner_url: photo("reunion"), max_participants: 300, created_by: 3, created_at: iso(-12), is_active: true },
      { id: 2, title: "Bengaluru Chapter Breakfast", description: "An informal morning walk and breakfast at Cubbon Park for alumni working in and around Bengaluru.", datetime: iso(10, 8), location: "Cubbon Park, Bengaluru", banner_url: photo("meetup"), max_participants: 40, created_by: 1, created_at: iso(-5), is_active: true },
      { id: 3, title: "Career Guidance Day for Class 12", description: "Alumni from medicine, civil services and engineering spoke to the outgoing batch about entrance exams and college life.", datetime: iso(-30, 9), location: "School Auditorium", banner_url: photo("science"), max_participants: null, created_by: 2, created_at: iso(-50), is_active: true },
    ],
    stories: [
      { id: 1, title: "Mornings at the 5:45 whistle", content: "No matter where our careers take us, the discipline and friendships formed in the hostel dormitories stay with us. I still wake up before the alarm.\n\nThe cross-country runs around the eucalyptus grove were where most of my lifelong friendships began.", image_url: photo("sports"), tags: "memoir,hostel", created_by: 4, created_at: iso(-3), is_active: true },
      { id: 2, title: "From a borrowed laptop to a soil-testing startup", content: "AgriNext Labs started on a borrowed laptop during my final year. Today our soil kits reach more than 4,500 coffee growers in Kodagu and Hassan.\n\nI owe my curiosity to the science exhibitions we ran in 2010.", image_url: photo("workspace"), tags: "startup,career,agriculture", created_by: 4, created_at: iso(-9), is_active: true },
      { id: 3, title: "What the library taught me", content: "The school library was the first place I read a newspaper end to end. Twenty years later, I'm glad our batch could give back 1,200 books to it.", image_url: photo("library"), tags: "library,giving-back", created_by: 3, created_at: iso(-20), is_active: true },
      { id: 4, title: "Three attempts at the civil services, and what finally worked", content: "I cleared the exam on my third attempt. The first two taught me that a timetable matters less than a weekly mock test and an honest review of it.\n\nIf you're preparing, write to me. I'm happy to share my notes and answer-writing practice sheets.", image_url: photo("library"), tags: "career,exams", created_by: 2, created_at: iso(-12), is_active: true },
    ],
    news: [
      { id: 1, title: "Reunion registrations close on Dec 10", summary: "Register before Dec 10 so the committee can plan meals and dormitory beds.", content: "Registrations for the annual winter reunion close on December 10. Outstation alumni who need a dormitory bed should mention it in their registration. Families are welcome.", image_url: photo("campus"), category: "announcement", severity: "critical", is_published: true, created_by: 1, created_at: iso(-1), updated_at: null },
      { id: 2, title: "Alumni donate 1,200 books to the school library", summary: "The 2004–2012 batches handed over reference books and Olympiad material.", content: "During the reunion, representatives from eight batches handed over a curated collection of reference books, Olympiad material and computer science resources to the school library.", image_url: photo("library"), category: "update", severity: "normal", is_published: true, created_by: 1, created_at: iso(-14), updated_at: null },
      { id: 3, title: "New alumni scholarship (draft)", summary: "Details being finalised with the principal.", content: "The alumni association is setting up a scholarship for students from the most remote villages in the district. More details soon.", image_url: photo("science"), category: "general", severity: "normal", is_published: false, created_by: 1, created_at: iso(-2), updated_at: null },
    ],
    timeline: [
      { id: 1, title: "School opens with its first batch", content: "Eighty students joined Class 6 in temporary buildings while the main campus was under construction.", photo_url: photo("campus"), photos: [{ id: 11, url: photo("sports") }], entry_date: "1987-08-01", created_by: 1, created_at: iso(-100), updated_at: null },
      { id: 2, title: "First Class 12 board results", content: "The first batch completed Class 12 with a 100% pass rate.", photo_url: photo("science"), photos: [], entry_date: "1994-05-20", created_by: 1, created_at: iso(-100), updated_at: null },
      { id: 3, title: "Alumni association registered", content: "The association was registered with 40 founding members from the first five batches.", photo_url: photo("reunion"), photos: [{ id: 12, url: photo("library") }, { id: 13, url: photo("meetup") }], entry_date: "2003-08-15", created_by: 1, created_at: iso(-100), updated_at: null },
    ],
    comments: [
      { id: 1, entry_id: 3, user_id: 3, content: "I was one of the forty. We met in the chemistry lab.", created_at: iso(-40) },
    ],
    gallery: ([
      ["campus", "The main block on a winter morning", 3, -2],
      ["reunion", "Reunion 2025, batch of 2010", 2, -5],
      ["sports", "Sports day relay finals", 3, -9],
      ["science", "Science exhibition, solar house and volcano models", 5, -15],
      ["library", "The library after the 1,200-book donation", 1, -25],
      ["meetup", "Bengaluru chapter breakfast at Cubbon Park", 1, -31],
      ["coffee", "Drying yard at Sneha's family estate", 4, -38],
      ["workspace", "Where AgriNext Labs started", 4, -45],
    ] as const).map(([img, caption, by, days], i) => ({ id: i + 1, photo_url: photo(img), caption, uploaded_by: by, created_at: iso(days) })),
    jobs: [
      { id: 1, title: "Senior Full-Stack Engineer", company: "AgriNext Labs", description: "Lead our sensor telemetry platform. Strong TypeScript, Next.js and Postgres experience needed. Alumni referrals get a priority interview.", location: "Bengaluru (Hybrid)", job_type: "full-time", salary_range: "₹25–35 LPA", requirements: "5+ years full-stack, TypeScript, Postgres", tags: "referral,typescript,nextjs,postgres", contact_email: "careers@agrinext.example", deadline: day(20), created_by: 4, created_at: iso(-2), is_active: true },
      { id: 2, title: "Pediatric Clinical Fellow", company: "Apollo Hospitals", description: "Opening for junior clinical fellows in the Department of Pediatrics, working with senior consultants on outpatient and neonatal care.", location: "Mysuru", job_type: "full-time", salary_range: null, requirements: "MD Pediatrics", tags: "referral,medicine,pediatrics", contact_email: "ananya@example.com", deadline: day(30), created_by: 2, created_at: iso(-6), is_active: true },
      { id: 3, title: "Cloud Infrastructure Consultant", company: "Fascinateit", description: "Short engagement to move our deployment pipelines to Kubernetes.", location: "Remote", job_type: "contract", salary_range: "₹1.5 L / month", requirements: "Kubernetes, Terraform", tags: "devops,kubernetes", contact_email: "hiring@fascinateit.example", deadline: null, created_by: 1, created_at: iso(-10), is_active: true },
    ],
    marketplace: [
      { id: 1, title: "Arabica coffee beans, 25 kg", description: "Sun-dried arabica from our family estate in Chikmagalur.", price: "9500.00", category: "produce", location: "Chikmagalur", image_url: photo("coffee"), contact_info: "+91 90000 11111", is_negotiable: true, tags: "coffee,organic", created_by: 4, created_at: iso(-4), is_active: true },
      { id: 2, title: "Website design for small businesses", description: "Simple, fast websites for shops and clinics. Alumni get 20% off.", price: null, category: "services", location: "Bengaluru", image_url: photo("workspace"), contact_info: "kiran@example.com", is_negotiable: true, tags: "web,design", created_by: 5, created_at: iso(-8), is_active: true },
    ],
    transit: [
      { id: 1, title: "Bengaluru to campus for the reunion", description: "Driving down the evening before the reunion, returning the next night.", transit_type: "carpool", from_location: "Bengaluru", to_location: "MANAVI Campus", schedule: "Day before the reunion, 6 PM", available_seats: 3, contact_name: "Poorvith", contact_info: "+91 98450 12345", created_by: 1, created_at: iso(-3), is_active: true },
      { id: 2, title: "Daily carpool to Electronic City", description: "Leaving Jayanagar at 8:15 AM.", transit_type: "carpool", from_location: "Jayanagar", to_location: "Electronic City", schedule: "Mon–Fri, 8:15 AM", available_seats: 1, contact_name: "Sneha", contact_info: "+91 97410 55670", created_by: 4, created_at: iso(-7), is_active: true },
    ],
    likes: ["event:1:2", "event:1:4", "story:2:1", "story:2:3", "timeline:3:3"],
    slides: [
      { id: 1, image: photo("workspace"), sponsor: "AgriNext Labs", headline: "Hiring 2026 graduates", description: "Engineering and field roles in Bengaluru. Alumni referrals get a priority interview.", cta: "See the job", ctaLink: "/career?id=1", badge: "Sponsored", accentFrom: "#9a3412", accentTo: "#ea580c" },
      { id: 2, image: photo("reunion"), sponsor: "Alumni Association", headline: "Annual reunion registrations are open", description: "Register before Dec 10 so we can plan meals and beds.", cta: "View event", ctaLink: "/events/1", badge: "Community", accentFrom: "#14532d", accentTo: "#15803d" },
    ],
    invites: [],
    notifications: [
      { id: 1, title: "New News: Reunion registrations close on Dec 10", body: "Register before Dec 10 so the committee can plan meals and dormitory beds.", url: "/news/1", type: "news", created_at: iso(-1) },
      { id: 2, title: "New Job: Senior Full-Stack Engineer", body: "AgriNext Labs", url: "/career?id=1", type: "job", created_at: iso(-2) },
      { id: 3, title: "New Event: Bengaluru Chapter Breakfast", body: "Cubbon Park, Bengaluru", url: "/events/2", type: "event", created_at: iso(-5) },
    ],
    subscriptions: [],
    resetTokens: {},
  };
}

let db: DB | null = null;

function load(): DB {
  if (db) return db;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    db = raw ? (JSON.parse(raw) as DB) : seed();
  } catch {
    db = seed();
  }
  return db;
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Quota exceeded by uploaded images; keep the in-memory copy for this session.
  }
}

export function resetMockData() {
  db = seed();
  save();
}

// ── helpers ──────────────────────────────────────────────────────────────
const nextId = () => ++load().seq;
const nowIso = () => new Date().toISOString();

function publicUser(u: Row | undefined): User {
  if (!u) return blankUser(0, "Deleted user", "") as unknown as User;
  const { password: _p, is_active: _a, ...rest } = u;
  return rest as User;
}
const userById = (id: number) => publicUser(load().users.find((u) => u.id === id));

function currentUser(token: string | null): Row | null {
  if (!token?.startsWith("mock.")) return null;
  const id = Number(token.slice(5));
  return load().users.find((u) => u.id === id && u.is_active) ?? null;
}

function requireUser(me: Row | null): Row {
  if (!me) throw E401();
  return me;
}

function requireAdmin(me: Row | null, message = "Admin access required"): Row {
  const u = requireUser(me);
  if (!u.is_admin) throw new ApiError(403, message);
  return u;
}

function requireOwner(me: Row | null, row: Row, message = "Not authorized") {
  const u = requireUser(me);
  if (row.created_by !== u.id && !u.is_admin) throw new ApiError(403, message);
}

function find(list: Row[], id: number, notFound: string, activeOnly = true): Row {
  const row = list.find((r) => r.id === id && (!activeOnly || r.is_active !== false));
  if (!row) throw new ApiError(404, notFound);
  return row;
}

function paginate<K extends string>(items: unknown[], q: URLSearchParams, key: K, defaultLimit = 10) {
  const page = Math.max(1, Number(q.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.get("limit")) || defaultLimit));
  return { total: items.length, page, limit, [key]: items.slice((page - 1) * limit, page * limit) };
}

const matches = (value: unknown, term: string | null) =>
  !term || String(value ?? "").toLowerCase().includes(term.toLowerCase());

const byNewest = (a: Row, b: Row) => b.created_at.localeCompare(a.created_at);

function required(body: Row, fields: string[], label = "cannot be empty") {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || String(body[f]).trim() === "") {
      const name = f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " ");
      throw new ApiError(422, `${name} ${label}`);
    }
  }
}

function oneOf(value: unknown, allowed: readonly string[], field: string) {
  if (value !== undefined && !allowed.includes(String(value))) {
    throw new ApiError(422, `${field} must be one of ${allowed.join(", ")}`);
  }
}

function checkPassword(pw: string) {
  if (!pw || pw.length < 8) throw new ApiError(422, "Password must be at least 8 characters");
  if (!/[A-Z]/.test(pw)) throw new ApiError(422, "Password must contain at least one uppercase letter");
  if (!/\d/.test(pw)) throw new ApiError(422, "Password must contain at least one digit");
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function readUpload(form: FormData | undefined, opts: { maxMb?: number; pdf?: boolean; field?: string } = {}): Promise<string[]> {
  const files = (form?.getAll(opts.field ?? "file") ?? []).filter((f): f is File => f instanceof File);
  if (files.length === 0) throw new ApiError(422, "Field required");
  const out: string[] = [];
  for (const file of files) {
    const isPdf = file.type === "application/pdf";
    if (!IMAGE_TYPES.includes(file.type) && !(opts.pdf && isPdf)) {
      throw new ApiError(400, opts.pdf ? "Only JPEG, PNG, WebP images or PDF files allowed" : "Only JPEG/PNG/WebP images allowed");
    }
    const max = (isPdf ? 10 : opts.maxMb ?? 5) * 1024 * 1024;
    if (file.size > max) throw new ApiError(400, `File too large (max ${isPdf ? 10 : opts.maxMb ?? 5}MB)`);
    out.push(
      await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new ApiError(400, "Could not read file"));
        reader.readAsDataURL(file);
      }),
    );
  }
  return out;
}

function notify(type: string, title: string, body: string | null, url: string) {
  load().notifications.unshift({ id: nextId(), title, body, url, type, created_at: nowIso() });
}

function likeInfo(kind: string, id: number, me: Row | null) {
  const prefix = `${kind}:${id}:`;
  const likes = load().likes.filter((l) => l.startsWith(prefix));
  return { like_count: likes.length, is_liked: !!me && likes.includes(`${prefix}${me.id}`) };
}

function toggleLike(kind: string, id: number, me: Row) {
  const key = `${kind}:${id}:${me.id}`;
  const d = load();
  const had = d.likes.includes(key);
  d.likes = had ? d.likes.filter((l) => l !== key) : [...d.likes, key];
  return { liked: !had, like_count: likeInfo(kind, id, me).like_count };
}

function strip(row: Row) {
  const { is_active: _a, ...rest } = row;
  return rest;
}

const hydrate = {
  event: (r: Row, me: Row | null) => ({ ...strip(r), organizer: userById(r.created_by), ...likeInfo("event", r.id, me) }),
  story: (r: Row, me: Row | null) => ({ ...strip(r), author: userById(r.created_by), ...likeInfo("story", r.id, me) }),
  news: (r: Row) => ({ ...r, author: userById(r.created_by) }),
  timeline: (r: Row, me: Row | null) => ({
    ...r,
    photos: [...(r.photo_url ? [r.photo_url] : []), ...r.photos.map((p: Row) => p.url)],
    author: userById(r.created_by),
    ...likeInfo("timeline", r.id, me),
    comment_count: load().comments.filter((c) => c.entry_id === r.id).length,
  }),
  poster: (r: Row) => ({ ...strip(r), poster: userById(r.created_by) }),
  gallery: (r: Row) => {
    const u = userById(r.uploaded_by);
    return { ...r, uploader: { id: u.id, name: u.name, avatar_url: u.avatar_url } };
  },
  comment: (c: Row) => ({ ...c, author: userById(c.user_id) }),
};

function pick(body: Row, fields: string[]): Row {
  const out: Row = { id: 0 };
  delete (out as Partial<Row>).id;
  for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
  return out;
}

// ── routes ───────────────────────────────────────────────────────────────
interface Ctx {
  me: Row | null;
  q: URLSearchParams;
  body: any;
  form?: FormData;
  params: string[];
}
type Handler = (ctx: Ctx) => unknown | Promise<unknown>;

const EVENT_FIELDS = ["title", "description", "datetime", "location", "banner_url", "max_participants"];
const STORY_FIELDS = ["title", "content", "image_url", "tags"];
const NEWS_FIELDS = ["title", "content", "summary", "category", "severity", "is_published"];
const JOB_FIELDS = ["title", "company", "description", "location", "job_type", "salary_range", "requirements", "tags", "contact_email", "deadline"];
const MARKET_FIELDS = ["title", "description", "price", "category", "location", "contact_info", "is_negotiable", "tags"];
const TRANSIT_FIELDS = ["title", "description", "transit_type", "from_location", "to_location", "schedule", "available_seats", "contact_name", "contact_info"];
const USER_FIELDS = ["name", "bio", "phone", "address", "city", "district", "state", "pincode", "profession", "company", "website", "batch", "linkedin_url", "twitter_url", "instagram_url", "facebook_url", "is_mentor", "mentoring_areas", "interests", "consent_agreed"];

const price = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v).toFixed(2));

/**
 * Reads the claims of a Google ID token. The demo backend runs in the browser and cannot
 * verify Google's signature; a real backend must verify the token before trusting it.
 */
function readGoogleToken(token: unknown): { email: string; name: string; picture: string | null } {
  if (token === MOCK_GOOGLE_TOKEN) return MOCK_GOOGLE_PROFILE;
  try {
    const part = String(token).split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part), (c) => c.charCodeAt(0))));
    if (!claims.email || claims.email_verified === false) throw new Error();
    return { email: String(claims.email).toLowerCase(), name: claims.name || claims.email.split("@")[0], picture: claims.picture ?? null };
  } catch {
    throw new ApiError(401, "Google sign-in failed. Please try again.");
  }
}

const routes: Array<[Method, RegExp, Handler]> = [
  ["GET", /^\/health$/, () => ({ status: "ok", version: "1.0.0", database: "connected" })],

  // Auth
  ["POST", /^\/api\/auth\/signup$/, ({ body }) => {
    required(body, ["name", "email"]);
    checkPassword(body.password);
    if (body.password !== body.confirm_password) throw new ApiError(422, "Passwords do not match");
    const d = load();
    const email = String(body.email).toLowerCase().trim();
    if (d.users.some((u) => u.email === email)) throw new ApiError(409, "An account with this email already exists");
    const user = blankUser(nextId(), String(body.name).trim(), email, { created_at: nowIso() });
    user.password = body.password;
    d.users.push(user);
    return { access_token: `mock.${user.id}`, token_type: "bearer", user: publicUser(user) };
  }],
  ["POST", /^\/api\/auth\/login$/, ({ body }) => {
    const user = load().users.find((u) => u.email === String(body?.email ?? "").toLowerCase().trim());
    if (!user || user.password !== body.password || !user.is_active) throw new ApiError(401, "Invalid email or password");
    return { access_token: `mock.${user.id}`, token_type: "bearer", user: publicUser(user) };
  }],
  ["POST", /^\/api\/auth\/google$/, ({ body }) => {
    const claims = readGoogleToken(body?.id_token);
    const d = load();
    let user = d.users.find((u) => u.email === claims.email);
    if (!user) {
      user = blankUser(nextId(), claims.name, claims.email, { avatar_url: claims.picture, created_at: nowIso() });
      user.password = null;
      d.users.push(user);
    }
    if (!user.is_active) throw new ApiError(403, "This account has been deactivated");
    return { access_token: `mock.${user.id}`, token_type: "bearer", user: publicUser(user) };
  }],
  ["POST", /^\/api\/auth\/forgot-password$/, ({ body }) => {
    const d = load();
    const user = d.users.find((u) => u.email === String(body?.email ?? "").toLowerCase().trim());
    if (user) {
      const token = `reset-${user.id}-${Math.random().toString(36).slice(2, 10)}`;
      d.resetTokens[token] = user.id;
      console.info(`[mock] Password reset link: /reset-password?token=${token}`);
    }
    return { message: "If that email exists, a reset link has been sent." };
  }],
  ["POST", /^\/api\/auth\/reset-password$/, ({ body }) => {
    const d = load();
    const userId = d.resetTokens[body?.token];
    if (!userId) throw new ApiError(400, "Invalid or expired reset token.");
    checkPassword(body.new_password);
    const user = d.users.find((u) => u.id === userId);
    if (!user) throw new ApiError(404, "User not found.");
    user.password = body.new_password;
    delete d.resetTokens[body.token];
    return { message: "Password reset successfully. You can now log in." };
  }],
  ["GET", /^\/api\/auth\/bulk-template$/, ({ me }) => {
    requireAdmin(me);
    throw new ApiError(501, "The Excel template is generated by the backend. Connect NEXT_PUBLIC_API_URL to download it.");
  }],
  ["POST", /^\/api\/auth\/bulk-upload$/, ({ me }) => {
    requireAdmin(me);
    throw new ApiError(501, "Bulk import runs on the backend. Connect NEXT_PUBLIC_API_URL to use it.");
  }],

  // Users
  ["GET", /^\/api\/users\/me$/, ({ me }) => publicUser(requireUser(me))],
  ["PUT", /^\/api\/users\/me$/, ({ me, body }) => {
    const u = requireUser(me);
    for (const [k, v] of Object.entries(pick(body, USER_FIELDS))) if (v !== null) u[k] = v;
    return publicUser(u);
  }],
  ["GET", /^\/api\/users\/me\/events$/, ({ me }) => {
    const u = requireUser(me);
    return load().events.filter((e) => e.created_by === u.id && e.is_active).sort(byNewest)
      .map((e) => ({ ...hydrate.event(e, null), like_count: 0, is_liked: false }));
  }],
  ["GET", /^\/api\/users\/me\/stories$/, ({ me }) => {
    const u = requireUser(me);
    return load().stories.filter((s) => s.created_by === u.id && s.is_active).sort(byNewest)
      .map((s) => ({ ...hydrate.story(s, null), like_count: 0, is_liked: false }));
  }],
  ["POST", /^\/api\/users\/me\/avatar$/, async ({ me, form }) => {
    const u = requireUser(me);
    [u.avatar_url] = await readUpload(form);
    return publicUser(u);
  }],

  // Spotlight
  ["GET", /^\/api\/users\/spotlight$/, () => load().slides],
  ["PUT", /^\/api\/users\/spotlight$/, ({ me, body }) => {
    requireAdmin(me, "Admins only");
    load().slides = body;
    return body;
  }],
  ["POST", /^\/api\/users\/spotlight\/upload$/, async ({ me, form }) => {
    requireAdmin(me, "Admins only");
    const [url] = await readUpload(form, { maxMb: 10 });
    return { image_url: url };
  }],

  // Invites
  ["POST", /^\/api\/invites$/, ({ me, body }) => {
    const u = requireUser(me);
    const email = String(body?.email ?? "").toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(422, "value is not a valid email address");
    const d = load();
    if (d.invites.some((i) => i.email === email && i.status === "pending")) throw new ApiError(409, "A pending invite for this email already exists.");
    const invite = { id: nextId(), token: crypto.randomUUID(), email, invited_by: u.id, status: "pending", expires_at: iso(7), created_at: nowIso() };
    d.invites.push(invite);
    console.info(`[mock] Invite link: /join?invite=${invite.token}`);
    return invite;
  }],
  ["GET", /^\/api\/invites\/validate\/([^/]+)$/, ({ params }) => {
    const inv = load().invites.find((i) => i.token === params[0]);
    if (!inv) return { valid: false, email: null, message: "Invite not found." };
    if (inv.status === "accepted") return { valid: false, email: inv.email, message: "This invite has already been used." };
    if (inv.status === "expired" || inv.expires_at < nowIso()) {
      inv.status = "expired";
      return { valid: false, email: inv.email, message: "This invite has expired." };
    }
    return { valid: true, email: inv.email, message: "Invite is valid." };
  }],
  ["POST", /^\/api\/invites\/accept\/([^/]+)$/, ({ params }) => {
    const inv = load().invites.find((i) => i.token === params[0]);
    if (inv) inv.status = "accepted";
    return { accepted: true };
  }],

  // Events
  ["GET", /^\/api\/events$/, ({ me, q }) => {
    const now = nowIso();
    const type = q.get("type");
    const items = load().events
      .filter((e) => e.is_active && matches(e.title, q.get("search")))
      .filter((e) => (type === "upcoming" ? e.datetime >= now : type === "past" ? e.datetime < now : true))
      .sort((a, b) => a.datetime.localeCompare(b.datetime))
      .map((e) => hydrate.event(e, me));
    return paginate(items, q, "events");
  }],
  ["GET", /^\/api\/events\/(\d+)$/, ({ me, params }) => hydrate.event(find(load().events, +params[0], "Event not found"), me)],
  ["POST", /^\/api\/events$/, ({ me, body }) => {
    const u = requireUser(me);
    required(body, ["title", "description", "location", "datetime"]);
    const row: Row = { ...pick(body, EVENT_FIELDS), id: nextId(), created_by: u.id, created_at: nowIso(), is_active: true };
    load().events.push(row);
    notify("event", `New Event: ${row.title}`, row.location, `/events/${row.id}`);
    return hydrate.event(row, u);
  }],
  ["PUT", /^\/api\/events\/(\d+)$/, ({ me, params, body }) => {
    const row = find(load().events, +params[0], "Event not found");
    requireOwner(me, row);
    Object.assign(row, pick(body, EVENT_FIELDS));
    return hydrate.event(row, me);
  }],
  ["DELETE", /^\/api\/events\/(\d+)$/, ({ me, params }) => {
    const row = find(load().events, +params[0], "Event not found");
    requireOwner(me, row);
    row.is_active = false;
  }],
  ["POST", /^\/api\/events\/(\d+)\/like$/, ({ me, params }) => {
    find(load().events, +params[0], "Event not found");
    return toggleLike("event", +params[0], requireUser(me));
  }],
  ["POST", /^\/api\/events\/(\d+)\/banner$/, async ({ me, params, form }) => {
    const row = find(load().events, +params[0], "Event not found");
    requireOwner(me, row);
    [row.banner_url] = await readUpload(form);
    return hydrate.event(row, me);
  }],

  // Stories
  ["GET", /^\/api\/stories$/, ({ me, q }) => {
    const items = load().stories.filter((s) => s.is_active && matches(s.title, q.get("search"))).sort(byNewest).map((s) => hydrate.story(s, me));
    return paginate(items, q, "stories");
  }],
  ["GET", /^\/api\/stories\/(\d+)$/, ({ me, params }) => hydrate.story(find(load().stories, +params[0], "Story not found"), me)],
  ["POST", /^\/api\/stories$/, ({ me, body }) => {
    const u = requireUser(me);
    required(body, ["title", "content"]);
    const row: Row = { ...pick(body, STORY_FIELDS), id: nextId(), created_by: u.id, created_at: nowIso(), is_active: true };
    load().stories.push(row);
    notify("story", `New Story: ${row.title}`, null, `/stories/${row.id}`);
    return hydrate.story(row, u);
  }],
  ["PUT", /^\/api\/stories\/(\d+)$/, ({ me, params, body }) => {
    const row = find(load().stories, +params[0], "Story not found");
    requireOwner(me, row);
    Object.assign(row, pick(body, STORY_FIELDS));
    return hydrate.story(row, me);
  }],
  ["DELETE", /^\/api\/stories\/(\d+)$/, ({ me, params }) => {
    const row = find(load().stories, +params[0], "Story not found");
    requireOwner(me, row);
    row.is_active = false;
  }],
  ["POST", /^\/api\/stories\/(\d+)\/like$/, ({ me, params }) => {
    find(load().stories, +params[0], "Story not found");
    return toggleLike("story", +params[0], requireUser(me));
  }],
  ["POST", /^\/api\/stories\/(\d+)\/image$/, async ({ me, params, form }) => {
    const row = find(load().stories, +params[0], "Story not found");
    requireOwner(me, row);
    [row.image_url] = await readUpload(form);
    return hydrate.story(row, me);
  }],

  // News
  ["GET", /^\/api\/news$/, ({ q }) => {
    const items = load().news
      .filter((n) => n.is_published && matches(n.title, q.get("search")))
      .filter((n) => !q.get("category") || n.category === q.get("category"))
      .filter((n) => !q.get("severity") || n.severity === q.get("severity"))
      .sort(byNewest).map(hydrate.news);
    return paginate(items, q, "articles");
  }],
  ["GET", /^\/api\/news\/admin\/all$/, ({ me, q }) => {
    requireAdmin(me);
    return paginate([...load().news].sort(byNewest).map(hydrate.news), q, "articles", 20);
  }],
  ["GET", /^\/api\/news\/(\d+)$/, ({ me, params }) => {
    const row = find(load().news, +params[0], "Article not found");
    if (!row.is_published && !me?.is_admin) throw new ApiError(404, "Article not found");
    return hydrate.news(row);
  }],
  ["POST", /^\/api\/news$/, ({ me, body }) => {
    const u = requireAdmin(me);
    required(body, ["title", "content"]);
    oneOf(body.severity, ["critical", "normal"], "severity");
    oneOf(body.category, ["announcement", "update", "event", "general"], "category");
    const row: Row = { category: "general", severity: "normal", is_published: true, summary: null, image_url: null, ...pick(body, NEWS_FIELDS), id: nextId(), created_by: u.id, created_at: nowIso(), updated_at: null };
    load().news.push(row);
    if (row.is_published) notify("news", `New News: ${row.title}`, row.summary, `/news/${row.id}`);
    return hydrate.news(row);
  }],
  ["PUT", /^\/api\/news\/(\d+)$/, ({ me, params, body }) => {
    requireAdmin(me);
    const row = find(load().news, +params[0], "Article not found");
    Object.assign(row, pick(body, NEWS_FIELDS), { updated_at: nowIso() });
    return hydrate.news(row);
  }],
  ["DELETE", /^\/api\/news\/(\d+)$/, ({ me, params }) => {
    requireAdmin(me);
    find(load().news, +params[0], "Article not found");
    load().news = load().news.filter((n) => n.id !== +params[0]);
  }],
  ["POST", /^\/api\/news\/(\d+)\/image$/, async ({ me, params, form }) => {
    requireAdmin(me);
    const row = find(load().news, +params[0], "Article not found");
    [row.image_url] = await readUpload(form);
    return hydrate.news(row);
  }],

  // Timeline
  ["GET", /^\/api\/timeline$/, ({ me, q }) => {
    const year = q.get("year");
    const entries = load().timeline
      .filter((t) => !year || t.entry_date.startsWith(year))
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
      .map((t) => hydrate.timeline(t, me));
    return { total: entries.length, entries };
  }],
  ["GET", /^\/api\/timeline\/(\d+)$/, ({ me, params }) => hydrate.timeline(find(load().timeline, +params[0], "Timeline entry not found"), me)],
  ["POST", /^\/api\/timeline$/, ({ me, body }) => {
    const u = requireUser(me);
    required(body, ["title", "content", "entry_date"]);
    const row: Row = { ...pick(body, ["title", "content", "entry_date"]), id: nextId(), photo_url: null, photos: [], created_by: u.id, created_at: nowIso(), updated_at: null };
    load().timeline.push(row);
    return hydrate.timeline(row, u);
  }],
  ["PUT", /^\/api\/timeline\/(\d+)$/, ({ me, params, body }) => {
    requireAdmin(me);
    const row = find(load().timeline, +params[0], "Timeline entry not found");
    Object.assign(row, pick(body, ["title", "content", "entry_date"]), { updated_at: nowIso() });
    return hydrate.timeline(row, me);
  }],
  ["DELETE", /^\/api\/timeline\/(\d+)$/, ({ me, params }) => {
    requireAdmin(me);
    find(load().timeline, +params[0], "Timeline entry not found");
    load().timeline = load().timeline.filter((t) => t.id !== +params[0]);
  }],
  ["POST", /^\/api\/timeline\/(\d+)\/photo$/, async ({ me, params, form }) => {
    requireUser(me);
    const row = find(load().timeline, +params[0], "Timeline entry not found");
    [row.photo_url] = await readUpload(form, { pdf: true });
    return hydrate.timeline(row, me);
  }],
  ["POST", /^\/api\/timeline\/(\d+)\/photos$/, async ({ me, params, form }) => {
    const u = requireUser(me);
    const row = find(load().timeline, +params[0], "Timeline entry not found");
    const urls = await readUpload(form, { pdf: true, field: "files" });
    row.photos.push(...urls.map((url) => ({ id: nextId(), url, uploaded_by: u.id })));
    return hydrate.timeline(row, me);
  }],
  ["DELETE", /^\/api\/timeline\/(\d+)\/photos\/(\d+)$/, ({ me, params }) => {
    const u = requireUser(me);
    const row = find(load().timeline, +params[0], "Timeline entry not found");
    const photo = row.photos.find((p: Row) => p.id === +params[1]);
    if (!photo) throw new ApiError(404, "Photo not found");
    if (photo.uploaded_by !== u.id && !u.is_admin) throw new ApiError(403, "Not authorised");
    row.photos = row.photos.filter((p: Row) => p.id !== +params[1]);
  }],
  ["POST", /^\/api\/timeline\/(\d+)\/like$/, ({ me, params }) => {
    find(load().timeline, +params[0], "Timeline entry not found");
    return toggleLike("timeline", +params[0], requireUser(me));
  }],
  ["GET", /^\/api\/timeline\/(\d+)\/comments$/, ({ params }) =>
    load().comments.filter((c) => c.entry_id === +params[0]).sort((a, b) => a.created_at.localeCompare(b.created_at)).map(hydrate.comment)],
  ["POST", /^\/api\/timeline\/(\d+)\/comments$/, ({ me, params, body }) => {
    const u = requireUser(me);
    find(load().timeline, +params[0], "Timeline entry not found");
    const content = String(body?.content ?? "").trim();
    if (!content || content.length > 1000) throw new ApiError(422, "Comment must be 1–1000 characters");
    const c = { id: nextId(), entry_id: +params[0], user_id: u.id, content, created_at: nowIso() };
    load().comments.push(c);
    return hydrate.comment(c);
  }],
  ["DELETE", /^\/api\/timeline\/(\d+)\/comments\/(\d+)$/, ({ me, params }) => {
    const u = requireUser(me);
    const c = load().comments.find((x) => x.id === +params[1] && x.entry_id === +params[0]);
    if (!c) throw new ApiError(404, "Comment not found");
    if (c.user_id !== u.id && !u.is_admin) throw new ApiError(403, "Not allowed");
    load().comments = load().comments.filter((x) => x.id !== c.id);
  }],

  // Gallery
  ["GET", /^\/api\/gallery$/, () => [...load().gallery].sort(byNewest).map(hydrate.gallery)],
  ["POST", /^\/api\/gallery$/, async ({ me, q, form }) => {
    const u = requireUser(me);
    const [url] = await readUpload(form, { maxMb: 10 });
    const row = { id: nextId(), photo_url: url, caption: q.get("caption") || null, uploaded_by: u.id, created_at: nowIso() };
    load().gallery.push(row);
    return hydrate.gallery(row);
  }],
  ["DELETE", /^\/api\/gallery\/(\d+)$/, ({ me, params }) => {
    const u = requireUser(me);
    const row = find(load().gallery, +params[0], "Photo not found");
    if (row.uploaded_by !== u.id && !u.is_admin) throw new ApiError(403, "Not authorised");
    load().gallery = load().gallery.filter((g) => g.id !== row.id);
  }],

  // Jobs
  ["GET", /^\/api\/jobs$/, ({ q }) => {
    const s = q.get("search");
    const items = load().jobs
      .filter((j) => j.is_active)
      .filter((j) => !q.get("job_type") || j.job_type === q.get("job_type"))
      .filter((j) => matches(j.tags, q.get("tag")))
      .filter((j) => !s || [j.title, j.company, j.location, j.tags].some((v) => matches(v, s)))
      .sort(byNewest).map(hydrate.poster);
    return paginate(items, q, "listings");
  }],
  ["GET", /^\/api\/jobs\/(\d+)$/, ({ params }) => hydrate.poster(find(load().jobs, +params[0], "Job listing not found"))],
  ["POST", /^\/api\/jobs$/, ({ me, body }) => {
    const u = requireUser(me);
    required(body, ["title", "company", "description"]);
    oneOf(body.job_type, ["full-time", "part-time", "contract", "freelance"], "job_type");
    const row: Row = { ...pick(body, JOB_FIELDS), id: nextId(), created_by: u.id, created_at: nowIso(), is_active: true };
    load().jobs.push(row);
    notify("job", `New Job: ${row.title}`, row.company, `/career?id=${row.id}`);
    return hydrate.poster(row);
  }],
  ["PUT", /^\/api\/jobs\/(\d+)$/, ({ me, params, body }) => {
    const row = find(load().jobs, +params[0], "Job listing not found");
    requireOwner(me, row);
    oneOf(body.job_type, ["full-time", "part-time", "contract", "freelance"], "job_type");
    Object.assign(row, pick(body, JOB_FIELDS));
    return hydrate.poster(row);
  }],
  ["DELETE", /^\/api\/jobs\/(\d+)$/, ({ me, params }) => {
    const row = find(load().jobs, +params[0], "Job listing not found");
    requireOwner(me, row);
    row.is_active = false;
  }],

  // Marketplace
  ["GET", /^\/api\/marketplace$/, ({ q }) => {
    const s = q.get("search");
    const items = load().marketplace
      .filter((m) => m.is_active)
      .filter((m) => !q.get("category") || m.category === q.get("category"))
      .filter((m) => matches(m.tags, q.get("tag")))
      .filter((m) => !s || [m.title, m.description, m.tags].some((v) => matches(v, s)))
      .sort(byNewest).map(hydrate.poster);
    return paginate(items, q, "listings");
  }],
  ["GET", /^\/api\/marketplace\/(\d+)$/, ({ params }) => hydrate.poster(find(load().marketplace, +params[0], "Listing not found"))],
  ["POST", /^\/api\/marketplace$/, ({ me, body }) => {
    const u = requireUser(me);
    required(body, ["title", "description", "category"]);
    oneOf(body.category, ["crops", "produce", "business", "services", "goods", "other"], "category");
    const row: Row = { image_url: null, is_negotiable: false, ...pick(body, MARKET_FIELDS), id: nextId(), created_by: u.id, created_at: nowIso(), is_active: true };
    row.price = price(row.price);
    load().marketplace.push(row);
    notify("marketplace", `New Listing: ${row.title}`, row.location, `/marketplace/${row.id}`);
    return hydrate.poster(row);
  }],
  ["PUT", /^\/api\/marketplace\/(\d+)$/, ({ me, params, body }) => {
    const row = find(load().marketplace, +params[0], "Listing not found");
    requireOwner(me, row);
    Object.assign(row, pick(body, MARKET_FIELDS));
    if ("price" in body) row.price = price(body.price);
    return hydrate.poster(row);
  }],
  ["DELETE", /^\/api\/marketplace\/(\d+)$/, ({ me, params }) => {
    const row = find(load().marketplace, +params[0], "Listing not found");
    requireOwner(me, row);
    row.is_active = false;
  }],
  ["POST", /^\/api\/marketplace\/(\d+)\/image$/, async ({ me, params, form }) => {
    const row = find(load().marketplace, +params[0], "Listing not found");
    requireOwner(me, row);
    [row.image_url] = await readUpload(form);
    return hydrate.poster(row);
  }],

  // Transit
  ["GET", /^\/api\/transit$/, ({ q }) => {
    const s = q.get("search");
    const items = load().transit
      .filter((t) => t.is_active)
      .filter((t) => !q.get("transit_type") || t.transit_type === q.get("transit_type"))
      .filter((t) => !s || [t.title, t.from_location, t.to_location].some((v) => matches(v, s)))
      .sort(byNewest).map(hydrate.poster);
    return paginate(items, q, "listings");
  }],
  ["GET", /^\/api\/transit\/(\d+)$/, ({ params }) => hydrate.poster(find(load().transit, +params[0], "Transit listing not found"))],
  ["POST", /^\/api\/transit$/, ({ me, body }) => {
    const u = requireUser(me);
    required(body, ["title", "from_location", "to_location"]);
    oneOf(body.transit_type, ["carpool", "rideshare", "bus", "other"], "transit_type");
    const row: Row = { ...pick(body, TRANSIT_FIELDS), id: nextId(), created_by: u.id, created_at: nowIso(), is_active: true };
    load().transit.push(row);
    return hydrate.poster(row);
  }],
  ["PUT", /^\/api\/transit\/(\d+)$/, ({ me, params, body }) => {
    const row = find(load().transit, +params[0], "Transit listing not found");
    requireOwner(me, row);
    Object.assign(row, pick(body, TRANSIT_FIELDS));
    return hydrate.poster(row);
  }],
  ["DELETE", /^\/api\/transit\/(\d+)$/, ({ me, params }) => {
    const row = find(load().transit, +params[0], "Transit listing not found");
    requireOwner(me, row);
    row.is_active = false;
  }],

  // Notifications
  ["GET", /^\/api\/notifications\/vapid-public-key$/, () => ({ public_key: "" })],
  ["POST", /^\/api\/notifications\/subscribe$/, ({ body }) => {
    const d = load();
    if (!d.subscriptions.includes(body.endpoint)) d.subscriptions.push(body.endpoint);
    return { status: "subscribed" };
  }],
  ["DELETE", /^\/api\/notifications\/subscribe$/, ({ body }) => {
    load().subscriptions = load().subscriptions.filter((e) => e !== body?.endpoint);
    return { status: "unsubscribed" };
  }],
  ["GET", /^\/api\/notifications$/, ({ q }) => paginate([...load().notifications].sort(byNewest), q, "notifications", 20)],
];

export async function mockRequest(method: Method, path: string, opts: RequestOptions, token: string | null): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 120));
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(opts.query ?? {})) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));

  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const match = path.match(pattern);
    if (!match) continue;
    const me = currentUser(token);
    if (token && !me) throw E401();
    const result = await handler({ me, q, body: opts.body ?? {}, form: opts.form, params: match.slice(1) });
    if (method !== "GET") save();
    return result === undefined ? undefined : structuredClone(result);
  }
  throw new ApiError(404, "Not Found");
}
