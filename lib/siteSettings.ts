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

/**
 * The navigation tabs. Routes are fixed in code — only the labels are editable,
 * so renaming a tab can't break where it points. `key` is what a custom label is
 * stored under, kept stable and separate from the href.
 */
export const NAV_ITEMS = [
  { key: "home", href: "/", label: "My Yoga Journey" },
  { key: "retreats", href: "/retreats", label: "Retreats" },
  { key: "blog", href: "/blogs", label: "Blog" },
  { key: "booking", href: "/booking", label: "Booking" },
  { key: "shop", href: "#", label: "Shop" },
];

export const NAV_KEYS = NAV_ITEMS.map((i) => i.key);

/** Longest a tab label may be — the desktop nav is a single row. */
export const MAX_NAV_LABEL = 30;

/** Custom labels by nav key. A missing or blank entry means "use the default". */
export type NavLabels = Record<string, string>;

export interface SiteSettings {
  siteName: string;
  /** Absolute https URL of the uploaded logo, or null to use the bundled one. */
  logoUrl: string | null;
  navLabels: NavLabels;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: DEFAULT_SITE_NAME,
  logoUrl: null,
  navLabels: {},
};

/** The nav as rendered: stored labels where set, built-in labels otherwise. */
export function resolveNavItems(navLabels: NavLabels = {}) {
  return NAV_ITEMS.map(({ key, href, label }) => ({
    key,
    href,
    label: navLabels[key]?.trim() || label,
  }));
}

/** Keep only known keys holding non-empty strings, trimmed and length-capped. */
export function sanitizeNavLabels(input: any): NavLabels {
  if (!input || typeof input !== "object") return {};
  const out: NavLabels = {};
  for (const key of NAV_KEYS) {
    const value = input[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim().slice(0, MAX_NAV_LABEL);
    if (trimmed) out[key] = trimmed;
  }
  return out;
}
