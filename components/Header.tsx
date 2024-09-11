"use client";
import React, { useState } from "react";
import Link from "next/link";
import logoPic from "../public/images/logo.png";
import Image from "next/image";
import styles from "../styles/Header.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.headerSection}>
      <a href="#">
        <Link href="/">
          <Image
            src={logoPic}
            alt=""
            className={styles.logo}
            width={0}
            height={0}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Link>
      </a>
      <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ""}`}>
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink} onClick={toggleMenu}>
            Retreats
          </a>
        </li>
        <li className={styles.navItem}>
          <Link href="/blogs" className={styles.navLink} onClick={toggleMenu}>
            Blog
          </Link>
        </li>
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink} onClick={toggleMenu}>
            Booking
          </a>
        </li>
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink} onClick={toggleMenu}>
            Shop
          </a>
        </li>
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink} onClick={toggleMenu}>
            Contact
          </a>
        </li>
      </ul>
      <div
        className={`${styles.hamburger} ${isMenuOpen ? styles.active : ""}`}
        onClick={toggleMenu}
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </div>
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.active : ""}`}
        onClick={toggleMenu}
      ></div>
    </header>
  );
}
