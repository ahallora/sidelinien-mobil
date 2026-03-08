import type { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password:
    process.env.SECRET_COOKIE_PASSWORD ||
    "complex_password_at_least_32_characters_long",
  cookieName: "sidelinien_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export interface SessionData {
  siteAccess?: boolean;
  securitytoken?: string;
  bb_sessionhash?: string | null;
  bb_userid?: string | null;
  bb_password?: string | null;
}
