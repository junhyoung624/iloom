import React from 'react'
import { useLocation } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import "./scss/searchpage.scss"

export default function SearchPage() {
  const { items } = useProductStore()
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const rawKeyword = params.get("keyword") || ""
  const keyword = rawKeyword.toLowerCase()

  const cateItems = items.filter((item) =>
    item.name?.toLowerCase().includes(keyword)
  )

  return (
    <section className="search-page">
      <div className="inner">
        <div className="search-head">
          <h2 className="search-title">
            <span>'{rawKeyword}'</span> 검색결과
          </h2>
          <p className="search-count">
            {cateItems.length}개의 상품이 검색되었습니다.
          </p>
        </div>

        <div className="search-list">
          {cateItems.map((item) => (
            <div key={item.id}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}