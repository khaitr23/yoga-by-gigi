'use client';
import React, {useState} from 'react';
import Link from 'next/link';
import logoPic from '../public/images/logo.png';
import Image from 'next/image';
import styles from './Header.module.css';


export default function Header(){
    const[isMenuOpen,setIsMenuOpen] = useState(false);
    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return(
        <header className={styles.headerSection}>
        <a href="#"><Image src={logoPic} alt="" className={styles.logo} layout='intrinsic'/></a>
        <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
          <li className={styles.navItem}>
            <a href="#" className={styles.navLink}>Retreats</a>
          </li>
          <li className={styles.navItem}>
            <Link href="/blogs" className={styles.navLink}>Blog</Link>
          </li>
          <li className={styles.navItem}>
            <a href="#" className={styles.navLink}>Booking</a>
          </li>
          <li className={styles.navItem}>
            <a href="#" className={styles.navLink}>Shop</a>
          </li>
          <li className={styles.navItem}>
            <a href="#" className={styles.navLink}>Contact</a>
          </li>
        </ul>
        <div className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`} onClick={toggleMenu}>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </div>
        <div className={`${styles.overlay} ${isMenuOpen ? styles.active : ''}`} onClick={toggleMenu}></div>
      </header>
    );

}

