import { client, previewClient } from "../../lib/contentful/client";
import CustomPage from "../../components/CustomPage";

export default function About({ content }) {
  return <CustomPage content={content} />;
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
      sectionImage: null,
      ctaButtonText: null,
      ctaButtonLink: null,
    },
  ];

  const safeSections = sections.map((section) => ({
    sectionHeader:
      section?.fields?.sectionHeader || section?.sectionHeader || null,
    sectionDescription:
      section?.fields?.sectionDescription ||
      section?.sectionDescription ||
      null,
    sectionImage:
      section?.fields?.sectionImage || section?.sectionImage || null,
    sectionType: section?.fields?.sectionType || section?.sectionType || null,
    ctaButtonText:
      section?.fields?.ctaButtonText || section?.ctaButtonText || null,
    ctaButtonLink:
      section?.fields?.ctaButtonLink || section?.ctaButtonLink || null,
    isTextAboveImage:
      section?.fields?.isTextAboveImage ?? section?.isTextAboveImage ?? null, // Boolean check
  }));

  const content = {
    sections: safeSections,
  };

  return {
    props: { content },
    revalidate: 60,
  };
}
