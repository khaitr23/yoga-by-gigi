import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "../lib/siteSettings";

export default function Layout({
  children,
  siteSettings = DEFAULT_SITE_SETTINGS,
}: {
  children: React.ReactNode;
  siteSettings?: SiteSettings;
}) {
  const { siteName, logoUrl, navLabels } = siteSettings ?? DEFAULT_SITE_SETTINGS;
  // Contentful can resize the favicon for us; the bundled logo is already small.
  const favicon = logoUrl ? `${logoUrl}?w=64&h=64&fit=fill` : "/images/logo.png";

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{siteName}</title>
        <link rel="icon" href={favicon} />
      </Head>
      <Header siteName={siteName} navLabels={navLabels} />
      {children}
      <Footer siteName={siteName} />
    </>
  );
}
