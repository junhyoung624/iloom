import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MyPageMenu from './MyPageMenu';
import "./scss/mypageLayout.scss";

const pageTitleMap = {
    "/order": "주문/배송",
    "/wishlist": "위시리스트",
    "/mypage": "회원정보 수정",
    "/inquiry": "내 문의",
    "/leavepage": "회원 탈퇴",
};

const MyPageLayout = () => {

    const location = useLocation();
    const title = pageTitleMap[location.pathname] || "마이페이지";

    return (
        <section className="mypage-layout">
            <div className="mypage-layout__inner">
                <main className="mypage-layout__content">
                    <div className="mypage-layout__title">
                        <p>{title}</p>
                    </div>

                    <div className="mypage-layout__menu">
                        <MyPageMenu />
                    </div>

                    <Outlet />
                </main>
            </div>
        </section>
    );
}

export default MyPageLayout;
