import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../lib/admin/auth";
import { getEntries } from "../../../lib/contentful/management";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).end();

  try {
    const result = await getEntries({ content_type: "author", limit: 50 });
    const authors = result.items.map((a: any) => ({
      id: a.sys.id,
      name: (a.fields.name as any)?.["en-US"] ?? "",
    }));
    return res.status(200).json({ authors });
  } catch (err: any) {
    console.error("[authors]", err);
    return res.status(500).json({ error: err.message });
  }
}
