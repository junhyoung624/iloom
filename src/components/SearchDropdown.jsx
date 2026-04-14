import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import "./scss/searchdropdown.scss"

export default function SearchDropdown({ isSearchOpen }) {
    const { items, searchWordAll, onSetSearchWordAll } = useProductStore()
    const [activeMenu, setActiveMenu] = useState("md")
    const [hoveredItem, setHoveredItem] = useState(null)
    const navigate = useNavigate()

    const keyword = searchWordAll.trim().toLowerCase()
    const isSearching = keyword !== ""

    const cateItems = useMemo(() => {
        if (!isSearching) return []

        return items
            .filter((item) => item.name?.toLowerCase().includes(keyword))
            .slice(0, 8)
    }, [items, keyword, isSearching])

    const mdItems = useMemo(() => {
        return items.filter((item) => item.mdPick).slice(0, 8)
    }, [items])

    const bestItems = useMemo(() => {
        return items.filter((item) => item.BestSeller).slice(0, 8)
    }, [items])

    const newItems = useMemo(() => {
        return items.filter((item) => item.new).slice(0, 8)
    }, [items])

    const currentItems =
        activeMenu === "md"
            ? mdItems
            : activeMenu === "best"
                ? bestItems
                : newItems

    const displayItems = isSearching ? cateItems : currentItems

    useEffect(() => {
        setHoveredItem(displayItems[0] || null)
    }, [displayItems])

    const handleSearchAll = () => {
        navigate("/searchpage")
    }

    return (
        <div
            className={`search-dropdown ${isSearchOpen ? "active" : ""}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="search-dropdown-inner">
                <div className="search-tab">
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchWordAll}
                        onChange={(e) => onSetSearchWordAll(e.target.value)}
                    />
                    <button type="button" onClick={handleSearchAll}>
                        검색
                    </button>
                </div>

                <div className="category-box">
                    <div className="cate-left">
                        {!isSearching && (
                            <>
                                <button
                                    type="button"
                                    className={activeMenu === "md" ? "active" : ""}
                                    onClick={() => setActiveMenu("md")}
                                >
                                    MD Pick
                                </button>

                                <button
                                    type="button"
                                    className={activeMenu === "best" ? "active" : ""}
                                    onClick={() => setActiveMenu("best")}
                                >
                                    인기제품
                                </button>

                                <button
                                    type="button"
                                    className={activeMenu === "new" ? "active" : ""}
                                    onClick={() => setActiveMenu("new")}
                                >
                                    신제품
                                </button>
                            </>
                        )}
                    </div>

                    <div className="cate-right">
                        <div className="keyword-list-wrap">
                            <div className="keyword-list">
                                {displayItems.map((item) => (
                                    <Link
                                        to={`/product/${item.id}`}
                                        key={item.id}
                                        className={`keyword-item ${hoveredItem?.id === item.id ? "active" : ""}`}
                                        onMouseEnter={() => setHoveredItem(item)}
                                    >
                                        <span>{item.name}</span>
                                    </Link>
                                ))}

                                {isSearching && displayItems.length === 0 && (
                                    <div className="no-result">
                                        검색 결과가 없습니다.
                                    </div>
                                )}
                            </div>

                            <div className="keyword-preview">
                                {hoveredItem && (
                                    <Link
                                        to={`/product/${hoveredItem.id}`}
                                        className="keyword-preview-link"
                                    >
                                        <div className="preview-img">
                                            <img
                                                src={hoveredItem.productImages?.[0]}
                                                alt={hoveredItem.name}
                                            />
                                            <img
                                                src={hoveredItem.productImages?.[1]}
                                                alt={hoveredItem.name}
                                            />
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}