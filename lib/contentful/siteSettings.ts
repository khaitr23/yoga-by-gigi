import { client, previewClient } from "./client";
import {
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
  sanitizeNavLabels,
} from "../siteSettings";

/** Contentful content type holding the single site-wide settings entry. */
export const SITE_SETTINGS_TYPE = "siteSettings";

function absoluteUrl(url?: string | null) {
  if (!url) return null;
  return url.startsWith("//") ? `https:${url}` : url;
}

/**
 * Reads the site settings entry.
 *
 * The content type is created on demand by the admin panel, so a space that
 * has never saved settings answers with an "unknown content type" error —
 * that's expected, and we fall back to the built-in defaults rather than
 * failing the page build.
 */
export async function getSiteSettings(preview = false): Promise<SiteSettings> {
  const cfClient = preview ? previewClient : client;
  try {
    const res = await cfClient.getEntries({
      content_type: SITE_SETTINGS_TYPE,
      limit: 1,
      include: 1,
    });
    const fields: any = res?.items?.[0]?.fields;
    if (!fields) return DEFAULT_SITE_SETTINGS;
    return {
      siteName: fields.siteName || DEFAULT_SITE_NAME,
      logoUrl: absoluteUrl(fields.logo?.fields?.file?.url),
      navLabels: sanitizeNavLabels(fields.navLabels),
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
