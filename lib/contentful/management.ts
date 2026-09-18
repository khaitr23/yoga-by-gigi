import { createClient } from "contentful-management";
import { IMAGE_POSITIONS, TEXT_ALIGNMENTS } from "../sections";
import { sanitizeNavLabels } from "../siteSettings";

function getClient() {
  return createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!,
  });
}

function spaceEnv() {
  return {
    spaceId: process.env.CONTENTFUL_SPACE_ID!,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID || "master",
  };
}

// ── Entry helpers ────────────────────────────────────────────────

export async function getEntries(query: Record<string, any>) {
  const c = getClient();
  return c.entry.getMany({ ...spaceEnv(), query });
}

export async function getEntry(entryId: string) {
  const c = getClient();
  return c.entry.get({ ...spaceEnv(), entryId });
}

export async function createEntry(contentTypeId: string, fields: Record<string, any>) {
  const c = getClient();
  return c.entry.create({ ...spaceEnv(), contentTypeId }, { fields });
}

export async function updateAndPublishEntry(
  entryId: string,
  fields: Record<string, any>,
  existing?: any
) {
  const c = getClient();
  const base = existing ?? (await c.entry.get({ ...spaceEnv(), entryId }));
  const updated = await c.entry.update(
    { ...spaceEnv(), entryId },
    { ...base, fields }
  );
  return c.entry.publish({ ...spaceEnv(), entryId }, updated);
}

export async function publishEntry(entry: any) {
  const c = getClient();
  return c.entry.publish({ ...spaceEnv(), entryId: entry.sys.id }, entry);
}

export async function unpublishEntry(entryId: string) {
  const c = getClient();
  const entry = await c.entry.get({ ...spaceEnv(), entryId });
  return c.entry.unpublish({ ...spaceEnv(), entryId }, entry);
}

export async function deleteEntry(entryId: string) {
  const c = getClient();
  return c.entry.delete({ ...spaceEnv(), entryId });
}

// ── Content type helpers ─────────────────────────────────────────


// Fields this app adds to the section content type on top of whatever Contentful started with.
const SECTION_FIELDS = [
  {
    id: "additionalImages",
    name: "Additional Images",
    type: "Array",
    required: false,
    localized: false,
    items: { type: "Link", linkType: "Asset", validations: [] },
  },
  {
    id: "imagePosition",
    name: "Image Position",
    type: "Symbol",
    required: false,
    localized: false,
    validations: [{ in: IMAGE_POSITIONS }],
  },
  {
    id: "textAlign",
    name: "Text Alignment",
    type: "Symbol",
    required: false,
    localized: false,
    validations: [{ in: TEXT_ALIGNMENTS }],
  },
];

// Cached per Node process so we don't hit the CMA on every request once the fields exist.
let sectionSchemaEnsured = false;

/**
 * Ensures the section content type has every field in SECTION_FIELDS.
 * Idempotent — safe to call on every request; it's a no-op after the first success.
 */
export async function ensureSectionFields(contentTypeId: string) {
  if (sectionSchemaEnsured) return;
  const c = getClient();
  try {
    const ct = await c.contentType.get({ ...spaceEnv(), contentTypeId });
    const missing = SECTION_FIELDS.filter(
      (f) => !ct.fields.some((existing: any) => existing.id === f.id)
    );
    if (!missing.length) {
      sectionSchemaEnsured = true;
      return;
    }
    const updated = await c.contentType.update(
      { ...spaceEnv(), contentTypeId },
      { ...ct, fields: [...ct.fields, ...missing] }
    );
    await c.contentType.publish({ ...spaceEnv(), contentTypeId }, updated);
    sectionSchemaEnsured = true;
    console.log(
      "[ensureSectionFields] added",
      missing.map((f) => f.id).join(", "),
      "to",
      contentTypeId
    );
  } catch (err) {
    console.error("[ensureSectionFields] failed:", err);
  }
}

// ── Site settings ────────────────────────────────────────────────

const SITE_SETTINGS_TYPE = "siteSettings";
const DEFAULT_SITE_NAME = "yoga by gigi";

const SITE_SETTINGS_FIELDS = [
  { id: "siteName", name: "Site Name", type: "Symbol", required: true, localized: false },
  {
    id: "logo",
    name: "Logo",
    type: "Link",
    linkType: "Asset",
    required: false,
    localized: false,
    validations: [],
  },
  // { navKey: "custom label" } — only labels; the routes stay in code.
  {
    id: "navLabels",
    name: "Navigation Labels",
    type: "Object",
    required: false,
    localized: false,
  },
];

/**
 * Returns the single site settings entry, creating the content type and the
 * entry itself the first time the admin panel asks for them.
 */
