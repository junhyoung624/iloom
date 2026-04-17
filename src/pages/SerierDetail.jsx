import React, { useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { seriesListEn } from '../data/seriesData'
import { productData } from '../data/productData'
import SubCard from '../components/SubCard'
import "./scss/seriesdetail.scss"

export default function SeriesDetail() {
    const { slug } = useParams()

    const currentSeries = seriesListEn.find((item) => item.slug === slug)

    const seriesProducts = useMemo(() => {
        if (!currentSeries) return []

        return productData.filter((product) =>
            product.series?.startsWith(currentSeries.nameKo)
        )
    }, [currentSeries])

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

    const listRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1)
    const itemPage = 20;
    const totalPages = Math.ceil(seriesProducts.length / itemPage);

    const pageItem = seriesProducts.slice(
        (currentPage - 1) * itemPage,
        currentPage * itemPage
    )

    const pageTop = (page) => {
        setCurrentPage(page);
        listRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    return (
        <section className="series-detail-page">
            <div className="series-detail-head">
                <div className="series-detail-visual" ref={listRef}>
                    <img src={bannerSrc} alt={currentSeries.nameKo} />
                </div>

            </div>

            <ul className="breadcrumb-list">
                <li>
                    <Link to="/"><img src="/images/logo-icon/home-icon.png" alt="" /></Link>
                </li>
                <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
                <li>
                    <Link to={`/series`}> series</Link>
                </li>
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


                <div className="series-product-head">
                    <h3>{currentSeries.nameKo} 시리즈 상품</h3>
                </div>

                {seriesProducts.length > 0 ? (
                    <div className="series-product-grid">
                        {pageItem.map((item) => (
                            <Link
                                key={item.id}
                                to={`/product/${item.id}`}
                                className="series-product-link"
                            >
                                <SubCard key={item.id} item={item} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="series-empty">
                        등록된 상품이 없습니다.
                    </p>
                )}
            </div>

            <ul className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page}>
                        <button
                            className={currentPage === page ? "active" : ""}
                            onClick={() => pageTop(page)}
                        >
                            {page}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    )
}