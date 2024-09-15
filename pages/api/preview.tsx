import { NextApiRequest, NextApiResponse } from "next";
import { previewClient } from "../../lib/contentful/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, slug, content_type } = req.query;
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return res
      .status(401)
      .json({ message: "Invalid token, secrets don't match!" });
  }
  if (!slug) {
    return res
      .status(401)
      .json({ message: "Invalid token, slug is undefined!" });
  }

  if (!content_type) {
    return res
      .status(401)
      .json({ message: "Invalid token, content_type is undefined!" });
  }

  const response = await previewClient.getEntries({
    content_type,
    "fields.slug": slug,
  });

  const entry = response?.items?.[0];
  if (!entry) {
    return res.status(401).json({ message: "Invalid slug" });
  }

  res.setPreviewData({});
  let url;
  if (content_type === "post") {
    url = `/blogs/${entry.fields.slug}`; //Blog
  } else if (content_type === "retreat") {
    url = `/retreats/${entry.fields.slug}`; //Retreats
  } else if (content_type === "page" && slug === "homepage") {
    url = `/`; //homepage (Custom Page)
  } else {
    url = `/${entry.fields.slug}`; //Custom Page
  }
  res.writeHead(307, { Location: url });
  res.end();
}
