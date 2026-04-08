import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MainMenu from './MainMenu'
import HeaderInner from './HeaderInner'
import HeaderScroll from './HeaderScroll'
import UserMenu from './UserMenu'
import "./scss/header.scss"
import { useProductStore } from '../store/useProductStore'

// header
const Header = () => {

  // 메뉴 불러오기
  const {menus} = useProductStore();

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
  }

  const handleLeave = () => {
    setHover(false)
  }

  const [scrollHover, setScrollHover] = useState(false);
  const scrollEnter = () => {
    setScrollHover(true)
  }

  const scrollLeave = () => {
    setScrollHover(false)
  }

  const [userMenu, setUserMenu] = useState(false);

  const handleClick = () => {
    setUserMenu(true)
  }

  const closeBtn = () => {
    setUserMenu(false)
  }
  return (
    <>
      <header style={{ background: isScroll ? "#fff" : isHover ? "rgba(34, 33, 33, 0.8)" : "transparent" }}>
        {isScroll ?
          <HeaderScroll
            onScrollEnter={scrollEnter}
            userClick={handleClick}
          />
          :
          <HeaderInner
            onEnter={handleEnter}
            userClick={handleClick}
          />}
      </header>


      <div
        className={`main-menu-wrap ${isHover ? "active" : ""} `}
        onMouseLeave={handleLeave}>
        <MainMenu menus={menus}/>
      </div>
      <div
        className={`main-menu-wrap-scroll ${scrollHover ? "active" : ""}`}
        onMouseLeave={scrollLeave}>
        <MainMenu menus={menus}/>
      </div>
      <div className={`user-menu-wrap ${userMenu ? "active" : ""}`}>
        <UserMenu userClose={closeBtn}/>
      </div>
    </>
  )
}

export default Header