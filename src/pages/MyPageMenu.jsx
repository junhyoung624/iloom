import React from "react";
import "./scss/mypagemenu.scss";
import { NavLink } from "react-router-dom";

const menuItems = [
    { path: "/order", label: "주문/배송" },
    { path: "/wishlist", label: "위시리스트" },
    { path: "/mypage", label: "회원정보 수정" },
    { path: "/inquiry", label: "내 문의" },
    { path: "/leavepage", label: "회원 탈퇴" },
];

export default function MyPageMenu() {
    return (
        <aside className="mypage-sidebar">
            <ul>
                {menuItems.map((menu) => (
                    <li key={menu.path}>
                        <NavLink
                            to={menu.path}
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            {menu.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </aside>
    );
}