import React from 'react'
import "./scss/seriescard.scss"

export default function SeriesCard({ item }) {
    return (
        <article className="signature-series-horizontal-card">
            <div className="signature-series-horizontal-media">
                <img
                    src={`${item.image}`}
                    alt={item.nameKo}
                    className="signature-series-horizontal-image"
                />
            </div>

            <div className="signature-series-horizontal-content">


                <h3 className="signature-series-horizontal-title">
                    {item.nameKo}
                </h3>

                <p className="signature-series-horizontal-desc">
                    감도 높은 분위기와 균형 잡힌 디자인이 돋보이는 시리즈입니다.
                </p>

                <div className="signature-series-horizontal-meta">
                    <span>{item.nameEn}</span>
                </div>

                <button
                    type="button"
                    className="signature-series-horizontal-button"
                    aria-label={`${item.nameKo} 시리즈 보기`}
                >
                    <span>Explore</span>
                    <i>→</i>
                </button>
            </div>
        </article>
    )
}