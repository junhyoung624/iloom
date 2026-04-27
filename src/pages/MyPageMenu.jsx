import React from 'react';
import "./scss/mypagemenu.scss";
import { Link, useLocation } from 'react-router-dom';

export default function MyPageMenu() {
    const location = useLocation()

    return (
        <div>
            <aside className='mypage-sidebar'>
                <ul>
                    <li className={location.pathname === "/order" ? "active" : ""}><Link to="/order">주문/배송</Link></li>
                    <li className={location.pathname === "/wishlist" ? "active" : ""}><Link to="/wishlist">위시리스트</Link></li>
                    <li className={location.pathname === "/mypage" ? "active" : ""}><Link to="/mypage">회원정보 수정</Link></li>
                    <li className={location.pathname === "/inquiry" ? "active" : ""}><Link to="/inquiry">내 문의</Link></li>
                    <li className={location.pathname === "/leavepage" ? "active" : ""}><Link to="/leavepage">회원 탈퇴</Link></li>
                </ul>
            </aside>
        </div>
    );
}