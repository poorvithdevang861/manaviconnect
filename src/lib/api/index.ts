import { request, fileForm, type RequestOptions } from "./client";
import type {
  AppNotification,
  AuthResponse,
  BulkUploadResult,
  EventInput,
  EventItem,
  GalleryPhoto,
  HealthStatus,
  Invite,
  InviteValidation,
  Job,
  JobInput,
  JobType,
  LikeResult,
  MarketCategory,
  MarketInput,
  MarketListing,
  MessageResult,
  NewsArticle,
  NewsCategory,
  NewsInput,
  NewsSeverity,
  PageQuery,
  Paginated,
  PushSubscriptionInput,
  SignupInput,
  SpotlightSlide,
  Story,
  StoryInput,
  TimelineComment,
  TimelineEntry,
  TimelineInput,
  TransitInput,
  TransitListing,
  TransitType,
  User,
  UserUpdate,
} from "./types";

export * from "./types";
export { ApiError, mediaUrl, USE_MOCK } from "./client";

const get = <T>(path: string, query?: object) => request<T>("GET", path, { query: query as RequestOptions["query"] });
const post = <T>(path: string, body?: unknown) => request<T>("POST", path, { body });
const put = <T>(path: string, body?: unknown) => request<T>("PUT", path, { body });
const del = (path: string, body?: unknown) => request<void>("DELETE", path, { body });
const upload = <T>(path: string, file: File) => request<T>("POST", path, { form: fileForm(file) });

