import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom';


const UserMenu = ({ userClose }) => {
  const mypage = [
    { link: "/order", name: '주문/배송' },
    { link: "/wishlist", name: '위시리스트' },
    {
      link: "/mypage", name: '내 정보관리',
      sub: [
        { link: "/mypage", name: "회원정보 수정" },
        { link: "/leavepage", name: "회원 탈퇴" },
      ]
    }
  ]

  const navigate = useNavigate();

  const { user, onLogout } = useAuthStore();

  const handleLogout = () => {
    onLogout();
    navigate("/")
  }

  return (

    <div>
      <p className='user-img'><Link to="/"><img src="./images/logo-icon/main-logo-black.png" alt="" /></Link></p>
      <p className='user-name'><strong>{user?.name}</strong> 님 환영합니다!</p>
      <p className='close-btn' onClick={userClose}><img src="./images/logo-icon/close-btn-black.png" alt="" /></p>

      <button className='logout-btn' onClick={handleLogout}>
        로그아웃
      </button>

      <div className='line'></div>

      <ul className="info-list">
        {mypage.map((p, id) => (
          <li key={id}>
            <Link to={`${p.link}`}>{p.name}</Link>

            {
              p.sub && (
                <ul className='info-sub-list'>
                  {p.sub.map((sub, subId) => (
                    <li key={subId}>
                      <Link to={sub.link}>{sub.name}</Link>
                    </li>
                  ))}
                </ul>
              )
            }
          </li >
        ))}
      </ul >
    </div >
  )
}

export default UserMenu