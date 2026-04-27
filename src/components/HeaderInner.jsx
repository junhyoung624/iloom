import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import "./scss/headerinner.scss"
import ScrollProgress from '../pages/ScrollProgress'

const HeaderInner = ({
    onEnter,
    userClick,
    isHover,
    isSearchOpen,
    searchClick,
    isScrolled,
    scrollProgress,
    onCartClick,
}) => {
    const { menus, cartItems } = useProductStore()
    const cartCount = cartItems.length
    const { user } = useAuthStore()
    const [lastScroll, setLastScroll] = useState(false)

    useEffect(() => {
        let lastScrollY = window.scrollY
        const handleScrollDirection = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY === 0) { setLastScroll(false) }
            else if (currentScrollY > lastScrollY) { setLastScroll(false) }
            else { setLastScroll(true) }
            lastScrollY = currentScrollY
        }
        window.addEventListener("scroll", handleScrollDirection)
        handleScrollDirection()
        return () => window.removeEventListener("scroll", handleScrollDirection)
    }, [])

    return (
        <>
            <div className="header-inner">
                <ScrollProgress />
                <div className="header-left">
                    <div className="ham-btn" onMouseEnter={onEnter}>
                        <img src="/images/logo-icon/ham-white.png" alt="ham-btn" />
                    </div>
                </div>

                <h1 className="main-logo">
                    <Link to="/"><img src="/images/logo-icon/main-logo-white.png" alt="" /></Link>
                </h1>

                <div className="header-right">
                    <ul className="gnb-list">
                        {user ? (
                            <>
                                <li>
                                    <button type="button" className="icon-btn" onClick={searchClick}>
                                        <img src="/images/logo-icon/search.png" alt="search" />
                                    </button>
                                </li>
                                <li>
                                    <button className="user-btn" onClick={userClick}>
                                        <img src="/images/logo-icon/user.png" alt="" />

                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="cart-link icon-btn"
                                        onClick={onCartClick}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
                                    >
                                        <img src="/images/logo-icon/cart.png" alt="" />
                                        {cartCount > 0 && <span className="cart-num">{cartCount}</span>}
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <button type="button" className="icon-btn" onClick={searchClick}>
                                        <img src="/images/logo-icon/search.png" alt="search" />
                                    </button>
                                </li>
                                <li>
                                    <Link to="/login">
                                        <img src="/images/logo-icon/login-black.png" alt="" />
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="cart-link icon-btn"
                                        onClick={onCartClick}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
                                    >
                                        <img src="/images/logo-icon/cart.png" alt="" />
                                        {cartCount > 0 && <span className="cart-num">{cartCount}</span>}
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            <div className="header-scroll-nav-mask">
                <ul className={`header-scroll-nav header-minus-scroll ${!isSearchOpen && !isHover && lastScroll && isScrolled ? "active" : ""}`}>
                    {menus.map((menu, index) => (
                        <li key={`${menu.key}-${index}`}>
                            <Link to={menu.link}>{menu.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export default HeaderInner