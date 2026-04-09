import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'

const HeaderInner = ({ onEnter, userClick }) => {
    const { menus } = useProductStore();

    const [lastScroll, setLastScroll] = useState(false);
      useEffect(() => {
        let lastScrollY = window.scrollY;
    
        const AddMenuScroll = () => {
          const currentScrollY = window.scrollY;
          if (currentScrollY === 0) {
            setLastScroll(false)
          } else if (currentScrollY > lastScrollY) {
            setLastScroll(false)
          } else {
            setLastScroll(true)
          }
          lastScrollY = currentScrollY;
        }
    
        window.addEventListener("scroll", AddMenuScroll);
      return () => window.removeEventListener("scroll", AddMenuScroll);
      },[])

    return (
        <>
            <div className="header-inner-wrap">
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
                            <li>
                                <Link to="/"><img src="./images/logo-icon/search-white.png" alt="" /></Link>
                            </li>
                            <li >
                                {/* <button className='user-btn' onClick={userClick}><img src="./images/logo-icon/user-white.png" alt="" /></button> */}
                                <Link to="/login"><img src="./images/logo-icon/user-white.png" alt="" /></Link>
                            </li>
                            <li>
                                <Link to="/cartr">
                                    <img src="./images/logo-icon/cart-white.png" alt="" />
                                    <span className="cart-num">0</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <ul className={`scroll-menu ${lastScroll ? "active" : ""}`}>
                {menus.map(menu => (
                    <li>
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