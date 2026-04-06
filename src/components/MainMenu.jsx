import React from 'react'
import { Link } from 'react-router-dom'

const MainMenu = () => {
  const menus = [
    { key: "bedroom", label: "침실" },
    { key: "livingroom", label: "거실" },
    { key: "kids", label: "키즈룸" },
    { key: "student", label: "학생방" },
    { key: "light", label: "조명" }
  ]

  const tabMenu = [
    {key: "new-product", label: "신제품"},
    {key: "best-seller", label: "베스트셀러"},
    {key: "magazine", label: "매거진"},
    {key: "series", label: "시리즈"},
    {key: "store-info", label: "매장안내"},
    {key: "event", label: "이벤트/뉴스"},
    {key: "notice", label: "공지사항"},
    {key: "company-info", label: "회사소개"}
  ]
  return (
    <>
    <ul className='main-tab-menu'>
      {tabMenu.map((tab) => <li key={tab.key}><Link to={`./${tab.key}`}>{tab.label}</Link></li>)}
    </ul>
    <ul className='main-menu'>
      
      {menus.map((menu) => <li key={menu.key}><Link to={`./${menu.key}`} >{menu.label}</Link></li>)}
    </ul>
    </>
  )
}

export default MainMenu