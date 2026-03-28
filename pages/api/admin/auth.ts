import type { NextApiRequest, NextApiResponse } from "next";
import { createSessionToken, verifySessionToken, COOKIE_NAME } from "../../../lib/admin/auth";

const COOKIE_OPTS = `HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { password } = req.body ?? {};
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Incorrect password." });
    }
    const token = createSessionToken();
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; ${COOKIE_OPTS}`);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    const token = req.cookies[COOKIE_NAME];
    return res.status(200).json({ authenticated: verifySessionToken(token) });
  }

  res.status(405).end();
}
