import { createHmac } from "crypto";
import type { NextApiRequest } from "next";
import type { GetServerSidePropsContext } from "next";

export const COOKIE_NAME = "gigi_studio_session";
const PAYLOAD = "gigi-admin";

function secret() {
  return process.env.ADMIN_SECRET || "yoga-studio-fallback";
}

export function createSessionToken(): string {
  const sig = createHmac("sha256", secret()).update(PAYLOAD).digest("hex");
  return `${PAYLOAD}.${sig}`;
}

export function verifySessionToken(token?: string): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (payload !== PAYLOAD) return false;
  const expected = createHmac("sha256", secret())
    .update(PAYLOAD)
    .digest("hex");
  return sig === expected;
}

export function isAuthenticated(req: NextApiRequest): boolean {
  return verifySessionToken(req.cookies[COOKIE_NAME]);
}

/** Use in getServerSideProps — redirects to login if not authed. */
export function requireAdminSession(ctx: GetServerSidePropsContext) {
  const token = ctx.req.cookies[COOKIE_NAME];
  if (!verifySessionToken(token)) {
    return {
      redirect: { destination: "/admin/login", permanent: false },
    };
  }
  return null;
}
