import React from "react";
import ContentfulImage from "../components/ui/ContentfulImage";
import PreviewAlert from "./ui/PreviewAlert";
import styles from "../styles/CustomPage.module.css";

export default function CustomPage({ content, preview }) {
  const { sections } = content;
  let nonBreakIndex = 0;

  return (
    <main>
      {preview && <PreviewAlert />}

      {sections.map((section, index) => {
        const isBreak = section.sectionType === "break";
        const isReverse = !isBreak && nonBreakIndex % 2 !== 0;
        const currentNonBreakIndex = isBreak ? null : nonBreakIndex;
        if (!isBreak) nonBreakIndex++;

        // Primary + extra images, keeping only assets that actually resolved
        // (an unpublished asset comes back as a link ref without `.fields`).
        const images: any[] = [
          section.sectionImage,
          ...((section.additionalImages as any[]) ?? []),
        ].filter((img: any) => img?.fields?.file?.url);

        const sectionDescriptionText = section.sectionDescription || "";
        const formattedDescription = sectionDescriptionText.replace(/\n/g, "<br>");
        const delay = `${index * 0.12}s`;

        /* ── Break / chapter divider ── */
        if (isBreak) {
          return (
            <div
              key={index}
              className={styles.breakWrapper}
              style={{ "--delay": delay } as React.CSSProperties}
            >
              <div className={styles.breakInner}>
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
                {images.length > 0 && (
                  <div className={styles.breakImageStack}>
                    {images.map((img, idx) => {
                      const details = img.fields.file.details?.image ?? {};
                      return (
                        <div
                          key={img.sys?.id ?? idx}
                          className={styles.breakImageFrame}
                        >
                          <ContentfulImage
                            src={img.fields.file.url}
                            alt={section.sectionHeader}
                            width={details.width ?? 1200}
                            height={details.height ?? 900}
                            className={styles.sectionImage}
                            sizes="(max-width: 800px) 100vw, 680px"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        }

        const isHero =
          section.sectionType === "large-title-content-section" && index === 0;
        const isMedium =
          section.sectionType === "medium-title-content-section";
        // Only render the image column if the primary image actually has a URL —
        // an unpublished / unresolved asset comes back as a link ref without .fields.
        const hasImage = !!section.sectionImage?.fields?.file?.url;

        const innerClass = isHero
          ? styles.heroSection
          : hasImage
          ? `${styles.regularSection} ${isReverse ? styles.reverse : ""}`
          : "";

        return (
          <div
            key={index}
            className={styles.sectionWrapper}
            style={{ "--delay": delay } as React.CSSProperties}
          >
            <div className={innerClass}>
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
                  {(() => {
                    return (
                      <div className={styles.imageStack}>
                        {images.map((img, idx) => {
                          const details = img.fields.file.details?.image ?? {};
                          const w = details.width ?? 1200;
                          const h = details.height ?? 900;
                          return (
                            <div key={img.sys?.id ?? idx} className={styles.imageFrame}>
                              <ContentfulImage
                                src={img.fields.file.url}
                                alt={section.sectionHeader}
                                width={w}
                                height={h}
                                className={styles.sectionImage}
                                sizes="(max-width: 800px) 100vw, 50vw"
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </main>
  );
}
