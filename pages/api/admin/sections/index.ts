import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../lib/admin/auth";
import { getEntries, getEntry, getAssetUrl } from "../../../../lib/contentful/management";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).end();

  try {
    // Fetch the homepage page entry to get the ordered section list
    const pages = await getEntries({
      content_type: "page",
      "fields.slug": "homepage",
      limit: 1,
    });

    const page = pages.items[0];
    if (!page) return res.status(404).json({ error: "Homepage not found" });

    const sectionRefs: any[] = (page.fields.sections as any)?.["en-US"] ?? [];

    // Fetch each section individually (preserving order)
    const sections = await Promise.all(
      sectionRefs.map(async (ref: any) => {
        const entry = await getEntry(ref.sys.id);
        const coverImageId = (entry.fields.sectionImage as any)?.["en-US"]?.sys?.id ?? null;
        const coverImageUrl = coverImageId ? await getAssetUrl(coverImageId) : null;
        return {
          id: entry.sys.id,
          sectionHeader: (entry.fields.sectionHeader as any)?.["en-US"] ?? "",
          sectionDescription: (entry.fields.sectionDescription as any)?.["en-US"] ?? "",
          sectionType: (entry.fields.sectionType as any)?.["en-US"] ?? "",
          ctaButtonText: (entry.fields.ctaButtonText as any)?.["en-US"] ?? "",
          ctaButtonLink: (entry.fields.ctaButtonLink as any)?.["en-US"] ?? "",
          isTextAboveImage: (entry.fields.isTextAboveImage as any)?.["en-US"] ?? true,
          coverImageId,
          coverImageUrl,
        };
      })
    );

    return res.status(200).json({ sections });
  } catch (err: any) {
    console.error("[sections]", err);
    return res.status(500).json({ error: err.message });
  }
}
