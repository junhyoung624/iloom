import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MainMenu from './MainMenu'
import HeaderInner from './HeaderInner'
import UserMenu from './UserMenu'
import "./scss/header.scss"
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import SearchDropdown from './SearchDropdown'

// header
const Header = () => {

  // 메뉴 불러오기
  const { menus } = useProductStore();
  const { user } = useAuthStore();
  const [isScroll, setScroll] = useState(false);

  const location = useLocation();

  const Home = location.pathname === "/";

  useEffect(() => {

    if (!Home) {
      setScroll(true)
      return
    }

    const handleScroll = () => {
      setScroll(window.scrollY > 60);
    }


    window.addEventListener("scroll", handleScroll);

    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll)
  }, [Home])




  const [isHover, setHover] = useState(false);
  const handleEnter = () => {
    setHover(true)
    console.log("hover", isHover)
  }

  const handleLeave = () => {
    setHover(false)
    console.log("out", isHover)
  }

  // 헤더 스크롤
  const [scrollHover, setScrollHover] = useState(false);
  const scrollEnter = () => {
    setScrollHover(true)
  }

  const scrollLeave = () => {
    setScrollHover(false)
  }

  // userMenu 
  const [userMenu, setUserMenu] = useState(false);
  const userLogin = useRef(null);
  const loginMenu = useRef(false);

  useEffect(() => {
    if (!userLogin.current && user) {
      setUserMenu(true);
      loginMenu.current = true;
    } else {
      setUserMenu(false)
    }
    userLogin.current = user;
  }, [user]);

  useEffect(() => {
    if (loginMenu.current) {
      loginMenu.current = false;
      return;
    }
    setUserMenu(false)
  }, [location.pathname])

  const handleClick = () => {
    setUserMenu(true)
  }

  const closeBtn = () => {
    setUserMenu(false)
  }

  //////////////////////////////////////
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    if (isSearchOpen) {
      document.documentElement.style.overflow = "hidden"
    } else {
      document.documentElement.style.overflow = ""
    }

    return () => {
      document.documentElement.style.overflow = ""
    }
  }, [isSearchOpen])

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev)
  }

  const handleSearchClose = () => {
    setIsSearchOpen(false)
  }

  return (
    <>
      <header className={isScroll || isSearchOpen ? "active" : ""}>
        <HeaderInner
          onEnter={handleEnter}
          userClick={handleClick}
          isHover={isHover}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchClick={handleSearchToggle}
        />
      </header >


      {isHover && <MainMenu menus={menus} onSend={handleLeave} />
      }




      {/* <div
        className={`main-menu-wrap-scroll ${scrollHover ? "active" : ""}`}
        onMouseLeave={scrollLeave}>
        <MainMenu menus={menus}/>
      </div> */}
      <div
        className={`user-menu-overlay ${userMenu ? "active" : ""}`}
        onClick={closeBtn}
      />

      <div className={`user-menu-wrap ${userMenu ? "active" : ""}`}>
        <UserMenu userClose={closeBtn} userMenu={userMenu} />
      </div>

      <div
        className={`search-overlay ${isSearchOpen ? "active" : ""}`}
        onClick={handleSearchClose}
      >
        <SearchDropdown isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen} />
      </div>
    </>
  )
}

export default Header