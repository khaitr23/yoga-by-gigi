import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../lib/admin/auth";
import {
  getEntries,
  getEntry,
  getAssetUrl,
  createEntry,
  publishEntry,
  updateAndPublishEntry,
  ensureSectionFields,
} from "../../../../lib/contentful/management";

export const maxDuration = 60;

async function getHomepagePage() {
  const pages = await getEntries({
    content_type: "page",
    "fields.slug": "homepage",
    limit: 1,
  });
  return pages.items[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const page = await getHomepagePage();
      if (!page) return res.status(404).json({ error: "Homepage not found" });

      const sectionRefs: any[] = (page.fields.sections as any)?.["en-US"] ?? [];

      // Make sure our extra fields exist on the section content type before we read/write them.
      if (sectionRefs.length) {
        const first = await getEntry(sectionRefs[0].sys.id);
        await ensureSectionFields(first.sys.contentType.sys.id);
      }

      const sections = await Promise.all(
        sectionRefs.map(async (ref: any) => {
          const entry = await getEntry(ref.sys.id);
          const coverImageId = (entry.fields.sectionImage as any)?.["en-US"]?.sys?.id ?? null;
          const coverImageUrl = coverImageId ? await getAssetUrl(coverImageId) : null;

          const additionalRefs: any[] = (entry.fields.additionalImages as any)?.["en-US"] ?? [];
          const additionalImages = await Promise.all(
            additionalRefs.map(async (r: any) => {
              const id = r.sys.id;
              const url = await getAssetUrl(id);
              return { id, url };
            })
          );

          return {
            id: entry.sys.id,
            sectionHeader: (entry.fields.sectionHeader as any)?.["en-US"] ?? "",
            sectionDescription: (entry.fields.sectionDescription as any)?.["en-US"] ?? "",
            sectionType: (entry.fields.sectionType as any)?.["en-US"] ?? "",
            ctaButtonText: (entry.fields.ctaButtonText as any)?.["en-US"] ?? "",
            ctaButtonLink: (entry.fields.ctaButtonLink as any)?.["en-US"] ?? "",
            isTextAboveImage: (entry.fields.isTextAboveImage as any)?.["en-US"] ?? true,
            imagePosition: (entry.fields.imagePosition as any)?.["en-US"] ?? "auto",
            coverImageId,
            coverImageUrl,
            additionalImages: additionalImages.filter((a) => a.url),
            published: !!entry.sys.publishedAt && !(entry.sys as any).archivedAt,
          };
        })
      );

      return res.status(200).json({ sections });
    }

    if (req.method === "POST") {
      const { sectionType, sectionHeader = "", sectionDescription = "" } = req.body;
      if (!sectionType) return res.status(400).json({ error: "sectionType is required" });

      const page = await getHomepagePage();
      if (!page) return res.status(404).json({ error: "Homepage not found" });

      // Detect the section content type ID from an existing linked section so we don't hardcode it.
      const existingRefs: any[] = (page.fields.sections as any)?.["en-US"] ?? [];
      if (!existingRefs.length) {
        return res.status(400).json({ error: "Cannot detect section content type: no existing sections to reference" });
      }
      const firstSection = await getEntry(existingRefs[0].sys.id);
      const sectionContentTypeId = firstSection.sys.contentType.sys.id;

      // Create + publish the new section
      const newEntry = await createEntry(sectionContentTypeId, {
        sectionType: { "en-US": sectionType },
        sectionHeader: { "en-US": sectionHeader },
        sectionDescription: { "en-US": sectionDescription },
        isTextAboveImage: { "en-US": true },
      });
      const publishedNew = await publishEntry(newEntry);

      // Append the new section to the page's ordered sections list
      const newRef = { sys: { type: "Link", linkType: "Entry", id: publishedNew.sys.id } };
      const updatedRefs = [...existingRefs, newRef];
      await updateAndPublishEntry(
        page.sys.id,
        { ...page.fields, sections: { "en-US": updatedRefs } },
        page
      );

      await new Promise((r) => setTimeout(r, 5000));
      await Promise.allSettled([
        res.revalidate("/"),
        res.revalidate("/about"),
        res.revalidate("/booking"),
      ]);

      return res.status(201).json({ id: publishedNew.sys.id });
    }

    return res.status(405).end();
  } catch (err: any) {
    console.error("[sections]", err);
    return res.status(500).json({ error: err.message });
  }
}
