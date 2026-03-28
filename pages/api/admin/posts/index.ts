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
        content_type: "post",
        order: ["-fields.date"],
        limit: 200,
      });

      const posts = result.items.map((e: any) => ({
        id: e.sys.id,
        title: e.fields.title?.["en-US"] ?? "",
        slug: e.fields.slug?.["en-US"] ?? "",
        date: e.fields.date?.["en-US"] ?? "",
        summary: e.fields.summary?.["en-US"] ?? "",
        contentMarkdown: richTextToMarkdown(e.fields.content?.["en-US"]),
        coverImageId: e.fields.coverImage?.["en-US"]?.sys?.id ?? null,
        coverImageUrl: null, // resolved client-side if needed
        authorId: e.fields.author?.["en-US"]?.sys?.id ?? null,
        published: !!e.sys.publishedAt,
      }));

      return res.status(200).json({ posts });
    }

    if (req.method === "POST") {
      const { title, slug, date, summary, content, authorId, assetId } = req.body;
      const fields: any = {
        title: { "en-US": title },
        slug: { "en-US": slug },
        date: { "en-US": date },
        summary: { "en-US": summary },
        content: { "en-US": markdownToRichText(content ?? "") },
        author: { "en-US": { sys: { type: "Link", linkType: "Entry", id: authorId } } },
      };
      if (assetId) {
        fields.coverImage = { "en-US": { sys: { type: "Link", linkType: "Asset", id: assetId } } };
      }
      const entry = await createEntry("post", fields);
      const published = await publishEntry(entry);
      return res.status(201).json({ id: published.sys.id });
    }

    res.status(405).end();
  } catch (err: any) {
    console.error("[posts]", err);
    return res.status(500).json({ error: err.message });
  }
}
