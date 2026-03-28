import Image from "next/image";
import instaIcon from "../public/images/icon-instagram.svg";
import fbIcon from "../public/images/icon-facebook.svg";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.brandName}>yoga by gigi</p>
          <p className={styles.tagline}>breathe · move · be</p>
        </div>

        <span className={styles.rule} aria-hidden="true" />

        <div className={styles.contacts}>
          <a href="tel:+84906783388" className={styles.contactItem}>
            <span className={styles.contactLabel}>phone</span>
            <span>+84906783388</span>
          </a>
          <span className={styles.dot} aria-hidden="true">·</span>
          <a href="mailto:yogabygigi@gmail.com" className={styles.contactItem}>
            <span className={styles.contactLabel}>email</span>
            <span>yogabygigi@gmail.com</span>
          </a>
          <span className={styles.dot} aria-hidden="true">·</span>
          <a href="https://www.yogabygigi.com" className={styles.contactItem}>
            <span className={styles.contactLabel}>web</span>
            <span>yogabygigi.com</span>
          </a>
        </div>

        <div className={styles.bottom}>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <Image className={styles.socialIcon} src={fbIcon} alt="" width={20} height={20} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <Image className={styles.socialIcon} src={instaIcon} alt="" width={20} height={20} />
            </a>
          </div>
          <p className={styles.copyright}>© {new Date().getFullYear()} yoga by gigi</p>
        </div>
      </div>
    </footer>
  );
}
