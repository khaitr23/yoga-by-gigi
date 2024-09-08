'use client';
import React, {useState} from 'react';
import logoPic from '../public/images/logo.png';
import Image from 'next/image';

export default function Header(){
    const[isMenuOpen,setIsMenuOpen] = useState(false);
    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return(
        <header className="headerSection">
        <a href="#"><Image src={logoPic} alt="" className="logo" layout='intrinsic'/></a>
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
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
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        <div className={`overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>
      </header>
    );

}

