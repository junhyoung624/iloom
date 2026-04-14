import React from 'react'
import { Link } from 'react-router-dom'

const HeaderScroll = ({ onScrollEnter, userClick }) => {
    return (
        <div className="header-inner-scroll">
            <div className="header-inner">
                <div className="header-left">
                    <div className="ham-btn-scroll" onMouseEnter={onScrollEnter}>
                        <img src="./images/logo-icon/ham-black.png" alt="ham-btn" />
                    </div>
                </div>
                <h1 className="main-logo">
                    <Link to="/"><img src="./images/logo-icon/main-logo-black.png" alt="" /></Link>
                </h1>
                <div className="header-right">
                    <ul className="gnb-list">
                        <li>
                            <Link to="/"><img src="./images/logo-icon/search-black.png" alt="" /></Link>
                        </li>
                        <li>
                            <button className='user-btn' onClick={userClick}><img src="./images/logo-icon/user-black.png" alt="" /></button>
                        </li>
                        <li>
                            <Link to="/member">
                                <img src="./images/logo-icon/cart-black.png" alt="" />
                                <span className='cart-num-scroll'>0</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default HeaderScroll