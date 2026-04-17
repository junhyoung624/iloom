import React from 'react'
import { Link } from 'react-router-dom'

const MainMenu = ({ menus, isHover, isScrolled, onSend, onEnter }) => {
  const tabMenu = [
    { key: "new", label: "신제품" },
    { key: "BestSeller", label: "베스트셀러" },
    { key: "magazine", label: "매거진" },
    { key: "series", label: "시리즈" },
    { key: "store-info", label: "매장안내" },
    { key: "event", label: "이벤트/뉴스" },
    { key: "notice", label: "공지사항" },
    { key: "company-info", label: "회사소개" }
  ]

  return (
    <div
      className={`main-menu-wrap ${isHover ? 'active' : ''} ${isScrolled ? 'scrolled' : ''}`}
      onMouseEnter={onEnter}
      onMouseLeave={onSend}
    >
      <ul className='main-tab-menu'>
        {tabMenu.map((tab) => (
          <li key={tab.key}>
            <Link to={`/${tab.key}`}>{tab.label}</Link>
          </li>
        ))}
      </ul>

      <ul className='main-menu'>
        {menus.map((menu, id) => (
          <li key={id} className='main-list'>
            {menu.subMenu?.length > 0 ? (
              <>
                <Link to={menu.link}>{menu.name}</Link>
                <ul className="sub">
                  {menu.subMenu.map((s, id) => (
                    <li key={id} className='sub-list'>
                      {s.thirdMenu?.length > 0 ? (
                        <>
                          <Link to={s.link}>{s.name}</Link>
                          <ul className="third">
                            {s.thirdMenu.map((third, id) => (
                              <li key={id}>
                                <Link to={third.link}>{third.name}</Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <Link to={s.link}>{s.name}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link to={menu.link}>{menu.name}</Link>
            )}
          </li>
        ))}
      </ul>

      <div className="menu-img-wrap">
        <div className="img-box">
          <img src="./images/menu-img.png" alt="" />
        </div>
        <div className="text-box">
          <p>가장 개인적인 공간을 위한, 가장 특별한 선택</p>
          <img src="./images/logo-icon/main-logo-white.png" alt="" />
          <p className='magazine-button'>
            <Link to="/magazine">매거진 보러가기</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default MainMenu