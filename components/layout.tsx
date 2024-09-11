import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import styles from "../styles/layout.module.css";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Yoga by GIGI</title>
        <link rel="icon" href="/images/logo.png" />
      </Head>
      <Header />
      {children}
      <Footer />
    </>
  );
}
