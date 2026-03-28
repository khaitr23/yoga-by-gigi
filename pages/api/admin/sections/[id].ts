import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../lib/admin/auth";
import { getEntry, updateAndPublishEntry } from "../../../../lib/contentful/management";

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

    await updateAndPublishEntry(id, fields);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("[sections/id]", err);
    return res.status(500).json({ error: err.message });
  }
}
