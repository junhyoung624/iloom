import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import MainMenu from './MainMenu'
import HeaderInner from './HeaderInner'
import UserMenu from './UserMenu'
import './scss/header.scss'
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import SearchDropdown from './SearchDropdown'

const HERO_FADE_START = 0
const HERO_FADE_END = 700
const HEADER_ACTIVE_POINT = 0.99

const Header = () => {
  const { menus } = useProductStore()
  const { user } = useAuthStore()

  const [scrollProgress, setScrollProgress] = useState(0)
  const [isHover, setHover] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const userLogin = useRef(null)
  const loginMenu = useRef(false)

  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    if (!isHome) {
      setScrollProgress(1)
      return
    }

    const handleScroll = () => {
      const scrollY = window.scrollY

      const progress = Math.min(
        Math.max((scrollY - HERO_FADE_START) / (HERO_FADE_END - HERO_FADE_START), 0),
        1
      )

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  useEffect(() => {
    if (!userLogin.current && user) {
      setUserMenu(true)
      loginMenu.current = true
    } else {
      setUserMenu(false)
    }
    userLogin.current = user
  }, [user])

  useEffect(() => {
    if (loginMenu.current) {
      loginMenu.current = false
      return
    }
    setUserMenu(false)
  }, [location.pathname])

  useEffect(() => {
    if (isSearchOpen) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [isSearchOpen])

  const handleEnter = () => {
    setHover(true)
  }

  const handleLeave = () => {
    setHover(false)
  }

  const handleClick = () => {
    setUserMenu(true)
  }

  const closeBtn = () => {
    setUserMenu(false)
  }

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev)
  }

  const handleSearchClose = () => {
    setIsSearchOpen(false)
  }

  const isHeaderActive = scrollProgress > HEADER_ACTIVE_POINT || isSearchOpen

  return (
    <>
      <header className={isHeaderActive ? 'active' : ''}>
        <HeaderInner
          onEnter={handleEnter}
          userClick={handleClick}
          isHover={isHover}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchClick={handleSearchToggle}
          scrollProgress={scrollProgress}
        />
      </header>

      {isHover && <MainMenu menus={menus} onSend={handleLeave} />}

      <div
        className={`user-menu-overlay ${userMenu ? 'active' : ''}`}
        onClick={closeBtn}
      />

      <div className={`user-menu-wrap ${userMenu ? 'active' : ''}`}>
        <UserMenu userClose={closeBtn} userMenu={userMenu} />
      </div>

      <div
        className={`search-overlay ${isSearchOpen ? 'active' : ''}`}
        onClick={handleSearchClose}
      >
        <SearchDropdown
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
        />
      </div>
    </>
  )
}

export default Header