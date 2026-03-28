import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../lib/admin/auth";
import { uploadAsset } from "../../../lib/contentful/management";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { base64, fileName, contentType } = req.body;
    if (!base64 || !fileName || !contentType) {
      return res.status(400).json({ error: "base64, fileName, contentType required" });
    }

    // Strip "data:...;base64," prefix if present
    const raw = base64.includes(",") ? base64.split(",")[1] : base64;
    const buffer = Buffer.from(raw, "base64");

    const { id, url } = await uploadAsset(buffer, fileName, contentType);
    return res.status(200).json({ id, url });
  } catch (err: any) {
    console.error("[assets]", err);
    return res.status(500).json({ error: err.message ?? "Upload failed" });
  }
}
