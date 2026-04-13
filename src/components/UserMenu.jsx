import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Link } from 'react-router-dom';


const UserMenu = ({ userClose }) => {
  const mypage = [
    { link: "/order", name: '주문/배송' },
    { link: "/wish", name: '위시리스트' },
    {
      link: "/mypage", name: '내 정보관리',
      sub: [
        { link: "/mypage", name: "회원정보 수정" },
        { link: "/mypage", name: "회원 탈퇴" },
      ]
    }
  ]

  const { user, onLogout } = useAuthStore();

  return (

    <div>
      <p className='user-img'><Link to="/"><img src="./images/logo-icon/main-logo-black.png" alt="" /></Link></p>
      <p className='user-name'><strong>{user?.name}</strong> 님 환영합니다!</p>
      <p className='close-btn' onClick={userClose}><img src="./images/logo-icon/close-btn-black.png" alt="" /></p>

      <button className='logout-btn' onClick={onLogout}>
        로그아웃
      </button>

      <div className='line'></div>

      <ul className="info-list">
        {mypage.map((p, id) => (
          <Link to={`${p.link}`}>
          <li key={id}>
            {p.name}
            {p.sub && (
              <ul className='info-sub-list'>
                {p.sub.map((sub, id) => (
                  <li key={id}>
                    {sub.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
          </Link>
        ))}
      </ul>
    </div>
  )
}

export default UserMenu