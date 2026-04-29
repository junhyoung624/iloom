import React, { useRef, useState } from 'react'
import SeriesCard from '../components/SeriesCard.jsx'
import "./scss/series.scss"
import { seriesListEn } from '../data/seriesData.js'
import { Helmet } from 'react-helmet-async'

export default function SignatureSeriesHorizontal() {
    const listRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1)
    const itemPage = 20;
    const totalPages = Math.ceil(seriesListEn.length / itemPage);

    const pageItem = seriesListEn.slice(
        (currentPage - 1) * itemPage,
        currentPage * itemPage
    )

    const pageTop = (page) => {
        setCurrentPage(page);
        listRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <section className="signature-series-section">
            <Helmet>
                <title>시리즈 | iloom</title>
                <meta name="description" content="일룸의 다양한 가구 시리즈를 만나보세요." />
            </Helmet>
            <div className="signature-series-head">
                <span className="signature-series-head-sub" ref={listRef}>SERIES</span>
                <div className="line"></div>
            </div>

            <div className="signature-series-list">
                {pageItem.map((item) => (
                    <SeriesCard key={item.id} item={item} />
                ))}
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