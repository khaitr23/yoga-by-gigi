import { client, previewClient } from "../../lib/contentful/client";
import CustomPage from "../../components/CustomPage";
import { getSiteSettings } from "../../lib/contentful/siteSettings";

export default function About({ content, preview }) {
  return <CustomPage content={content} preview={preview} />;
}

export async function getStaticProps({ preview = false }) {
  const cfClient = preview ? previewClient : client;

  const response = await cfClient.getEntries({
    content_type: "page",
    "fields.slug": "about",
  });

  const sections = response?.items?.[0]?.fields?.sections || [
    {
      sectionHeader: "This page is under construction!",
      sectionDescription:
        "Please check again later, thank you for your patience! :)",
      sectionType: "break",
      isTextAboveImage: true,
      imagePosition: "auto",
      textAlign: null,
      sectionImage: null,
      ctaButtonText: null,
      ctaButtonLink: null,
    },
  ];

  const safeSections = sections.filter((s: any) => s?.fields || s?.sectionType).map((section) => ({
    sectionHeader:
      section?.fields?.sectionHeader || section?.sectionHeader || null,
    sectionDescription:
      section?.fields?.sectionDescription ||
      section?.sectionDescription ||
      null,
    sectionImage:
      section?.fields?.sectionImage || section?.sectionImage || null,
    additionalImages:
      section?.fields?.additionalImages || section?.additionalImages || [],
    sectionType: section?.fields?.sectionType || section?.sectionType || null,
    ctaButtonText:
      section?.fields?.ctaButtonText || section?.ctaButtonText || null,
    ctaButtonLink:
      section?.fields?.ctaButtonLink || section?.ctaButtonLink || null,
    isTextAboveImage:
      section?.fields?.isTextAboveImage ?? section?.isTextAboveImage ?? null, // Boolean check
    imagePosition:
      section?.fields?.imagePosition || section?.imagePosition || "auto",
    textAlign: section?.fields?.textAlign || section?.textAlign || null,
  }));

  const content = {
    sections: safeSections,
  };

  return {
    props: { content, preview, siteSettings: await getSiteSettings(preview) },
    revalidate: 60,
  };
}
