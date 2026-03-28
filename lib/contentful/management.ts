import { createClient } from "contentful-management";

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

export async function updateAndPublishEntry(entryId: string, fields: Record<string, any>) {
  const c = getClient();
  const existing = await c.entry.get({ ...spaceEnv(), entryId });
  const updated = await c.entry.update(
    { ...spaceEnv(), entryId },
    { ...existing, fields }
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
