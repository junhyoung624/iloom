import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MainMenu from './MainMenu'
import HeaderInner from './HeaderInner'
import UserMenu from './UserMenu'
import "./scss/header.scss"
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'

// header
const Header = () => {

  // 메뉴 불러오기
  const { menus } = useProductStore();
  const {user} = useAuthStore();
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
      <header className={isScroll ? "active" : ""}>
        <HeaderInner
          onEnter={handleEnter}
          userClick={handleClick}
          isHover={isHover}
           />
      </header>


      {isHover && <MainMenu menus={menus} onSend={handleLeave} />}


      {/* <div
        className={`main-menu-wrap-scroll ${scrollHover ? "active" : ""}`}
        onMouseLeave={scrollLeave}>
        <MainMenu menus={menus}/>
      </div> */}
      <div className={`user-menu-wrap ${user ? userMenu ? "active" : "" : ""}`}>
        <UserMenu userClose={closeBtn} />
      </div>
    </>
  )
}

export default Header