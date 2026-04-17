import React, { useMemo } from 'react'
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

    return (
        <section className="series-detail-page">
            <div className="series-detail-head">
                <div className="series-detail-visual">
                    <img src={bannerSrc} alt={currentSeries.nameKo} />
                </div>

            </div>


            <div className="inner">


                <div className="series-product-head">
                    <h3>{currentSeries.nameKo} 시리즈 상품</h3>
                    <span>{seriesProducts.length}개</span>
                </div>

                {seriesProducts.length > 0 ? (
                    <div className="series-product-grid">
                        {seriesProducts.map((item) => (
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
        </section>
    )
}