export const api = {
  health: () => get<HealthStatus>("/health"),

  auth: {
    signup: (input: SignupInput) => post<AuthResponse>("/api/auth/signup", input),
    login: (email: string, password: string) => post<AuthResponse>("/api/auth/login", { email, password }),
    google: (id_token: string) => post<AuthResponse>("/api/auth/google", { id_token }),
    forgotPassword: (email: string) => post<MessageResult>("/api/auth/forgot-password", { email }),
    resetPassword: (token: string, new_password: string) =>
      post<MessageResult>("/api/auth/reset-password", { token, new_password }),
    bulkTemplate: () => request<Blob>("GET", "/api/auth/bulk-template", { blob: true }),
    bulkUpload: (file: File) => upload<BulkUploadResult>("/api/auth/bulk-upload", file),
  },

  users: {
    me: () => get<User>("/api/users/me"),
    updateMe: (input: UserUpdate) => put<User>("/api/users/me", input),
    myEvents: () => get<EventItem[]>("/api/users/me/events"),
    myStories: () => get<Story[]>("/api/users/me/stories"),
    uploadAvatar: (file: File) => upload<User>("/api/users/me/avatar", file),
  },

  spotlight: {
    list: () => get<SpotlightSlide[]>("/api/users/spotlight"),
    replace: (slides: SpotlightSlide[]) => put<SpotlightSlide[]>("/api/users/spotlight", slides),
    upload: (file: File) => upload<{ image_url: string }>("/api/users/spotlight/upload", file),
  },

  invites: {
    send: (email: string) => post<Invite>("/api/invites", { email }),
    validate: (token: string) => get<InviteValidation>(`/api/invites/validate/${encodeURIComponent(token)}`),
    accept: (token: string) => post<{ accepted: boolean }>(`/api/invites/accept/${encodeURIComponent(token)}`),
  },

  events: {
    list: (q: PageQuery & { type?: "upcoming" | "past"; search?: string } = {}) =>
      get<Paginated<"events", EventItem>>("/api/events", q),
    get: (id: number) => get<EventItem>(`/api/events/${id}`),
    create: (input: EventInput) => post<EventItem>("/api/events", input),
    update: (id: number, input: Partial<EventInput>) => put<EventItem>(`/api/events/${id}`, input),
    remove: (id: number) => del(`/api/events/${id}`),
    like: (id: number) => post<LikeResult>(`/api/events/${id}/like`),
    uploadBanner: (id: number, file: File) => upload<EventItem>(`/api/events/${id}/banner`, file),
  },

  stories: {
    list: (q: PageQuery & { search?: string } = {}) => get<Paginated<"stories", Story>>("/api/stories", q),
    get: (id: number) => get<Story>(`/api/stories/${id}`),
    create: (input: StoryInput) => post<Story>("/api/stories", input),
    update: (id: number, input: Partial<StoryInput>) => put<Story>(`/api/stories/${id}`, input),
    remove: (id: number) => del(`/api/stories/${id}`),
    like: (id: number) => post<LikeResult>(`/api/stories/${id}/like`),
    uploadImage: (id: number, file: File) => upload<Story>(`/api/stories/${id}/image`, file),
  },

  news: {
    list: (q: PageQuery & { category?: NewsCategory; severity?: NewsSeverity; search?: string } = {}) =>
      get<Paginated<"articles", NewsArticle>>("/api/news", q),
    listAll: (q: PageQuery = {}) => get<Paginated<"articles", NewsArticle>>("/api/news/admin/all", q),
    get: (id: number) => get<NewsArticle>(`/api/news/${id}`),
    create: (input: NewsInput) => post<NewsArticle>("/api/news", input),
    update: (id: number, input: Partial<NewsInput>) => put<NewsArticle>(`/api/news/${id}`, input),
    remove: (id: number) => del(`/api/news/${id}`),
    uploadImage: (id: number, file: File) => upload<NewsArticle>(`/api/news/${id}/image`, file),
  },

  timeline: {
    list: (q: { year?: number } = {}) => get<{ total: number; entries: TimelineEntry[] }>("/api/timeline", q),
    get: (id: number) => get<TimelineEntry>(`/api/timeline/${id}`),
    create: (input: TimelineInput) => post<TimelineEntry>("/api/timeline", input),
    update: (id: number, input: Partial<TimelineInput>) => put<TimelineEntry>(`/api/timeline/${id}`, input),
    remove: (id: number) => del(`/api/timeline/${id}`),
    setPhoto: (id: number, file: File) => upload<TimelineEntry>(`/api/timeline/${id}/photo`, file),
    addPhotos: (id: number, files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      return request<TimelineEntry>("POST", `/api/timeline/${id}/photos`, { form });
    },
    removePhoto: (id: number, photoId: number) => del(`/api/timeline/${id}/photos/${photoId}`),
    like: (id: number) => post<LikeResult>(`/api/timeline/${id}/like`),
    comments: (id: number) => get<TimelineComment[]>(`/api/timeline/${id}/comments`),
    addComment: (id: number, content: string) => post<TimelineComment>(`/api/timeline/${id}/comments`, { content }),
    removeComment: (id: number, commentId: number) => del(`/api/timeline/${id}/comments/${commentId}`),
  },

  gallery: {
    list: () => get<GalleryPhoto[]>("/api/gallery"),
    upload: (file: File, caption?: string) =>
      request<GalleryPhoto>("POST", "/api/gallery", { form: fileForm(file), query: { caption } }),
    remove: (id: number) => del(`/api/gallery/${id}`),
  },

  jobs: {
    list: (q: PageQuery & { job_type?: JobType; tag?: string; search?: string } = {}) =>
      get<Paginated<"listings", Job>>("/api/jobs", q),
    get: (id: number) => get<Job>(`/api/jobs/${id}`),
    create: (input: JobInput) => post<Job>("/api/jobs", input),
    update: (id: number, input: Partial<JobInput>) => put<Job>(`/api/jobs/${id}`, input),
    remove: (id: number) => del(`/api/jobs/${id}`),
  },

  marketplace: {
    list: (q: PageQuery & { category?: MarketCategory; tag?: string; search?: string } = {}) =>
      get<Paginated<"listings", MarketListing>>("/api/marketplace", q),
    get: (id: number) => get<MarketListing>(`/api/marketplace/${id}`),
    create: (input: MarketInput) => post<MarketListing>("/api/marketplace", input),
    update: (id: number, input: Partial<MarketInput>) => put<MarketListing>(`/api/marketplace/${id}`, input),
    remove: (id: number) => del(`/api/marketplace/${id}`),
    uploadImage: (id: number, file: File) => upload<MarketListing>(`/api/marketplace/${id}/image`, file),
  },

  transit: {
    list: (q: PageQuery & { transit_type?: TransitType; search?: string } = {}) =>
      get<Paginated<"listings", TransitListing>>("/api/transit", q),
    get: (id: number) => get<TransitListing>(`/api/transit/${id}`),
    create: (input: TransitInput) => post<TransitListing>("/api/transit", input),
    update: (id: number, input: Partial<TransitInput>) => put<TransitListing>(`/api/transit/${id}`, input),
    remove: (id: number) => del(`/api/transit/${id}`),
  },

  notifications: {
    vapidKey: () => get<{ public_key: string }>("/api/notifications/vapid-public-key"),
    subscribe: (sub: PushSubscriptionInput) => post<{ status: string }>("/api/notifications/subscribe", sub),
    unsubscribe: (endpoint: string) => del("/api/notifications/subscribe", { endpoint }),
    list: (q: PageQuery = {}) =>
      get<{ total: number; page: number; limit: number; notifications: AppNotification[] }>("/api/notifications", q),
  },
};
