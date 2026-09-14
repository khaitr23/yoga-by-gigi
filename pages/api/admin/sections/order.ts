import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../lib/admin/auth";
import { getEntries, updateAndPublishEntry } from "../../../../lib/contentful/management";

export const maxDuration = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "PUT") return res.status(405).end();

  const { ids } = req.body as { ids: string[] };
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: "ids array is required" });
  }

  try {
    const pages = await getEntries({ content_type: "page", "fields.slug": "homepage", limit: 1 });
    const page = pages.items[0];
    if (!page) return res.status(404).json({ error: "Homepage not found" });

    const existingRefs: any[] = (page.fields.sections as any)?.["en-US"] ?? [];
    const byId = new Map(existingRefs.map((r: any) => [r.sys.id, r]));

    // Reorder using the given ids, then append any sections the client didn't include
    // (defensive — should be the same set).
    const reordered = ids
      .map((id) => byId.get(id))
      .filter(Boolean);
    const missing = existingRefs.filter((r: any) => !ids.includes(r.sys.id));
    const finalOrder = [...reordered, ...missing];

    await updateAndPublishEntry(
      page.sys.id,
      { ...page.fields, sections: { "en-US": finalOrder } },
      page
    );

    await new Promise((r) => setTimeout(r, 5000));
    await Promise.allSettled([
      res.revalidate("/"),
      res.revalidate("/about"),
      res.revalidate("/booking"),
    ]);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("[sections/order]", err);
    return res.status(500).json({ error: err.message });
  }
}
