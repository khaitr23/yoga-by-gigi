import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../lib/admin/auth";
import {
  getEntry,
  updateAndPublishEntry,
  unpublishEntry,
  deleteEntry,
  getAssetUrl,
} from "../../../../lib/contentful/management";
import { markdownToRichText, richTextToMarkdown } from "../../../../lib/contentful/richtext";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query as { id: string };

  try {
    if (req.method === "GET") {
      const entry = await getEntry(id);
      const coverImageId = (entry.fields.coverImage as any)?.["en-US"]?.sys?.id ?? null;
      const coverImageUrl = coverImageId ? await getAssetUrl(coverImageId) : null;
      return res.status(200).json({
        id: entry.sys.id,
        title: (entry.fields.title as any)?.["en-US"] ?? "",
        slug: (entry.fields.slug as any)?.["en-US"] ?? "",
        date: (entry.fields.date as any)?.["en-US"] ?? "",
        summary: (entry.fields.summary as any)?.["en-US"] ?? "",
        contentMarkdown: richTextToMarkdown((entry.fields.content as any)?.["en-US"]),
        coverImageId,
        coverImageUrl,
        authorId: (entry.fields.author as any)?.["en-US"]?.sys?.id ?? null,
      });
    }

    if (req.method === "PUT") {
      const { title, slug, date, summary, content, assetId } = req.body;
      const existing = await getEntry(id);
      const fields: any = {
        ...existing.fields,
        title: { "en-US": title },
        slug: { "en-US": slug },
        date: { "en-US": date },
        summary: { "en-US": summary },
        content: { "en-US": markdownToRichText(content ?? "") },
      };
      if (assetId) {
        fields.coverImage = { "en-US": { sys: { type: "Link", linkType: "Asset", id: assetId } } };
      }
      await updateAndPublishEntry(id, fields);
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      try { await unpublishEntry(id); } catch {}
      await deleteEntry(id);
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (err: any) {
    console.error("[posts/id]", err);
    return res.status(500).json({ error: err.message });
  }
}
