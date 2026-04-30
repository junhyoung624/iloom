import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import MainMenu from './MainMenu'
import HeaderInner from './HeaderInner'
import UserMenu from './UserMenu'
import CartPanel from './CartPanel'
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
  const [cartPanel, setCartPanel] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  const userLogin = useRef(null)
  const loginMenu = useRef(false)
  const enterTimer = useRef(null)
  const leaveTimer = useRef(null)

  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    if (!isHome) { setScrollProgress(1); return }
    const handleScroll = () => {
      const scrollY = window.scrollY
      const progress = Math.min(Math.max((scrollY - HERO_FADE_START) / (HERO_FADE_END - HERO_FADE_START), 0), 1)
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  useEffect(() => {
    if (user) { loginMenu.current = true } else { setUserMenu(false) }
    userLogin.current = user
  }, [user])

  useEffect(() => {
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    setHover(false)
    setIsSearchOpen(false)
    if (loginMenu.current) { loginMenu.current = false; return }
    setUserMenu(false)
    setCartPanel(false)
  }, [location.pathname])

  useEffect(() => {
    if (isSearchOpen) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
    }
    return () => { document.documentElement.style.overflow = '' }
  }, [isSearchOpen])

  useEffect(() => () => { clearTimeout(enterTimer.current); clearTimeout(leaveTimer.current) }, [])


  useEffect(() => {
    if (cartPanel || userMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [cartPanel, userMenu])

  const handleMenuEnter = () => {
    clearTimeout(leaveTimer.current)
    clearTimeout(enterTimer.current)
    enterTimer.current = setTimeout(() => setHover(true), 90)
    setIsSearchOpen(false)
  }

  const handleHamClick = () => {
    if (window.innerWidth <= 1024) {
      setMobileMenu(prev => !prev)
    } else {
      setHover(prev => !prev)
    }
    setIsSearchOpen(false)
  }

  const handleMenuLeave = () => {
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => setHover(false), 140)
  }

  const handleClick = () => {
    setIsSearchOpen(false)
    if (window.__appLoaded) { setUserMenu(true) }
    else { setTimeout(() => setUserMenu(true), 1600) }
  }

  const closeBtn = () => setUserMenu(false)

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev)
    setHover(false)
  }
  const handleSearchClose = () => setIsSearchOpen(false)


  const handleCartClick = (e) => {
    e.preventDefault()
    setUserMenu(false)
    setIsSearchOpen(false)
    setCartPanel((prev) => !prev)
  }

  const isScrolled = !isHome || scrollProgress > HEADER_ACTIVE_POINT
  const isDarkHeader = isHome && !isScrolled && (isHover || isSearchOpen)
  const isHeaderActive = isScrolled || isSearchOpen || isHover

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false)
        setUserMenu(false)
        setCartPanel(false)
      }
    }
    if (isSearchOpen) document.addEventListener("keydown", handleEsc)
    if (userMenu) document.addEventListener("keydown", handleEsc)
    if (cartPanel) document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isSearchOpen, userMenu, cartPanel])

  return (
    <>
      <header className={`${isHeaderActive ? 'active' : ''} ${isDarkHeader ? 'menu-dark' : ''}`}>
        <HeaderInner
          onEnter={handleMenuEnter}
          onHamClick={handleHamClick}
          userClick={handleClick}
          isHover={isHover}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchClick={handleSearchToggle}
          scrollProgress={scrollProgress}
          isScrolled={isScrolled}
          isHome={isHome}
          onCartClick={handleCartClick}
        />
      </header>

      <MainMenu
        menus={menus}
        isHover={isHover}
        isScrolled={isScrolled}
        onSend={handleMenuLeave}
        onEnter={handleMenuEnter}
        isMobileOpen={mobileMenu}
        onMobileClose={() => setMobileMenu(false)}
      />


      <div
        className={`user-menu-overlay ${userMenu || cartPanel || mobileMenu ? 'active' : ''}`}
        onClick={() => { closeBtn(); setCartPanel(false); setMobileMenu(false) }}
      />


      <div className={`user-menu-wrap ${userMenu ? 'active' : ''}`}>
        <UserMenu userClose={closeBtn} userMenu={userMenu} />
      </div>


      <div className={`user-menu-wrap ${cartPanel ? 'active' : ''}`}>
        <CartPanel onClose={() => setCartPanel(false)} />
      </div>

      <div
        className={`search-overlay ${isSearchOpen ? 'active' : ''}`}
        onClick={handleSearchClose}
      >
        <SearchDropdown
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          isScrolled={isScrolled}
        />
      </div>
    </>
  )
}

export default Header