export async function ensureSiteSettingsEntry() {
  const c = getClient();
  const { spaceId, environmentId } = spaceEnv();

  // 1 — content type. It may already exist from an earlier version of this app,
  // in which case it only needs the fields that have been added since.
  try {
    const existingType = await c.contentType.get({
      spaceId,
      environmentId,
      contentTypeId: SITE_SETTINGS_TYPE,
    });
    const missing = SITE_SETTINGS_FIELDS.filter(
      (f) => !existingType.fields.some((e: any) => e.id === f.id)
    );
    if (missing.length) {
      const updated = await c.contentType.update(
        { spaceId, environmentId, contentTypeId: SITE_SETTINGS_TYPE },
        { ...existingType, fields: [...existingType.fields, ...(missing as any)] }
      );
      await c.contentType.publish(
        { spaceId, environmentId, contentTypeId: SITE_SETTINGS_TYPE },
        updated
      );
      console.log(
        "[siteSettings] added",
        missing.map((f) => f.id).join(", ")
      );
    }
  } catch {
    const created = await c.contentType.createWithId(
      { spaceId, environmentId, contentTypeId: SITE_SETTINGS_TYPE },
      {
        name: "Site Settings",
        description: "Site-wide name and logo, edited from the admin panel.",
        displayField: "siteName",
        fields: SITE_SETTINGS_FIELDS as any,
      }
    );
    await c.contentType.publish(
      { spaceId, environmentId, contentTypeId: SITE_SETTINGS_TYPE },
      created
    );
    console.log("[siteSettings] created content type");
  }

  // 2 — the singleton entry
  const existing = await c.entry.getMany({
    spaceId,
    environmentId,
    query: { content_type: SITE_SETTINGS_TYPE, limit: 1 },
  });
  if (existing.items.length) return existing.items[0];

  const created = await c.entry.create(
    { spaceId, environmentId, contentTypeId: SITE_SETTINGS_TYPE },
    { fields: { siteName: { "en-US": DEFAULT_SITE_NAME } } }
  );
  console.log("[siteSettings] created entry", created.sys.id);
  return c.entry.publish({ spaceId, environmentId, entryId: created.sys.id }, created);
}

/** Reads the current settings through the management API (admin panel view). */
export async function getSiteSettingsForAdmin() {
  const entry: any = await ensureSiteSettingsEntry();
  const logoId = entry.fields?.logo?.["en-US"]?.sys?.id ?? null;
  return {
    siteName: entry.fields?.siteName?.["en-US"] ?? DEFAULT_SITE_NAME,
    logoId,
    logoUrl: logoId ? await getAssetUrl(logoId) : null,
    navLabels: sanitizeNavLabels(entry.fields?.navLabels?.["en-US"]),
  };
}

/** Writes the site name, logo and/or nav labels, then publishes. */
export async function updateSiteSettings({
  siteName,
  logoAssetId,
  navLabels,
}: {
  siteName?: string;
  logoAssetId?: string;
  navLabels?: Record<string, string>;
}) {
  const entry: any = await ensureSiteSettingsEntry();
  const fields: any = { ...entry.fields };
  if (siteName !== undefined) fields.siteName = { "en-US": siteName };
  if (logoAssetId) {
    fields.logo = {
      "en-US": { sys: { type: "Link", linkType: "Asset", id: logoAssetId } },
    };
  }
  if (navLabels !== undefined) {
    fields.navLabels = { "en-US": sanitizeNavLabels(navLabels) };
  }
  return updateAndPublishEntry(entry.sys.id, fields, entry);
}

// ── Asset helpers ────────────────────────────────────────────────

/** Fetch the CDN URL for a published asset, or null if not found. */
export async function getAssetUrl(assetId: string): Promise<string | null> {
  try {
    const c = getClient();
    const asset = await c.asset.get({ ...spaceEnv(), assetId });
    const url = (asset.fields.file as any)?.["en-US"]?.url;
    return url ? `https:${url}` : null;
  } catch {
    return null;
  }
}

/** Upload a file buffer as a Contentful asset and return its published ID + URL. */
export async function uploadAsset(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ id: string; url: string }> {
  const c = getClient();
  const { spaceId, environmentId } = spaceEnv();

  // Step 1 — binary upload
  const upload = await c.upload.create(
    { spaceId, environmentId },
    { file: buffer }
  );

  // Step 2 — create asset entry referencing the upload
  const asset = await c.asset.create(
    { spaceId, environmentId },
    {
      fields: {
        title: { "en-US": fileName.replace(/\.[^/.]+$/, "") },
        file: {
          "en-US": {
            contentType,
            fileName,
            uploadFrom: {
              sys: { type: "Link", linkType: "Upload", id: upload.sys.id },
            },
          },
        },
      },
    }
  );

  // Step 3 — process (generate CDN URL) then publish
  await c.asset.processForLocale(
    { spaceId, environmentId },
    asset,
    "en-US",
    { processingCheckWait: 1000 }
  );

  // Poll until CDN URL appears (max ~15 s)
  let ready = await c.asset.get({ spaceId, environmentId, assetId: asset.sys.id });
  for (let i = 0; i < 15 && !(ready.fields.file as any)?.["en-US"]?.url; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    ready = await c.asset.get({ spaceId, environmentId, assetId: asset.sys.id });
  }

  const published = await c.asset.publish(
    { spaceId, environmentId, assetId: ready.sys.id },
    ready
  );
  const url = String((published.fields.file as any)?.["en-US"]?.url ?? "");
  return { id: published.sys.id, url: url.startsWith("//") ? `https:${url}` : url };
}
