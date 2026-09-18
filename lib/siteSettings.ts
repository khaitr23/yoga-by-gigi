/**
 * Client-safe site settings vocabulary.
 *
 * Kept separate from lib/contentful/siteSettings.ts on purpose: that module
 * constructs the Contentful delivery client at import time, so pulling it into
 * a component would bundle it (and a missing access token) into the browser.
 * Components import from here; only getStaticProps imports the fetcher.
 */

/** Used until Gigi saves her own, and whenever Contentful can't be reached. */
export const DEFAULT_SITE_NAME = "yoga by gigi";

export interface SiteSettings {
  siteName: string;
  /** Absolute https URL of the uploaded logo, or null to use the bundled one. */
  logoUrl: string | null;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: DEFAULT_SITE_NAME,
  logoUrl: null,
};
