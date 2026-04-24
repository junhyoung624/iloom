import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import SubCard from '../components/SubCard'

export default function FurniturePage() {
    const { items, sortType, sortOrder, onSetSort } = useProductStore()
    const location = useLocation()
    const listRef = useRef(null);

    const params = new URLSearchParams(location.search)
    const rawKeyword = params.get("furniture") || ""
    const keyword = rawKeyword.toLowerCase()

    let cateItems = items.filter((item) =>
        item.name?.toLowerCase().includes(keyword) ||
        item.category2?.toLowerCase().includes(keyword) ||
        item.originalCategory?.toLowerCase().includes(keyword) ||
        item.category3.toLowerCase().includes(keyword)
    )



    if (sortType) {
        cateItems = [...cateItems].sort((a, b) => {
            switch (sortType) {
                case "price":
                    const aPrice = Number(String(a.price).replace(/,/g, ""));
                    const bPrice = Number(String(b.price).replace(/,/g, ""));
                    return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
                case "ranking":
                    return b.ranking - a.ranking
                case "new":
                    return Number(b.new) - Number(a.new)
                case "name":
                    return a.name.localeCompare(b.name)
                default:
                    return 0;
            }
        })
    }

    const [currentPage, setCurrentPage] = useState(1)
    const itemPage = 20;
    const totalPages = Math.ceil(cateItems.length / itemPage);

    const pageGroupSize = 5;
    const startPage = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    const visiblePages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    const pageItem = cateItems.slice(
        (currentPage - 1) * itemPage,
        currentPage * itemPage
    )

    const pageTop = (page) => {
        setCurrentPage(page);
        listRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [location.pathname])



    return (
        <section className="sub-page">
            <ul className="breadcrumb-list">
                <li>
                    <Link to="/"><img src="/images/logo-icon/home-icon.png" alt="" /></Link>
                </li>
                <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
                <li>
                    <Link to={`/furniturepage?furniture=${keyword}`}>{keyword}</Link>
                </li>
            </ul>
            <div className="inner">
                <div className="search-head">
                    <h2 className="search-title" ref={listRef}>
                        {rawKeyword} 전체보기
                    </h2>
                    <p className="search-count">
                        {cateItems.length}개의 상품이 있습니다.
                    </p>
                </div>
                <div className="line"></div>

                <div className="sub-product-list-wrap">
                    <div className="sort-wrap">
                        <button className={sortType === "price" ? "active" : ""} onClick={() => onSetSort("price", "desc")}>가격순</button>
                        <button className={sortType === "ranking" ? "active" : ""} onClick={() => onSetSort("ranking", "asc")}>인기순</button>
                        <button className={sortType === "new" ? "active" : ""} onClick={() => onSetSort("new", "asc")}>신상품순</button>
                        <button className={sortType === "name" ? "active" : ""} onClick={() => onSetSort("name", "asc")}>상품명순</button>
                    </div>
                    <ul className="sub-product-list">
                        {pageItem.map((item) => (
                            <li key={item.id}>
                                <Link to={`/product/${item.id}`}>
                                    <SubCard key={item.id} item={item} />
                                </Link>
                            </li>
                        ))}
                    </ul>

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
        </section>
    )
}