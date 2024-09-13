import ContentfulImage from "../components/ui/ContentfulImage";

export default function CustomPage({ content }) {
  const { sections } = content;
  let nonBreakIndex = 0;
  return (
    <main>
      {sections.map((section, index) => {
        // Logic to reverse image and text in every other div (if the its a break section, then ignore it)
        const isBreak = section.sectionType === "break";
        const isReverse = !isBreak && nonBreakIndex % 2 !== 0;
        if (!isBreak) nonBreakIndex++;
        const sectionDescriptionText = section.sectionDescription || "";
        const formatedSectionDescription = sectionDescriptionText.replace(
          /\n/g,
          "<br>"
        );

        return (
          <div
            className={`section hero ${
              section.sectionType !== "break" ? "column " : ""
            }${section.sectionType} ${isReverse ? "reverse " : ""}${
              section.isTextAboveImage ? "textAboveImage" : "textBelowImage"
            }`}
            key={index}
          >
            <div>
              {section.sectionType === "large-title-content-section" && (
                <>
                  <h1>{section.sectionHeader}</h1>
                  <br />
                </>
              )}
              {section.sectionType === "medium-title-content-section" && (
                <>
                  <h2>{section.sectionHeader}</h2>
                  <br />
                </>
              )}
              {section.sectionType === "break" && (
                <h2>{section.sectionHeader}</h2>
              )}
              {section.sectionType === "small-title-content-section" && (
                <h3>{section.sectionHeader}</h3>
              )}

              {section.sectionDescription && (
                <p
                  dangerouslySetInnerHTML={{
                    __html: formatedSectionDescription,
                  }}
                />
              )}

              {section.ctaButtonText && (
                <div id="primary-links">
                  <a href={section.ctaButtonLink} className="button">
                    {section.ctaButtonText}
                  </a>
                </div>
              )}
            </div>

            {section.sectionImage && (
              <div className="image-container">
                <ContentfulImage
                  src={section.sectionImage.fields.file.url}
                  alt={section.sectionHeader}
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}
