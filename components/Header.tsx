"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import logoPic from "../public/images/logo.png";
import Image from "next/image";
import styles from "../styles/Header.module.css";

const NAV_ITEMS = [
  { href: "/", label: "My Yoga Journey" },
  { href: "/retreats", label: "Retreats" },
  { href: "/blogs", label: "Blog" },
  { href: "/booking", label: "Booking" },
  { href: "#", label: "Shop" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const close = () => setIsMenuOpen(false);
  const toggle = () => setIsMenuOpen((v) => !v);

  return (
    <>
      {/* The headerWrapper has backdrop-filter which creates a stacking context —
          sidebar and overlay must live OUTSIDE it to cover the full page */}
      <div className={styles.headerWrapper}>
        <header className={styles.headerSection}>
          <Link href="/" onClick={close}>
            <Image
              src={logoPic}
              alt=""
              className={styles.logo}
              width={0}
              height={0}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Link>

          {/* ── Desktop nav ── */}
          <ul className={styles.navMenu}>
            {NAV_ITEMS.map(({ href, label }) => (
              <li key={label} className={styles.navItem}>
                <Link href={href} className={styles.navLink}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Placeholder keeps the 3-col grid balanced on desktop */}
          <div className={styles.hamburgerPlaceholder} aria-hidden="true" />
        </header>
      </div>

      {/* ── Hamburger lives outside headerWrapper so backdrop-filter
           stacking context doesn't trap it — it can freely float above
           the sidebar when position:fixed + high z-index ── */}
      <button
        className={`${styles.hamburger} ${isMenuOpen ? styles.active : ""}`}
        onClick={toggle}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {/* ── Mobile sidebar ── */}
      <div
        className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ""}`}
        aria-hidden={!isMenuOpen}
      >
        <div className={styles.sidebarBrand}>
          <span className={styles.sidebarBrandName}>yoga by gigi</span>
          <span className={styles.sidebarBrandDot}>.</span>
        </div>
        <span className={styles.sidebarRule} />

        <nav>
          <ul className={styles.sidebarNav}>
            {NAV_ITEMS.map(({ href, label }, i) => (
              <li
                key={label}
                className={styles.sidebarNavItem}
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link href={href} className={styles.sidebarNavLink} onClick={close}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.sidebarFooterText}>find your balance.</span>
        </div>
      </div>

      {/* ── Overlay ── */}
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.overlayActive : ""}`}
        onClick={close}
        aria-hidden="true"
      />
    </>
  );
}
