import React from "react";
import ContentfulImage from "../components/ui/ContentfulImage";
import PreviewAlert from "./ui/PreviewAlert";
import styles from "../styles/CustomPage.module.css";

/** Where a section's image sits relative to its text. */
const IMAGE_POSITIONS = ["auto", "left", "right", "above", "below"];

/** Renders the primary image plus any extras as a vertical stack. */
function ImageStack({
  images,
  alt,
  sizes,
}: {
  images: any[];
  alt: string;
  sizes: string;
}) {
  return (
    <div className={styles.imageStack}>
      {images.map((img, idx) => {
        const details = img.fields.file.details?.image ?? {};
        return (
          <div key={img.sys?.id ?? idx} className={styles.imageFrame}>
            <ContentfulImage
              src={img.fields.file.url}
              alt={alt}
              width={details.width ?? 1200}
              height={details.height ?? 900}
              className={styles.sectionImage}
              sizes={sizes}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function CustomPage({ content, preview }) {
  const { sections } = content;
  let nonBreakIndex = 0; // drives the 01 / 02 … section counter
  let layoutIndex = 0;   // drives the left / right alternation for "auto"

  return (
    <main>
      {preview && <PreviewAlert />}

      {sections.map((section, index) => {
        const isBreak = section.sectionType === "break";

        // Primary + extra images, keeping only assets that actually resolved
        // (an unpublished asset comes back as a link ref without `.fields`).
        const images: any[] = [
          section.sectionImage,
          ...((section.additionalImages as any[]) ?? []),
        ].filter((img: any) => img?.fields?.file?.url);
        const hasImage = images.length > 0;

        // A break with an image lays out like a regular section, so it takes a
        // slot in the alternation. A plain break divider leaves it untouched.
        const isSplitBreak = isBreak && hasImage;
        const takesLayoutSlot = !isBreak || isSplitBreak;
        const isReverse = takesLayoutSlot && layoutIndex % 2 !== 0;
        const currentNonBreakIndex = isBreak ? null : nonBreakIndex;
        if (!isBreak) nonBreakIndex++;
        if (takesLayoutSlot) layoutIndex++;

        // "auto" follows the alternating rhythm; anything else is explicit.
        // Explicit choices don't shift the rhythm for the sections around them.
        const position = IMAGE_POSITIONS.includes(section.imagePosition)
          ? section.imagePosition
          : "auto";
        const isStacked = position === "above" || position === "below";
        const imageAbove = position === "above";
        const imageLeft =
          position === "left" || (position === "auto" && isReverse);

        const sectionDescriptionText = section.sectionDescription || "";
        const formattedDescription = sectionDescriptionText.replace(/\n/g, "<br>");
        const delay = `${index * 0.12}s`;

        const isHero =
          section.sectionType === "large-title-content-section" && index === 0;
        const isMedium =
          section.sectionType === "medium-title-content-section";

        // Layout wrapper: stacked (image above/below) or two columns.
        const gridClass = isStacked
          ? `${styles.stackedSection} ${imageAbove ? styles.imageAbove : ""}`
          : `${isHero ? styles.heroSection : styles.regularSection} ${
              imageLeft ? styles.reverse : ""
            }`;

        const imageSizes = isStacked
          ? "(max-width: 1080px) 100vw, 1080px"
          : "(max-width: 800px) 100vw, 50vw";

        /* ── Break / chapter divider ── */
        if (isBreak) {
          const breakText = (
            <>
              <span className={styles.breakOrnament} aria-hidden="true">
                ✦
              </span>
              <h2 className={styles.breakTitle}>{section.sectionHeader}</h2>
              {section.sectionDescription && (
                <p
                  className={styles.breakDescription}
                  dangerouslySetInnerHTML={{ __html: formattedDescription }}
                />
              )}
            </>
          );

          /* With an image: same layout system as the regular sections. */
          if (isSplitBreak) {
            return (
              <div
                key={index}
                className={styles.sectionWrapper}
                style={{ "--delay": delay } as React.CSSProperties}
              >
                <div className={gridClass}>
                  <div className={`${styles.textBlock} ${styles.breakTextBlock}`}>
                    {breakText}
                  </div>
                  <div className={styles.imageBlock}>
                    <ImageStack
                      images={images}
                      alt={section.sectionHeader}
                      sizes={imageSizes}
                    />
                  </div>
                </div>
              </div>
            );
          }

          /* No image: centered chapter separator. */
          return (
            <div
              key={index}
              className={styles.breakWrapper}
              style={{ "--delay": delay } as React.CSSProperties}
            >
              <div className={styles.breakInner}>{breakText}</div>
            </div>
          );
        }

        return (
          <div
            key={index}
            className={styles.sectionWrapper}
            style={{ "--delay": delay } as React.CSSProperties}
          >
            <div className={hasImage ? gridClass : ""}>
              {/* ── Text block ── */}
              <div className={isHero ? styles.heroTextBlock : hasImage ? styles.textBlock : styles.textOnlySection}>
                {/* Section counter (non-hero only) */}
                {!isHero && currentNonBreakIndex !== null && (
                  <span className={styles.sectionNumber} aria-hidden="true">
                    {String(currentNonBreakIndex + 1).padStart(2, "0")}
                  </span>
                )}

                {isHero && (
                  <h1 className={styles.heroTitle}>{section.sectionHeader}</h1>
                )}
                {!isHero && isMedium && (
                  <h2 className={styles.sectionTitle}>{section.sectionHeader}</h2>
                )}
                {!isHero && !isMedium && (
                  <h3 className={styles.sectionTitleSmall}>
                    {section.sectionHeader}
                  </h3>
                )}

                {section.sectionDescription && (
                  <p
                    className={styles.sectionDescription}
                    dangerouslySetInnerHTML={{ __html: formattedDescription }}
                  />
                )}

                {section.ctaButtonText && (
                  <div className={styles.ctaWrapper}>
                    <a
                      href={section.ctaButtonLink}
                      className={styles.ctaButton}
                    >
                      <span>{section.ctaButtonText}</span>
                      <span className={styles.ctaArrow} aria-hidden="true">
                        →
                      </span>
                    </a>
                  </div>
                )}
              </div>

              {/* ── Image block ── */}
              {hasImage && (
                <div className={isHero ? styles.heroImageBlock : styles.imageBlock}>
                  <ImageStack
                    images={images}
                    alt={section.sectionHeader}
                    sizes={imageSizes}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </main>
  );
}
