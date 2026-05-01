import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import "./scss/subPage.scss"
import MdPick from '../components/MdPick'
import SubCard from '../components/SubCard'
import Breadcrumb from '../components/Breadcrumb'


const SubPage = () => {
    const bannerImgData = [
        { category: "침실", imgUrl: "./images/subpage-images/bed-room.jpg" },
        { category: "옷장", imgUrl: "./images/subpage-images/closet.jpg" },
        { category: "주방", imgUrl: "./images/subpage-images/dining-room.jpg" },
        { category: "키즈룸", imgUrl: "./images/subpage-images/kids-room.jpg" },
        { category: "조명", imgUrl: "./images/subpage-images/lighting.jpg" },
        { category: "서재", imgUrl: "./images/subpage-images/library.jpg" },
        { category: "거실", imgUrl: "./images/subpage-images/living-room.jpg" },
        { category: "학생방", imgUrl: "./images/subpage-images/study-room.jpg" },
        { category: "매트리스", imgUrl: "./images/subpage-images/metress.png" }
    ]

    const { items, menus, sortType, sortOrder, onSetSort } = useProductStore()

    const params = useParams()
    const navigate = useNavigate()
    const mainCate = params.originalCategory
    const subCate = params.category2
    const thirdCate = params.category3
    const vaildCategories = menus.map((menu) => menu.name)

    useEffect(() => {
        if (menus.length > 0 && mainCate && !vaildCategories.includes(mainCate)) {
            navigate('/not-found', { replace: true })
        }
    }, [mainCate, menus])

    const location = useLocation()
    const listRef = useRef(null)

    const baseCateItems = items.filter((item) => {
        if (mainCate && item.originalCategory !== mainCate) return false
        if (subCate && item.category2 !== subCate) return false
        if (thirdCate && item.category3 !== thirdCate) return false
        return true
    })

    const mdPick = !subCate && !thirdCate
        ? baseCateItems.filter((md) => md.mdPick === true)
        : []

    const categoryName = thirdCate || subCate || mainCate
    const currentMenu = menus.find((menu) => menu.name === mainCate)

    const currentSubMenu = currentMenu?.subMenu.find((sub) => sub.name === subCate)
    const thirdTab = currentSubMenu?.thirdMenu || []
    const tab = currentMenu?.subMenu || []

    const tabItems = (() => {
        if (!subCate) {
            return [
                { label: "전체", to: `/${mainCate}`, active: !thirdCate },
                ...tab.map((t) => ({
                    label: t.name,
                    to: `/${mainCate}/${t.name}`,
                    active: false
                }))
            ]
        }

        if (thirdTab.length > 0) {
            return [
                { label: "전체", to: `/${mainCate}/${subCate}`, active: !thirdCate },
                ...thirdTab.map((t) => ({
                    label: t.name,
                    to: `/${mainCate}/${subCate}/${t.name}`,
                    active: t.name === thirdCate
                }))
            ]
        }

        return [
            { label: "전체", to: `/${mainCate}`, active: !subCate },
            ...tab.map((t) => ({
                label: t.name,
                to: `/${mainCate}/${t.name}`,
                active: t.name === subCate
            }))
        ]
    })()

    const parsePrice = (price) => Number(String(price).replace(/[^\d]/g, ""))

    const priceList = baseCateItems.map((item) => parsePrice(item.price))
    const minPrice = priceList.length ? Math.min(...priceList) : 0
    const maxPrice = priceList.length ? Math.max(...priceList) : 0

    const seriesOptions = useMemo(() => {
        return [...new Set(baseCateItems.map((item) => item.series).filter(Boolean))]
    }, [baseCateItems])

    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [selectedSeries, setSelectedSeries] = useState([])
    const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
    const [featureFilters, setFeatureFilters] = useState({
        bestseller: false,
        mdPick: false,
        newItem: false,
    })

    useEffect(() => {
        setPriceRange([minPrice, maxPrice])
        setSelectedSeries([])
        setFeatureFilters({
            bestseller: false,
            mdPick: false,
            newItem: false,
        })
    }, [location.pathname, minPrice, maxPrice])

    const toggleSeries = (seriesName) => {
        setSelectedSeries((prev) =>
            prev.includes(seriesName)
                ? prev.filter((v) => v !== seriesName)
                : [...prev, seriesName]
        )
    }

    const handleFeatureFilter = (key) => {
        setFeatureFilters((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    let cateItems = baseCateItems.filter((item) => {
        const itemPrice = parsePrice(item.price)

        const matchPrice =
            itemPrice >= priceRange[0] && itemPrice <= priceRange[1]

        const matchSeries =
            selectedSeries.length === 0 || selectedSeries.includes(item.series)

        const matchBestSeller =
            !featureFilters.bestseller || Number(item.ranking) > 0

        const matchMdPick =
            !featureFilters.mdPick || item.mdPick === true

        const matchNew =
            !featureFilters.newItem || Number(item.new) === 1

        return (
            matchPrice &&
            matchSeries &&
            matchBestSeller &&
            matchMdPick &&
            matchNew
        )
    })

    if (sortType) {
        cateItems = [...cateItems].sort((a, b) => {
            switch (sortType) {
                case "price":
                    return sortOrder === "asc"
                        ? parsePrice(a.price) - parsePrice(b.price)
                        : parsePrice(b.price) - parsePrice(a.price)
                case "ranking":
                    return b.ranking - a.ranking
                case "new":
                    return Number(b.new) - Number(a.new)
                case "name":
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })
    }

    const bannerImg = bannerImgData.find((ban) => ban.category === mainCate)?.imgUrl

    const [currentPage, setCurrentPage] = useState(1)
    const itemPage = 20
    const totalPages = Math.ceil(cateItems.length / itemPage)

    const pageGroupSize = 5
    const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages)

    const visiblePages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    )

    const pageItem = cateItems.slice(
        (currentPage - 1) * itemPage,
        currentPage * itemPage
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [mainCate, subCate, thirdCate, selectedSeries, priceRange, featureFilters, sortType, sortOrder])

    useEffect(() => {
        onSetSort("price", "desc")
    }, [location.pathname])

    const pageTop = (page) => {
        setCurrentPage(page)
        listRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const formatWon = (value) => {
        return `${Math.floor(value / 10000).toLocaleString()}만원`
    }

    const resetFilter = () => {
        setSelectedSeries([])
        setPriceRange([minPrice, maxPrice])
        setFeatureFilters({
            bestseller: false,
            mdPick: false,
            newItem: false,
        })
    }

    const isDefaultPriceRange =
        priceRange[0] === minPrice && priceRange[1] === maxPrice

    const activeFilterTags = [
        ...selectedSeries.map((series) => ({
            key: `series-${series}`,
            label: series,
            onRemove: () => toggleSeries(series),
        })),
        ...(!isDefaultPriceRange ? [{
            key: "price-range",
            label: `${formatWon(priceRange[0])} ~ ${formatWon(priceRange[1])}`,
            onRemove: () => setPriceRange([minPrice, maxPrice]),
        }] : []),
        ...(featureFilters.bestseller ? [{
            key: "feature-bestseller",
            label: "BESTSELLER",
            onRemove: () => handleFeatureFilter("bestseller"),
        }] : []),
        ...(featureFilters.mdPick ? [{
            key: "feature-mdpick",
            label: "MD PICK",
            onRemove: () => handleFeatureFilter("mdPick"),
        }] : []),
        ...(featureFilters.newItem ? [{
            key: "feature-new",
            label: "NEW",
            onRemove: () => handleFeatureFilter("newItem"),
        }] : []),
    ]

    const activeFilterCount = activeFilterTags.length

    return (
        <div className='sub-page-wrap'>
            {!subCate && !thirdCate && (
                <p className='banner-img'>
                    <img src={bannerImg} alt="img" />
                </p>
            )}

            <div
                className={`sub-filter-dim ${isFilterOpen ? "active" : ""}`}
                onClick={() => setIsFilterOpen(false)}
            />

            <div className={`sub-filter-panel ${isFilterOpen ? "active" : ""}`}>
                <div className="sub-filter-panel-head">

                    <h2>필터</h2>
                    <button type="button" onClick={() => setIsFilterOpen(false)}>×</button>
                </div>

                <div className="sub-filter-section">
                    <div className="sub-filter-title-row">
                        <h3>가격</h3>
                    </div>

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
                                type="range"
                                className="sub-range-min"
                                min={minPrice}
                                max={maxPrice}
                                step={10000}
                                value={priceRange[0]}
                                onChange={(e) =>
                                    setPriceRange([
                                        Math.min(Number(e.target.value), priceRange[1]),
                                        priceRange[1]
                                    ])
                                }
                            />

                            <input
                                type="range"
                                className="sub-range-max"
                                min={minPrice}
                                max={maxPrice}
                                step={10000}
                                value={priceRange[1]}
                                onChange={(e) =>
                                    setPriceRange([
                                        priceRange[0],
                                        Math.max(Number(e.target.value), priceRange[0])
                                    ])
                                }
                            />
                        </div>

                        <div className="sub-price-labels">
                            <span>{formatWon(priceRange[0])}</span>
                            <span>{formatWon(priceRange[1])}</span>
                        </div>
                    </div>
                </div>

                <div className="sub-filter-section">
                    <div className="sub-filter-title-row">
                        <h3>시리즈</h3>
                    </div>

                    <ul className="sub-series-filter-list">
                        {seriesOptions.map((seriesName) => (
                            <li key={seriesName}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedSeries.includes(seriesName)}
                                        onChange={() => toggleSeries(seriesName)}
                                    />
                                    <span>{seriesName}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sub-filter-section">
                    <div className="sub-filter-title-row">
                        <h3>상품 구분</h3>
                    </div>

                    <ul className="sub-feature-filter-list">
                        <li>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={featureFilters.bestseller}
                                    onChange={() => handleFeatureFilter("bestseller")}
                                />
                                <span>BESTSELLER</span>
                            </label>
                        </li>

                        <li>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={featureFilters.mdPick}
                                    onChange={() => handleFeatureFilter("mdPick")}
                                />
                                <span>MD PICK</span>
                            </label>
                        </li>

                        <li>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={featureFilters.newItem}
                                    onChange={() => handleFeatureFilter("newItem")}
                                />
                                <span>NEW</span>
                            </label>
                        </li>
                    </ul>
                </div>

                <div className="sub-filter-bottom-btns">
                    <button type="button" className="sub-reset-btn" onClick={resetFilter}>
                        초기화
                    </button>
                    <button
                        type="button"
                        className="sub-apply-btn"
                        onClick={() => setIsFilterOpen(false)}
                    >
                        적용하기
                    </button>
                </div>
            </div>

            <div className="sub-page">
                <ul className="breadcrumb-list">
                    <Breadcrumb mainCate={mainCate} subCate={subCate} thirdCate={thirdCate} />
                </ul>

                <div className="inner">
                    <h1 ref={listRef}>{categoryName}</h1>

                    {tabItems.length > 0 && (
                        <ul className="menu-tab">
                            {tabItems.map((t) => (
                                <li key={t.label} className={t.active ? "active" : ""}>
                                    <Link to={t.to}>{t.label}</Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {mdPick.length > 0 && (
                        <div className="md-pick-wrap">
                            <MdPick mdPick={mdPick} />
                        </div>
                    )}

                    <div className="sub-product-list-wrap">
                        <div className="sub-filter-sort-wrap">
                            <div className="sub-filter-sort-btn-group">
                                <button
                                    className={sortType === "price" && sortOrder === "desc" ? "active" : ""}
                                    onClick={() => onSetSort("price", "desc")}
                                >
                                    가격 높은순
                                </button>
                                <button
                                    className={sortType === "price" && sortOrder === "asc" ? "active" : ""}
                                    onClick={() => onSetSort("price", "asc")}
                                >
                                    가격 낮은순
                                </button>
                                <button
                                    className={sortType === "ranking" ? "active" : ""}
                                    onClick={() => onSetSort("ranking", "desc")}
                                >
                                    인기순
                                </button>
                                <button
                                    className={sortType === "new" ? "active" : ""}
                                    onClick={() => onSetSort("new", "desc")}
                                >
                                    신상품순
                                </button>
                                <button
                                    className={sortType === "name" ? "active" : ""}
                                    onClick={() => onSetSort("name", "asc")}
                                >
                                    상품명순
                                </button>
                            </div>

                            <button

                                type="button"
                                className="sub-filter-open-btn"
                                onClick={() => setIsFilterOpen(true)}
                            >  <img src="/images/logo-icon/ham-black.png" alt="filter" className='filter' />
                                필터
                                {activeFilterCount > 0 && (
                                    <span className="sub-filter-count-badge">{activeFilterCount}</span>
                                )}
                            </button>
                        </div>

                        {activeFilterTags.length > 0 && (
                            <div className="sub-active-filter-wrap">
                                <div className="sub-active-filter-tags">
                                    {activeFilterTags.map((tag) => (
                                        <button
                                            key={tag.key}
                                            type="button"
                                            className="sub-active-filter-tag"
                                            onClick={tag.onRemove}
                                        >
                                            <span>{tag.label}</span>
                                            <b>×</b>
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

                        {pageItem.length === 0 && (
                            <div className="subpage-empty-state">
                                <p>조건에 맞는 상품이 없어요.</p>
                                <button onClick={resetFilter}>필터 초기화</button>
                            </div>
                        )}
                        <ul className="sub-product-list">
                            {pageItem.map((item) => (
                                <li key={item.id}>
                                    <SubCard item={item} showCompare={true} />
                                </li>
                            ))}
                        </ul>

                        <ul className="pagination">
                            {startPage > 1 && (
                                <li>
                                    <button onClick={() => pageTop(startPage - 1)}>{"<"}</button>
                                </li>
                            )}

                            {visiblePages.map((page) => (
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
            <CompareFloatBar />
        </div>
    )
}

export default SubPage