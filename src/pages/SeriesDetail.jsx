import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { seriesListEn } from '../data/seriesData'
import { productData } from '../data/productData'
import SubCard from '../components/SubCard'
import "./scss/seriesdetail.scss"
import "../pages/scss/subPage.scss"
import ButtonTabs from '../components/common/ButtonTabs'
import SubPageEmptyState from '../components/SubPageEmptyState'

export default function SeriesDetail() {
    const { slug } = useParams()

    const currentSeries = seriesListEn.find((item) => item.slug === slug)

    const baseCateItems = useMemo(() => {
        if (!currentSeries) return []
        return productData.filter((product) =>
            product.series?.startsWith(currentSeries.nameKo)
        )
    }, [currentSeries])

    // ─── 가격 범위 ─────────────────────────────────────────────────
    const parsePrice = (price) => Number(String(price).replace(/[^\d]/g, ""))

    const priceList = baseCateItems.map(item => parsePrice(item.price))
    const minPrice = priceList.length ? Math.min(...priceList) : 0
    const maxPrice = priceList.length ? Math.max(...priceList) : 0

    // ─── 시리즈 내 카테고리 탭 ────────────────────────────────────
    const tabMenu = useMemo(() => {
        return ["전체", ...new Set(baseCateItems.map(item => item.originalCategory).filter(Boolean))]
    }, [baseCateItems])

    const [selectTab, setSelectTab] = useState("전체")

    useEffect(() => { setSelectTab("전체") }, [slug])

    const tabFilteredItems = useMemo(() => {
        return selectTab === "전체"
            ? baseCateItems
            : baseCateItems.filter(item => item.originalCategory === selectTab)
    }, [baseCateItems, selectTab])

    // ─── 시리즈 옵션 ───────────────────────────────────────────────
    const seriesOptions = useMemo(() => {
        return [...new Set(tabFilteredItems.map(item => item.series).filter(Boolean))]
    }, [tabFilteredItems])

    // ─── 필터 state ────────────────────────────────────────────────
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [selectedSeries, setSelectedSeries] = useState([])
    const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
    const [featureFilters, setFeatureFilters] = useState({
        bestseller: false, mdPick: false, newItem: false,
    })
    const [sortType, setSortType] = useState("price")
    const [sortOrder, setSortOrder] = useState("desc")

    useEffect(() => {
        setPriceRange([minPrice, maxPrice])
        setSelectedSeries([])
        setFeatureFilters({ bestseller: false, mdPick: false, newItem: false })
        setSortType("price")
        setSortOrder("desc")
    }, [slug, selectTab, minPrice, maxPrice])

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") setIsFilterOpen(false) }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    const toggleSeries = (s) => {
        setSelectedSeries(prev =>
            prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s]
        )
    }
    const handleFeatureFilter = (key) => {
        setFeatureFilters(prev => ({ ...prev, [key]: !prev[key] }))
    }
    const resetFilter = () => {
        setSelectedSeries([])
        setPriceRange([minPrice, maxPrice])
        setFeatureFilters({ bestseller: false, mdPick: false, newItem: false })
    }
    const onSetSort = (type, order) => {
        setSortType(type)
        setSortOrder(order)
    }

    // ─── 필터 + 정렬 적용 ──────────────────────────────────────────
    let cateItems = tabFilteredItems.filter(item => {
        const ip = parsePrice(item.price)
        return (
            ip >= priceRange[0] && ip <= priceRange[1] &&
            (selectedSeries.length === 0 || selectedSeries.includes(item.series)) &&
            (!featureFilters.bestseller || Number(item.ranking) > 0) &&
            (!featureFilters.mdPick || item.mdPick === true) &&
            (!featureFilters.newItem || Number(item.new) === 1)
        )
    })

    if (sortType) {
        cateItems = [...cateItems].sort((a, b) => {
            switch (sortType) {
                case "price":
                    return sortOrder === "asc"
                        ? parsePrice(a.price) - parsePrice(b.price)
                        : parsePrice(b.price) - parsePrice(a.price)
                case "ranking": return b.ranking - a.ranking
                case "new": return Number(b.new) - Number(a.new)
                case "name": return a.name.localeCompare(b.name)
                default: return 0
            }
        })
    }

    // ─── 페이지네이션 ──────────────────────────────────────────────
    const listRef = useRef(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemPage = 20
    const totalPages = Math.ceil(cateItems.length / itemPage)
    const pageGroupSize = 5
    const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages)
    const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
    const pageItem = cateItems.slice((currentPage - 1) * itemPage, currentPage * itemPage)

    useEffect(() => {
        setCurrentPage(1)
    }, [slug, selectTab, selectedSeries, priceRange, featureFilters, sortType, sortOrder])

    const pageTop = (page) => {
        setCurrentPage(page)
        listRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // ─── 활성 필터 태그 ────────────────────────────────────────────
    const formatWon = (v) => `${Math.floor(v / 10000).toLocaleString()}만원`
    const isDefaultPriceRange = priceRange[0] === minPrice && priceRange[1] === maxPrice

    const activeFilterTags = [
        ...selectedSeries.map(s => ({ key: `series-${s}`, label: s, onRemove: () => toggleSeries(s) })),
        ...(!isDefaultPriceRange ? [{
            key: "price-range",
            label: `${formatWon(priceRange[0])} ~ ${formatWon(priceRange[1])}`,
            onRemove: () => setPriceRange([minPrice, maxPrice]),
        }] : []),
        ...(featureFilters.bestseller ? [{ key: "feature-bestseller", label: "BESTSELLER", onRemove: () => handleFeatureFilter("bestseller") }] : []),
        ...(featureFilters.mdPick ? [{ key: "feature-mdpick", label: "MD PICK", onRemove: () => handleFeatureFilter("mdPick") }] : []),
        ...(featureFilters.newItem ? [{ key: "feature-new", label: "NEW", onRemove: () => handleFeatureFilter("newItem") }] : []),
    ]
    const activeFilterCount = activeFilterTags.length

    // ─── 시리즈 없음 ───────────────────────────────────────────────
    if (!currentSeries) {
        return (
            <section className="series-detail-page">
                <div className="inner">
                    <h2>시리즈를 찾을 수 없습니다.</h2>
                    <Link to="/">홈으로 돌아가기</Link>
                </div>
            </section>
        )
    }

    const bannerSrc = currentSeries.bannerImage?.replace("./images", "/images")

    return (
        <div className="sub-page-wrap">

            {/* ── 배너 ───────────────────────────────────────────── */}
            <section className="series-detail-page">
                <div className="series-detail-head">
                    <div className="series-detail-visual">
                        <img src={bannerSrc} alt={currentSeries.nameKo} />
                    </div>
                </div>
            </section>

            {/* ── 필터 딤 + 패널 ─────────────────────────────────── */}
            <div
                className={`sub-filter-dim ${isFilterOpen ? "active" : ""}`}
                onClick={() => setIsFilterOpen(false)}
            />

            <div className={`sub-filter-panel ${isFilterOpen ? "active" : ""}`}>
                <div className="sub-filter-panel-head">
                    <h2>필터</h2>
                    <button type="button" onClick={() => setIsFilterOpen(false)}>×</button>
                </div>

                {/* 가격 */}
                <div className="sub-filter-section">
                    <div className="sub-filter-title-row"><h3>가격</h3></div>
                    <div className="sub-price-filter-box">
                        <div className="sub-range-inputs">
                            <div
                                className="sub-range-track"
                                style={{
                                    left: `${maxPrice === minPrice ? 0 : ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                                    right: `${maxPrice === minPrice ? 0 : 100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                                }}
                            />
                            <input
                                type="range" className="sub-range-min"
                                min={minPrice} max={maxPrice} step={10000} value={priceRange[0]}
                                onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                            />
                            <input
                                type="range" className="sub-range-max"
                                min={minPrice} max={maxPrice} step={10000} value={priceRange[1]}
                                onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                            />
                        </div>
                        <div className="sub-price-labels">
                            <span>{formatWon(priceRange[0])}</span>
                            <span>{formatWon(priceRange[1])}</span>
                        </div>
                    </div>
                </div>

                {/* 시리즈 */}
                <div className="sub-filter-section">
                    <div className="sub-filter-title-row"><h3>시리즈</h3></div>
                    <ul className="sub-series-filter-list">
                        {seriesOptions.map(s => (
                            <li key={s}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedSeries.includes(s)}
                                        onChange={() => toggleSeries(s)}
                                    />
                                    <span>{s}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 상품 구분 */}
                <div className="sub-filter-section">
                    <div className="sub-filter-title-row"><h3>상품 구분</h3></div>
                    <ul className="sub-feature-filter-list">
                        <li>
                            <label>
                                <input type="checkbox" checked={featureFilters.bestseller} onChange={() => handleFeatureFilter("bestseller")} />
                                <span>BESTSELLER</span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="checkbox" checked={featureFilters.mdPick} onChange={() => handleFeatureFilter("mdPick")} />
                                <span>MD PICK</span>
                            </label>
                        </li>
                        <li>
                            <label>
                                <input type="checkbox" checked={featureFilters.newItem} onChange={() => handleFeatureFilter("newItem")} />
                                <span>NEW</span>
                            </label>
                        </li>
                    </ul>
                </div>

                <div className="sub-filter-bottom-btns">
                    <button type="button" className="sub-reset-btn" onClick={resetFilter}>초기화</button>
                    <button type="button" className="sub-apply-btn" onClick={() => setIsFilterOpen(false)}>적용하기</button>
                </div>
            </div>

            {/* ── 본문 ───────────────────────────────────────────── */}
            <div className="sub-page">
                <ul className="breadcrumb-list">
                    <li>
                        <Link to="/"><img src="/images/logo-icon/home-icon.png" alt="" /></Link>
                    </li>
                    <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
                    <li><Link to="/series">series</Link></li>
                    {currentSeries.nameKo && (
                        <>
                            <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
                            <li>
                                <Link to={`/series/${currentSeries.nameKo}`}>{currentSeries.nameKo}</Link>
                            </li>
                        </>
                    )}
                </ul>

                <div className="inner">
                    <h1 ref={listRef}>{currentSeries.nameKo} 시리즈</h1>

                    {/* 카테고리 탭 */}
                    {tabMenu.length > 1 && (
                        <ButtonTabs
                            items={tabMenu}
                            activeKey={selectTab}
                            onChange={setSelectTab}
                            ariaLabel="series product category tabs"
                        />
                    )}

                    <div className="sub-product-list-wrap">

                        {/* ── 정렬 + 필터 버튼 ─────────────────── */}
                        <div className="sub-filter-sort-wrap">
                            <div className="sub-filter-sort-btn-group">
                                <button
                                    className={sortType === "price" && sortOrder === "desc" ? "active" : ""}
                                    onClick={() => onSetSort("price", "desc")}
                                >가격 높은순</button>
                                <button
                                    className={sortType === "price" && sortOrder === "asc" ? "active" : ""}
                                    onClick={() => onSetSort("price", "asc")}
                                >가격 낮은순</button>
                                <button
                                    className={sortType === "ranking" ? "active" : ""}
                                    onClick={() => onSetSort("ranking", "desc")}
                                >인기순</button>
                                <button
                                    className={sortType === "new" ? "active" : ""}
                                    onClick={() => onSetSort("new", "desc")}
                                >신상품순</button>
                                <button
                                    className={sortType === "name" ? "active" : ""}
                                    onClick={() => onSetSort("name", "asc")}
                                >상품명순</button>
                            </div>

                            <button
                                type="button"
                                className="sub-filter-open-btn"
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <img src="/images/logo-icon/ham-black.png" alt="filter" className="filter" />
                                필터
                                {activeFilterCount > 0 && (
                                    <span className="sub-filter-count-badge">{activeFilterCount}</span>
                                )}
                            </button>
                        </div>

                        {/* ── 활성 필터 태그 ────────────────────── */}
                        {activeFilterTags.length > 0 && (
                            <div className="sub-active-filter-wrap">
                                <div className="sub-active-filter-tags">
                                    {activeFilterTags.map(tag => (
                                        <button
                                            key={tag.key}
                                            type="button"
                                            className="sub-active-filter-tag"
                                            onClick={tag.onRemove}
                                        >
                                            <span>{tag.label}</span>
                                            <b>x</b>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className="sub-active-filter-reset"
                                    onClick={resetFilter}
                                >
                                    전체 초기화
                                </button>
                            </div>
                        )}

                        {/* ── 빈 상태 ──────────────────────────── */}
                        {pageItem.length === 0 && (
                            <SubPageEmptyState
                                className="subpage-empty-state"
                                imageSrc="/images/logo-icon/no-image.svg"
                                imageAlt="filter empty"
                                title="조건에 맞는 상품이 없어요"
                                actionLabel="필터 초기화"
                                onAction={resetFilter}
                            />
                        )}

                        {/* ── 상품 목록 ────────────────────────── */}
                        <ul className="sub-product-list">
                            {pageItem.map((item) => (
                                <li key={item.id}>
                                    <SubCard item={item} showCompare={true} />
                                </li>
                            ))}
                        </ul>

                        {/* ── 페이지네이션 ─────────────────────── */}
                        <ul className="pagination">
                            {startPage > 1 && (
                                <li>
                                    <button onClick={() => pageTop(startPage - 1)}>{"<"}</button>
                                </li>
                            )}
                            {visiblePages.map(page => (
                                <li key={page}>
                                    <button
                                        className={currentPage === page ? "active" : ""}
                                        onClick={() => pageTop(page)}
                                    >
                                        {page}
                                    </button>
                                </li>
                            ))}
                            {endPage < totalPages && (
                                <li>
                                    <button onClick={() => pageTop(endPage + 1)}>{">"}</button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
