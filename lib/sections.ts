/**
 * Shared vocabulary for homepage/about/booking sections.
 * Imported by both the renderer and the admin API so the two can't drift.
 */

/** Where a section's image sits relative to its text. */
export const IMAGE_POSITIONS = ["auto", "left", "right", "above", "below"];

/** How a section's text is aligned within its column. */
export const TEXT_ALIGNMENTS = ["left", "center", "right"];

/**
 * Alignment a section uses when the author hasn't picked one.
 * A plain break divider is a centered chapter separator; everything else —
 * including a break that has an image and so renders as a normal section —
 * reads better left-aligned.
 */
export function defaultTextAlign(sectionType: string, hasImage: boolean) {
  return sectionType === "break" && !hasImage ? "center" : "left";
}

/** Resolve a stored value to a usable alignment, falling back to the default. */
export function resolveTextAlign(
  stored: any,
  sectionType: string,
  hasImage: boolean
) {
  return TEXT_ALIGNMENTS.includes(stored)
    ? stored
    : defaultTextAlign(sectionType, hasImage);
}
