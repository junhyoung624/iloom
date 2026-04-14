import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import "./scss/headerinner.scss"
import SearchDropdown from './SearchDropdown'

const HeaderInner = ({ onEnter, userClick, isHover, isSearchOpen, searchClick }) => {
    const { menus } = useProductStore()
    const { user } = useAuthStore()

    const [lastScroll, setLastScroll] = useState(false)


    useEffect(() => {
        let lastScrollY = window.scrollY

        const AddMenuScroll = () => {
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

        window.addEventListener("scroll", AddMenuScroll)
        return () => window.removeEventListener("scroll", AddMenuScroll)
    }, [])

    return (
        <>


            <div className="header-inner">
                <div className="header-left">
                    <div className="ham-btn" onMouseEnter={onEnter}>
                        <img src="./images/logo-icon/ham-white.png" alt="ham-btn" />
                    </div>
                </div>

                <h1 className="main-logo">
                    <Link to="/"><img src="./images/logo-icon/main-logo-white.png" alt="" /></Link>
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
                                        <img src="./images/logo-icon/search-white.png" alt="search" />
                                    </button>
                                </li>
                                <li>
                                    <button className='user-btn' onClick={userClick}>
                                        <img src="./images/logo-icon/user-white.png" alt="" />
                                        <span>{user.name}</span>
                                    </button>
                                </li>
                                <li>
                                    <Link to="/cart">
                                        <img src="./images/logo-icon/cart-white.png" alt="" />
                                        <span className="cart-num">0</span>
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
                                        <img src="./images/logo-icon/search-white.png" alt="search" />
                                    </button>
                                </li>
                                <li>
                                    <Link to="/login"><img src="./images/logo-icon/user-white.png" alt="" /></Link>
                                </li>
                                <li>
                                    <Link to="/cart">
                                        <img src="./images/logo-icon/cart-white.png" alt="" />
                                        <span className="cart-num">0</span>
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>




            <ul className={`scroll-menu ${!isSearchOpen && !isHover && lastScroll ? "active" : ""}`}>
                {menus.map((menu, index) => (
                    <li key={`${menu.key}-${index}`}>
                        <Link to={menu.link}>
                            {menu.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default HeaderInner