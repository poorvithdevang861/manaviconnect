export const MOCK_PASSWORD = "Manavi123";
export const MOCK_ADMIN_EMAIL = "poorvith@manavi.in";
export const MOCK_MEMBER_EMAIL = "sneha@example.com";

/** One-click profiles on the sign-in page. Both use MOCK_PASSWORD. */
export const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    name: "Poorvith Devang",
    email: MOCK_ADMIN_EMAIL,
    avatar: null,
    detail: "Publishes news, edits the timeline, manages the spotlight and imports members.",
  },
  {
    role: "Member",
    name: "Sneha Bharadwaj",
    email: MOCK_MEMBER_EMAIL,
    avatar: "https://i.pravatar.cc/160?img=45",
    detail: "A regular alumna with her own stories and marketplace listings.",
  },
] as const;

/** Stand-in Google account used when no Google client ID is configured. */
export const MOCK_GOOGLE_TOKEN = "mock-google";
export const MOCK_GOOGLE_PROFILE = {
  email: "aarav.shetty@gmail.com",
  name: "Aarav Shetty",
  picture: "https://i.pravatar.cc/160?img=68",
};
