import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../lib/admin/auth";
import { getEntry, updateAndPublishEntry } from "../../../../lib/contentful/management";

export const maxDuration = 60;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "PUT") return res.status(405).end();

  const { id } = req.query as { id: string };

  try {
    const existing = await getEntry(id);
    const { sectionHeader, sectionDescription, ctaButtonText, ctaButtonLink, assetId } = req.body;

    const fields: any = {
      ...existing.fields,
      sectionHeader: { "en-US": sectionHeader },
      sectionDescription: { "en-US": sectionDescription },
    };
    if (ctaButtonText !== undefined) fields.ctaButtonText = { "en-US": ctaButtonText };
    if (ctaButtonLink !== undefined) fields.ctaButtonLink = { "en-US": ctaButtonLink };
    if (assetId) {
      fields.sectionImage = { "en-US": { sys: { type: "Link", linkType: "Asset", id: assetId } } };
    }

    console.log("[sections/id] updating", id, "assetId:", assetId);
    await updateAndPublishEntry(id, fields, existing);

    // Let Contentful's CDN propagate the publish before we regenerate the page,
    // otherwise the ISR rebuild reads stale data and the homepage still shows the old image.
    await new Promise((r) => setTimeout(r, 5000));

    const results = await Promise.allSettled([
      res.revalidate("/"),
      res.revalidate("/about"),
      res.revalidate("/booking"),
    ]);
    results.forEach((r, i) => {
      if (r.status === "rejected") console.error("[sections/id] revalidate failed for", ["/", "/about", "/booking"][i], r.reason);
    });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("[sections/id]", err);
    return res.status(500).json({ error: err.message });
  }
}
