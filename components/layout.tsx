import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import styles from './layout.module.css';
import Link from 'next/link';


export default function Layout({children}:{children: React.ReactNode}) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Yoga by GIGI</title>
        <link rel="icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header/>
    {children}
    <Footer/>
      </>
  );
}
