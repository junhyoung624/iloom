import React from "react";
import { useParams, Link } from "react-router-dom";
import { iloomDetails } from "../data/magazine";

export default function DetailPage() {
    const { id } = useParams();

    const detailData = iloomDetails.find((item) => item.id === id);

    if (!detailData) {
        return (
            <div className="detail-empty">
                <h2>데이터가 없습니다.</h2>
                <Link to="/contents">목록으로 돌아가기</Link>
            </div>
        );
    }

    if (detailData.category === "매거진") {
        return <MagazineDetail data={detailData} />;
    }

    if (detailData.category === "뉴스") {
        return <NewsDetail data={detailData} />;
    }

    if (detailData.category === "이벤트") {
        return <EventDetail data={detailData} />;
    }

    return (
        <div className="detail-empty">
            <h2>잘못된 접근입니다.</h2>
            <Link to="/contents">목록으로 돌아가기</Link>
        </div>
    );
}

function MagazineDetail({ data }) {
    return (
        <section className="detail-page magazine-detail">
            <div className="inner">
                <div className="detail-top">
                    <p className="detail-category">{data.category}</p>
                    <h2 className="detail-title">{data.title}</h2>
                    {data.subtitle && <p className="detail-subtitle">{data.subtitle}</p>}
                    {data.intro && <p className="detail-intro">{data.intro}</p>}
                    {data.editor && <p className="detail-editor">{data.editor}</p>}
                </div>

                <div className="detail-sections">
                    {data.sections?.map((section, sectionIdx) => (
                        <section className="detail-section" key={sectionIdx}>
                            <h3 className="section-title">{section.sectionTitle}</h3>

                            <div className="section-items">
                                {section.items?.map((item, itemIdx) => (
                                    <article className="section-item" key={itemIdx}>
                                        {item.image && (
                                            <div className="item-image">
                                                <img src={item.image} alt={item.title} />
                                            </div>
                                        )}

                                        <div className="item-text">
                                            {item.title && <h4 className="item-title">{item.title}</h4>}
                                            {item.desc && <p className="item-desc">{item.desc}</p>}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="detail-bottom">
                    <Link to="/contents" className="back-btn">
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        </section>
    );
}

function NewsDetail({ data }) {
    return (
        <section className="detail-page news-detail">
            <div className="inner">
                <div className="detail-top news-top">
                    <p className="detail-category">{data.category}</p>
                    <h2 className="detail-title">{data.title}</h2>
                    {data.date && <p className="detail-date">{data.date}</p>}
                    {data.subtitle && <p className="detail-subtitle">{data.subtitle}</p>}
                    {data.intro && <p className="detail-intro">{data.intro}</p>}
                </div>

                <div className="detail-sections">
                    {data.sections?.map((section, sectionIdx) => (
                        <section className="detail-section" key={sectionIdx}>
                            {section.sectionTitle && (
                                <h3 className="section-title">{section.sectionTitle}</h3>
                            )}

                            {section.items?.map((item, itemIdx) => (
                                <article className="news-article" key={itemIdx}>
                                    {item.image && (
                                        <div className="item-image">
                                            <img src={item.image} alt={item.title} />
                                        </div>
                                    )}

                                    {item.title && <h4 className="item-title">{item.title}</h4>}
                                    {item.desc && <p className="item-desc">{item.desc}</p>}
                                </article>
                            ))}
                        </section>
                    ))}
                </div>

                <div className="detail-bottom">
                    <Link to="/contents" className="back-btn">
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        </section>
    );
}

function EventDetail({ data }) {
    return (
        <section className="detail-page event-detail">
            <div className="inner">
                <div className="detail-top event-top">
                    <p className="detail-category">{data.category}</p>
                    <h2 className="detail-title">{data.title}</h2>
                    {data.period && <p className="detail-date">{data.period}</p>}
                    {data.subtitle && <p className="detail-subtitle">{data.subtitle}</p>}
                    {data.intro && <p className="detail-intro">{data.intro}</p>}
                </div>

                <div className="detail-sections">
                    {data.sections?.map((section, sectionIdx) => (
                        <section className="detail-section" key={sectionIdx}>
                            {section.sectionTitle && (
                                <h3 className="section-title">{section.sectionTitle}</h3>
                            )}

                            {section.items?.map((item, itemIdx) => (
                                <article className="event-article" key={itemIdx}>
                                    {item.image && (
                                        <div className="item-image">
                                            <img src={item.image} alt={item.title} />
                                        </div>
                                    )}

                                    {item.title && <h4 className="item-title">{item.title}</h4>}
                                    {item.desc && <p className="item-desc">{item.desc}</p>}
                                </article>
                            ))}
                        </section>
                    ))}
                </div>

                <div className="detail-bottom">
                    <Link to="/Magazine" className="back-btn">
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        </section>
    );
}