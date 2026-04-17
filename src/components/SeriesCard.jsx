import React from 'react'
import { Link } from 'react-router-dom'
import "./scss/seriescard.scss"

export default function SeriesCard({ item }) {
    return (
        <article className="signature-series-card">
            <div className="signature-series-media">
                <img src={item.bannerImage
                } alt={item.nameKo}
                    className="signature-series-image"
                />
            </div>

            <div className="signature-series-content">
                <h3 className="signature-series-title">
                    {item.nameKo}
                </h3>

                <p className="signature-series-desc">
                    <span>감도 높은 분위기와 균형 잡힌 디자인이</span>
                    <span> 돋보이는 시리즈입니다.</span>
                </p>

                <div className="signature-series-meta">
                    <span>{item.nameEn}</span>
                </div>

                <Link
                    to={`/series/${item.slug}`}
                    className="signature-series-button"
                    aria-label={`${item.nameKo} 시리즈 보기`}
                >
                    <span>Explore</span>
                    <i>→</i>
                </Link>
            </div>
        </article>
    )
}