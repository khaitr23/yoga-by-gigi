import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../../lib/admin/auth";
import {
  getEntries,
  createEntry,
  publishEntry,
} from "../../../../lib/contentful/management";
import { markdownToRichText, richTextToMarkdown } from "../../../../lib/contentful/richtext";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const result = await getEntries({
        content_type: "retreat",
        order: ["-fields.startDate"],
        limit: 200,
      });

      const retreats = result.items.map((e: any) => ({
        id: e.sys.id,
        title: e.fields.title?.["en-US"] ?? "",
        slug: e.fields.slug?.["en-US"] ?? "",
        startDate: e.fields.startDate?.["en-US"] ?? "",
        endDate: e.fields.endDate?.["en-US"] ?? "",
        summary: e.fields.summary?.["en-US"] ?? "",
        contentMarkdown: richTextToMarkdown(e.fields.content?.["en-US"]),
        coverImageId: e.fields.coverImage?.["en-US"]?.sys?.id ?? null,
        authorId: e.fields.author?.["en-US"]?.sys?.id ?? null,
        published: !!e.sys.publishedAt,
      }));

      return res.status(200).json({ retreats });
    }

    if (req.method === "POST") {
      const { title, slug, startDate, endDate, summary, content, authorId, assetId } = req.body;
      const fields: any = {
        title: { "en-US": title },
        slug: { "en-US": slug },
        startDate: { "en-US": startDate },
        endDate: { "en-US": endDate },
        summary: { "en-US": summary },
        content: { "en-US": markdownToRichText(content ?? "") },
        author: { "en-US": { sys: { type: "Link", linkType: "Entry", id: authorId } } },
      };
      if (assetId) {
        fields.coverImage = { "en-US": { sys: { type: "Link", linkType: "Asset", id: assetId } } };
      }
      const entry = await createEntry("retreat", fields);
      const published = await publishEntry(entry);
      return res.status(201).json({ id: published.sys.id });
    }

    res.status(405).end();
  } catch (err: any) {
    console.error("[retreats]", err);
    return res.status(500).json({ error: err.message });
  }
}
