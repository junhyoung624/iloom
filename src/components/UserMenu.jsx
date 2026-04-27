import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUserAssetStore } from '../store/useUserAssetStore';

const UserMenu = ({ userClose }) => {
  const navigate = useNavigate();

  const { user, onLogout } = useAuthStore();
  const { iloomMoney } = useUserAssetStore();

  const mypage = [
    { link: "/order", name: '주문/배송' },
    { link: "/wishlist", name: '위시리스트' },
    { link: "/inquiry", name: '내 문의' },
    {
      link: "/mypage",
      name: '내 정보관리',
      sub: [
        { link: "/mypage", name: "회원정보 수정" },
        { link: "/leavepage", name: "회원 탈퇴" },
      ],
    },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div>
      <p className="user-img">
        <Link to="/">
          <img src="./images/logo-icon/main-logo-black.png" alt="" />
        </Link>
      </p>

      <p className="user-name">
        <strong>{user?.name}</strong> 님 환영합니다!
      </p>

      <div className="user-point">
        <span className="user-point__label">일룸 머니</span>
        <span className="user-point__value">
          {(iloomMoney || 0).toLocaleString()}P
        </span>
      </div>

      <p className="close-btn" onClick={userClose}>
        <img src="./images/logo-icon/close-btn-black.png" alt="" />
      </p>

      <button className="logout-btn" onClick={handleLogout}>
        로그아웃
      </button>

      <div className="line"></div>

      <ul className="info-list">
        {mypage.map((p, id) => (
          <li key={id}>
            <Link to={p.link}>{p.name}</Link>

            {p.sub && (
              <ul className="info-sub-list">
                {p.sub.map((sub, subId) => (
                  <li key={subId}>
                    <Link to={sub.link}>{sub.name}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserMenu;