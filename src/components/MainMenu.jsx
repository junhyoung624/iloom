import React from 'react'
import { Link } from 'react-router-dom'

const MainMenu = ({ menus }) => {

  const tabMenu = [
    { key: "new-product", label: "신제품" },
    { key: "best-seller", label: "베스트셀러" },
    { key: "magazine", label: "매거진" },
    { key: "series", label: "시리즈" },
    { key: "store-info", label: "매장안내" },
    { key: "event", label: "이벤트/뉴스" },
    { key: "notice", label: "공지사항" },
    { key: "company-info", label: "회사소개" }
  ]
  return (
    <>
      <ul className='main-tab-menu'>
        {tabMenu.map((tab) => <li key={tab.key}><Link to={`./${tab.key}`}>{tab.label}</Link></li>)}
      </ul>

      
      <ul className='main-menu'>
        {menus.map((menu, id) => (
          <li key={id}>
            {/* 서브메뉴가 있으면 
              <a></a><ul clasName="sub"><li></li></ul> */}
            {/* 없으면 <a></a> */}

              {menu.subMenu?.length > 0 ? (
                <>
                  <Link to={menu.link}>{menu.name}</Link>
                  <ul className="sub">
                    {menu.subMenu.map((s, id) => (
                      <li key={id}>
                        {s.thirdMenu?.length > 0 ? (
                          <>
                            <Link to={s.link}>{s.name}</Link>
                            <ul className="third">
                              {s.thirdMenu.map((third, id) => (
                                <li key={id}><Link to={third.link}>{third.name}</Link></li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <Link to={s.link}>{s.name}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </>) : (
                  <Link to={menu.link}>{menu.name}</Link>
                )}
          </li>
        ))}
      </ul>
    </>
  )
}

export default MainMenu