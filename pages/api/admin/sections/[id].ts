import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../lib/admin/auth";
import {
  getEntry,
  getEntries,
  updateAndPublishEntry,
  unpublishEntry,
  deleteEntry,
} from "../../../../lib/contentful/management";

export const maxDuration = 60;

async function revalidateAll(res: NextApiResponse) {
  await new Promise((r) => setTimeout(r, 5000));
  const results = await Promise.allSettled([
    res.revalidate("/"),
    res.revalidate("/about"),
    res.revalidate("/booking"),
  ]);
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error("[sections/id] revalidate failed for", ["/", "/about", "/booking"][i], r.reason);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query as { id: string };

  try {
    if (req.method === "PUT") {
      const existing = await getEntry(id);
      const {
        sectionHeader,
        sectionDescription,
        ctaButtonText,
        ctaButtonLink,
        assetId,
        additionalImageIds,
      } = req.body;

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
      if (Array.isArray(additionalImageIds)) {
        fields.additionalImages = {
          "en-US": additionalImageIds.map((aid: string) => ({
            sys: { type: "Link", linkType: "Asset", id: aid },
          })),
        };
      }

      console.log("[sections/id] updating", id, "assetId:", assetId, "extras:", additionalImageIds?.length);
      await updateAndPublishEntry(id, fields, existing);
      await revalidateAll(res);
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      // Unlink from the homepage page entry, then unpublish + delete the section entry.
      const pages = await getEntries({ content_type: "page", "fields.slug": "homepage", limit: 1 });
      const page = pages.items[0];
      if (page) {
        const refs: any[] = (page.fields.sections as any)?.["en-US"] ?? [];
        const filtered = refs.filter((r: any) => r.sys.id !== id);
        if (filtered.length !== refs.length) {
          await updateAndPublishEntry(
            page.sys.id,
            { ...page.fields, sections: { "en-US": filtered } },
            page
          );
        }
      }
      try { await unpublishEntry(id); } catch {}
      try { await deleteEntry(id); } catch (e) {
        console.error("[sections/id] delete failed", e);
      }
      await revalidateAll(res);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).end();
  } catch (err: any) {
    console.error("[sections/id]", err);
    return res.status(500).json({ error: err.message });
  }
}
