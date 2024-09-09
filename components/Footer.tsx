import Image from "next/image";
import instaIcon from "../public/images/icon-instagram.svg";
import fbIcon from "../public/images/icon-facebook.svg";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.footer} column section`}>
      <div className={styles.connectMe}>
        <p>Connect with me on</p>
        <div className={styles.socialIcons}>
          <Image src={fbIcon} alt="" />
          <Image src={instaIcon} alt="" />
        </div>
      </div>
      <div className={styles.vl}></div>
      <div className={styles.contacts}>
        <div>
          <p>phone</p>
          <a href="tel:+84899211860">+84906783388</a>
          <br />
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
  );
}
