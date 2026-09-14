import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../../lib/admin/auth";
import { getEntry, publishEntry, unpublishEntry } from "../../../../../lib/contentful/management";

export const maxDuration = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.query as { id: string };
  const { visible } = req.body as { visible: boolean };

  try {
    if (visible) {
      const entry = await getEntry(id);
      await publishEntry(entry);
    } else {
      await unpublishEntry(id);
    }

    await new Promise((r) => setTimeout(r, 5000));
    await Promise.allSettled([
      res.revalidate("/"),
      res.revalidate("/about"),
      res.revalidate("/booking"),
    ]);
    return res.status(200).json({ ok: true, visible });
  } catch (err: any) {
    console.error("[sections/id/visibility]", err);
    return res.status(500).json({ error: err.message });
  }
}
