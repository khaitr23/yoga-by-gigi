import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../../../lib/admin/auth";
import { NAV_KEYS, MAX_NAV_LABEL } from "../../../lib/siteSettings";
import {
  getSiteSettingsForAdmin,
  updateSiteSettings,
} from "../../../lib/contentful/management";

export const maxDuration = 60;

// The logo and name appear in the shared layout, so every page needs rebuilding.
const PATHS = ["/", "/about", "/booking", "/blogs", "/retreats"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getSiteSettingsForAdmin());
    }

    if (req.method === "PUT") {
      const { siteName, logoAssetId, navLabels } = req.body;

      if (siteName !== undefined) {
        if (typeof siteName !== "string" || !siteName.trim()) {
          return res.status(400).json({ error: "siteName cannot be empty" });
        }
        if (siteName.length > 60) {
          return res.status(400).json({ error: "siteName must be 60 characters or fewer" });
        }
      }

      if (navLabels !== undefined) {
        if (typeof navLabels !== "object" || navLabels === null) {
          return res.status(400).json({ error: "navLabels must be an object" });
        }
        for (const [key, value] of Object.entries(navLabels)) {
          if (!NAV_KEYS.includes(key)) {
            return res.status(400).json({ error: `unknown nav tab: ${key}` });
          }
          if (typeof value !== "string") {
            return res.status(400).json({ error: `label for ${key} must be text` });
          }
          if (value.length > MAX_NAV_LABEL) {
            return res.status(400).json({
              error: `label for ${key} must be ${MAX_NAV_LABEL} characters or fewer`,
            });
          }
        }
      }

      console.log("[settings] updating", { siteName, logoAssetId, navLabels });
      await updateSiteSettings({
        siteName: siteName?.trim(),
        logoAssetId,
        navLabels,
      });

      await new Promise((r) => setTimeout(r, 5000));
      const results = await Promise.allSettled(PATHS.map((p) => res.revalidate(p)));
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error("[settings] revalidate failed for", PATHS[i], r.reason);
        }
      });

      return res.status(200).json(await getSiteSettingsForAdmin());
    }

    return res.status(405).end();
  } catch (err: any) {
    console.error("[settings]", err);
    return res.status(500).json({ error: err.message });
  }
}
