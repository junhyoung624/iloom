import React from 'react'
import SeriesCard from '../components/SeriesCard.jsx'
import "./scss/series.scss"
import { seriesListEn } from '../data/seriesData.js'

export default function SignatureSeriesHorizontal() {
    return (
        <section className="signature-series-horizontal-section">
            <div className="signature-series-horizontal-head">
                <span className="signature-series-horizontal-head-sub">Editorial Pick</span>
                <h2 className="signature-series-horizontal-head-title">Modern Signature</h2>
                <p className="signature-series-horizontal-head-desc">
                    한 장의 비주얼만으로 분위기를 압도하는 시리즈 카드.
                </p>
            </div>

            <div className="signature-series-horizontal-list">
                {seriesListEn.map((item) => (
                    <SeriesCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    )
}