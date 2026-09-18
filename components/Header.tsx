"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/Header.module.css";
import {
  DEFAULT_SITE_NAME,
  NavLabels,
  resolveNavItems,
} from "../lib/siteSettings";

interface Props {
  siteName?: string;
  navLabels?: NavLabels;
}

export default function Header({
  siteName = DEFAULT_SITE_NAME,
  navLabels,
}: Props) {
  const navItems = resolveNavItems(navLabels);
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
          {/* Text wordmark rather than a picture — it tracks the site name.
              No aria-label: the visible text is the link's accessible name. */}
          <Link href="/" onClick={close} className={styles.wordmark}>
            <span className={styles.wordmarkName}>{siteName}</span>
            <span className={styles.wordmarkDot}>.</span>
            <span className={styles.wordmarkSuffix}>{"\u00A0studio"}</span>
          </Link>

          {/* ── Desktop nav ── */}
          <ul className={styles.navMenu}>
            {navItems.map(({ key, href, label }) => (
              <li key={key} className={styles.navItem}>
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
          <span className={styles.sidebarBrandName}>{siteName}</span>
          <span className={styles.sidebarBrandDot}>.</span>
          <span className={styles.sidebarBrandSuffix}>{"\u00A0studio"}</span>
        </div>
        <span className={styles.sidebarRule} />

        <nav>
          <ul className={styles.sidebarNav}>
            {navItems.map(({ key, href, label }, i) => (
              <li
                key={key}
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
