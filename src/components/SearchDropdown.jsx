import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import "./scss/searchdropdown.scss"

const FALLBACK_IMAGE = '/images/no-image.png'

const getImage = (item, index) => {
    return item?.productImages?.[index] || item?.productImages?.[0] || FALLBACK_IMAGE
}

export default function SearchDropdown({ isSearchOpen, setIsSearchOpen, isScrolled }) {
    const { items, searchWordAll, onSetSearchWordAll } = useProductStore()
    const [activeMenu, setActiveMenu] = useState("md")
    const [hoveredItem, setHoveredItem] = useState(null)
    const [previewDefaultSrc, setPreviewDefaultSrc] = useState(FALLBACK_IMAGE)
    const [previewHoverSrc, setPreviewHoverSrc] = useState(FALLBACK_IMAGE)

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

    // const handleKeyDown = (e) => {
    //     if (e.key === "Enter") handleSearchAll()
    // }

    const currentItems =
        activeMenu === "md"
            ? mdItems
            : activeMenu === "best"
                ? bestItems
                : newItems

    useEffect(() => {
        if (isSearching) {
            setHoveredItem(cateItems[0] || null)
        } else {
            setHoveredItem(currentItems[0] || null)
        }
    }, [isSearching, cateItems, currentItems])

    useEffect(() => {
        if (!hoveredItem) {
            setPreviewDefaultSrc(FALLBACK_IMAGE)
            setPreviewHoverSrc(FALLBACK_IMAGE)
            return
        }

        const defaultImage = getImage(hoveredItem, 0)
        const hoverImage = getImage(hoveredItem, 1)

        setPreviewDefaultSrc(defaultImage)
        setPreviewHoverSrc(hoverImage)
    }, [hoveredItem])

    useEffect(() => {
        if (!isSearchOpen) {
            onSetSearchWordAll("")
        }
    }, [isSearchOpen, onSetSearchWordAll])

    const handleSearchAll = () => {
        const keyword = searchWordAll.trim()

        if (!keyword) return

        setIsSearchOpen(false)
        navigate(`/searchpage?keyword=${encodeURIComponent(keyword)}`)
        onSetSearchWordAll("")
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearchAll()
        }

        if (e.key === "Escape") {
            setIsSearchOpen(false)
            onSetSearchWordAll("")
        }
    }

    const handleLinkClick = () => {
        setIsSearchOpen(false)
        onSetSearchWordAll("")
    }

    return (
        <div
            className={`search-dropdown ${isSearchOpen ? "active" : ""} ${!isScrolled ? "dark" : ""}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="search-dropdown-inner">
                <div className="search-tab">
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchWordAll}
                        onChange={(e) => onSetSearchWordAll(e.target.value)}
                        onKeyDown={handleKeyDown}
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
                            <div className="keyword-list" key={isSearching ? keyword : activeMenu}>
                                {!isSearching && currentItems.map((item) => (
                                    <Link
                                        to={`/product/${item.id}`}
                                        key={item.id}
                                        className={`keyword-item ${hoveredItem?.id === item.id ? "active" : ""}`}
                                        onMouseEnter={() => setHoveredItem(item)}
                                        onClick={handleLinkClick}
                                    >
                                        <span>{item.name}</span>
                                    </Link>
                                ))}

                                {isSearching && cateItems.map((item) => (
                                    <Link
                                        to={`/product/${item.id}`}
                                        key={item.id}
                                        className={`keyword-item ${hoveredItem?.id === item.id ? "active" : ""}`}
                                        onMouseEnter={() => setHoveredItem(item)}
                                        onClick={handleLinkClick}
                                    >
                                        <span>{item.name}</span>
                                    </Link>
                                ))}

                                {isSearching && cateItems.length === 0 && (
                                    <div className="no-result">
                                        <img src="/images/logo-icon/iconmonstr-error-lined.svg" alt="" />
                                        검색 결과가 없습니다
                                    </div>
                                )}
                            </div>

                            <div className="keyword-preview">
                                {hoveredItem && (
                                    <Link
                                        to={`/product/${hoveredItem.id}`}
                                        className="keyword-preview-link"
                                        onClick={handleLinkClick}
                                    >
                                        <div className="preview-img">
                                            <img
                                                src={previewDefaultSrc}
                                                alt={hoveredItem.name}
                                                onError={() => setPreviewDefaultSrc(FALLBACK_IMAGE)}
                                            />
                                            <img
                                                src={previewHoverSrc}
                                                alt={hoveredItem.name}
                                                onError={() => setPreviewHoverSrc(previewDefaultSrc || FALLBACK_IMAGE)}
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