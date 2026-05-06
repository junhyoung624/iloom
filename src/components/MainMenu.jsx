import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const MainMenu = ({ menus, isHover, isScrolled, onSend, onEnter, isMobileOpen, onMobileClose }) => {
  const [openMenu, setOpenMenu] = useState(null)

  const tabMenu = [
    { key: "new", label: "신제품" },
    { key: "BestSeller", label: "베스트셀러" },
    { key: "series", label: "시리즈" },
    { key: "store-info", label: "매장안내" },
    { key: "magazine", label: "매거진" },
    { key: "magazine", label: "이벤트" },
    { key: "notice", label: "공지사항" },
    { key: "companypage", label: "회사소개" }
  ]

  return (
    <>
      <div
        className={`main-menu-wrap ${isHover ? 'active' : ''} ${isScrolled ? 'scrolled' : ''}`}
        onMouseEnter={onEnter}
        onMouseLeave={onSend}
      >
        <ul className='main-tab-menu'>
          {tabMenu.map((tab, id) => (
            <li key={id}>
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
      </div >

      {/* 모바일/태블릿 드로어 메뉴 */}
      <div div className={`mobile-menu-drawer ${isMobileOpen ? 'active' : ''}`
      } style={{ display: 'flex' }}>
        <div className="mobile-menu-header">
          <img src="/images/logo-icon/main-logo-white.png" alt="iloom" style={{ filter: 'invert(1)', width: '80px' }} />
          <button className="mobile-menu-close" onClick={onMobileClose}>✕</button>
        </div>

        <ul className="mobile-main-list">
          {menus.map((menu, id) => (
            <li key={id}>
              <button
                className="mobile-main-item"
                onClick={() => setOpenMenu(openMenu === id ? null : id)}
              >
                <span>{menu.name}</span>
                {menu.subMenu?.length > 0 && (
                  <span className={`mobile-arrow ${openMenu === id ? 'open' : ''}`}>›</span>
                )}
              </button>

              {menu.subMenu?.length > 0 && (
                <AnimatePresence initial={false}>
                  {openMenu === id && (
                    <motion.ul
                      key={`submenu-${id}`}
                      className="mobile-sub-list"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{
                        overflow: 'hidden',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        transformOrigin: 'top'
                      }}
                    >
                      {menu.subMenu.map((s, sid) => (
                        <li key={sid}>
                          <Link to={s.link} onClick={onMobileClose}>
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              )}
            </li>
          ))}
        </ul>

        <ul className="mobile-tab-list">
          {tabMenu.map((tab, id) => (
            <li key={id}>
              <Link to={`/${tab.key}`} onClick={onMobileClose}>{tab.label}</Link>
            </li>
          ))}
        </ul>
      </div >
    </>
  )
}

export default MainMenu