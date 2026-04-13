import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import "./scss/searchdropdown.scss"

export default function SearchDropdown() {
    const { items } = useProductStore()
    const [activeMenu, setActiveMenu] = useState("md")

    const mdItems = useMemo(() => {
        return items.filter(item => item.mdPick).slice(0, 5)
    }, [items])

    const bestItems = useMemo(() => {
        return items.filter(item => item.BestSeller).slice(0, 5)
    }, [items])

    const newItems = useMemo(() => {
        return items.filter(item => item.new).slice(0, 5)
    }, [items])

    const mdPickCount = useMemo(() => {
        return items.filter(item => item.mdPick).length
    }, [items])

    const bestCount = useMemo(() => {
        return items.filter(item => item.BestSeller).length
    }, [items])

    const newCount = useMemo(() => {
        return items.filter(item => item.new).length
    }, [items])

    const currentItems =
        activeMenu === "md"
            ? mdItems
            : activeMenu === "best"
                ? bestItems
                : newItems

    return (
        <div className="search-dropdown-inner">
            <div className="search-tab">
                <input type="text" placeholder="검색어를 입력하세요" />
                <button type="button">검색</button>
            </div>

            <div className="category-box">
                <div className="cate-left">
                    <button
                        type="button"
                        className={activeMenu === "md" ? "active" : ""}
                        onClick={() => setActiveMenu("md")}
                    >
                        MD Pick
                        {/* <span>{mdPickCount}</span> */}
                    </button>

                    <button
                        type="button"
                        className={activeMenu === "best" ? "active" : ""}
                        onClick={() => setActiveMenu("best")}
                    >
                        인기제품
                        {/* <span>{bestCount}</span> */}
                    </button>

                    <button
                        type="button"
                        className={activeMenu === "new" ? "active" : ""}
                        onClick={() => setActiveMenu("new")}
                    >
                        신제품
                        {/* <span>{newCount}</span> */}
                    </button>
                </div>

                <div className="cate-right">
                    <div className="keyword-list">
                        {currentItems.map(item => (
                            <Link
                                to={`/product/${item.id}`}
                                key={item.id}
                                className="keyword-item"
                            >
                                <span>{item.name}</span>
                                <strong>{item.price}원</strong>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}