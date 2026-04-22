import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import "./scss/headerinner.scss"

const HeaderInner = ({
    onEnter,
    userClick,
    isHover,
    isSearchOpen,
    searchClick,
    isScrolled,
    scrollProgress
}) => {
    const { menus, cartItems } = useProductStore()
    const cartCount = cartItems.length
    const { user } = useAuthStore()

    const [lastScroll, setLastScroll] = useState(false)

    useEffect(() => {
        let lastScrollY = window.scrollY

        const handleScrollDirection = () => {
            const currentScrollY = window.scrollY

            if (currentScrollY === 0) {
                setLastScroll(false)
            } else if (currentScrollY > lastScrollY) {
                setLastScroll(false)
            } else {
                setLastScroll(true)
            }

            lastScrollY = currentScrollY
        }

        window.addEventListener("scroll", handleScrollDirection)
        handleScrollDirection()

        return () => window.removeEventListener("scroll", handleScrollDirection)
    }, [])

    return (
        <>
            <div className="header-inner">
                <div className="header-left">
                    <div className="ham-btn" onMouseEnter={onEnter}>
                        <img src="/images/logo-icon/ham-white.png" alt="ham-btn" />
                    </div>
                </div>

                <h1 className="main-logo">
                    <Link to="/">
                        <img src="/images/logo-icon/main-logo-white.png" alt="" />
                    </Link>
                </h1>

                <div className="header-right">
                    <ul className="gnb-list">
                        {user ? (
                            <>
                                <li>
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        onClick={searchClick}
                                    >
                                        <img src="/images/logo-icon/search.png" alt="search" />
                                    </button>
                                </li>
                                <li>
                                    <button className="user-btn" onClick={userClick}>
                                        <img src="/images/logo-icon/user.png" alt="" />
                                        <span>{user.name}</span>
                                    </button>
                                </li>
                                <li>
                                    <Link to="/cart" className="cart-link">
                                        <img src="/images/logo-icon/cart.png" alt="" />
                                        {cartCount > 0 && <span className="cart-num">{cartCount}</span>}
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        onClick={searchClick}
                                    >
                                        <img src="/images/logo-icon/search.png" alt="search" />
                                    </button>
                                </li>
                                <li>
                                    <Link to="/login">
                                        <img src="/images/logo-icon/user.png" alt="" />
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/cart" className="cart-link">
                                        <img src="/images/logo-icon/cart.png" alt="" />
                                        {cartCount > 0 && <span className="cart-num">{cartCount}</span>}
                                    </Link>
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
                            <Link to={menu.link}>
                                {menu.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export default HeaderInner