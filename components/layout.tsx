import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';
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

        <link rel="stylesheet" href="style.css" />
      </Head>
      <header className="headerSection">
      <a href="#"><img src="./img/logo.png" alt="" className="logo" /></a>
      <ul className="nav-menu">
        <li className="nav-item">
          <a href="#" className="nav-link">Retreats</a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link">Blog</a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link">Booking</a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link">Shop</a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link">Contact</a>
        </li>
      </ul>
      <div className="hamburger">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </header>
    {children}
    <footer className="footer column section">
      <div>
        <p>Connect with me on</p>
        <div className="social-icons">
          <img src="./img/icon-facebook.svg" />
          <img src="./img/icon-instagram.svg" />
        </div>
      </div>
      <div className="vl"></div>
      <div className="contacts">
        <div>
          <p>phone</p>
          <a href="tel:+84899211860">+84906783388</a><br />
        </div>
        <div>
          <p>website</p>
          <a href="https://www.yogabygigi.com">yogabygigi.com</a>
        </div>
        <div>
          <p>email</p>
          <a href="mailto:yogabygigi@gmail.com">hangnt@gmail</a>
        </div>
      </div>
    </footer>
      </>
  );
}
