import React from 'react'
import SeriesCard from '../components/SeriesCard.jsx'
import "./scss/series.scss"
import { seriesListEn } from '../data/seriesData.js'

export default function SignatureSeriesHorizontal() {
    return (
        <section className="signature-series-section">
            <div className="signature-series-head">
                <span className="signature-series-head-sub">SERIES</span>
                <div className="line"></div>
            </div>

            <div className="signature-series-list">
                {seriesListEn.map((item) => (
                    <SeriesCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    )
}