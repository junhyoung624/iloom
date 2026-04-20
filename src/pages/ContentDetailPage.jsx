import React from "react";
import { useParams, Link } from "react-router-dom";
import { iloomDetails } from "../data/magazine";
import "./scss/contentdetailpage.scss"

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

function getSafeImageUrl(url = "") {
    if (!url) return "";

    return url.replace(
        "https://www.iloom.com/",
        "https://cdn.iloom.com/"
    );
}

function DetailImage({ src, alt }) {
    const safeSrc = getSafeImageUrl(src);

    return (
        <div className="item-image">
            <img
                src={safeSrc}
                alt={alt || "상세 이미지"}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/no-image.jpg";
                }}
            />
        </div>
    );
}

function DetailImageGroup({ images = [], alt }) {
    return (
        <div className="item-images">
            {images.map((img, idx) => (
                <DetailImage
                    key={idx}
                    src={img}
                    alt={`${alt || "상세 이미지"} ${idx + 1}`}
                />
            ))}
        </div>
    );
}

function RenderItemImages({ item }) {
    if (item.images?.length > 0) {
        return <DetailImageGroup images={item.images} alt={item.title} />;
    }

    if (item.image) {
        return <DetailImage src={item.image} alt={item.title} />;
    }

    return null;
}

function MagazineDetail({ data }) {
    return (
        <section className="detail-page magazine-detail">
            <div className="inner">
                <div className="detail-top">
                    <div className="detail-head">
                        <p className="detail-category">{data.category}</p>
                        <h2 className="detail-title">{data.title}</h2>
                        {data.subtitle && (
                            <p className="detail-subtitle">{data.subtitle}</p>
                        )}
                    </div>

                    <div className="detail-meta">
                        {data.intro && <p className="detail-intro">{data.intro}</p>}
                        {data.editor && <p className="detail-editor">{data.editor}</p>}
                    </div>
                </div>

                <div className="detail-sections">
                    {data.sections?.map((section, sectionIdx) => (
                        <section className="detail-section" key={sectionIdx}>
                            <h3 className="section-title">{section.sectionTitle}</h3>

                            <div className="section-items">
                                {section.items?.map((item, itemIdx) => (
                                    <article className="section-item" key={itemIdx}>
                                        <RenderItemImages item={item} />

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
                    <Link to="/magazine" className="back-btn">
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
                    <div className="detail-head">
                        <p className="detail-category">{data.category}</p>
                        <h2 className="detail-title">{data.title}</h2>
                        {data.subtitle && (
                            <p className="detail-subtitle">{data.subtitle}</p>
                        )}
                    </div>

                    <div className="detail-meta">
                        {data.intro && <p className="detail-intro">{data.intro}</p>}
                        {data.period && <p className="detail-date">{data.period}</p>}
                    </div>
                </div>

                <div className="detail-sections">
                    {data.sections?.map((section, sectionIdx) => (
                        <section className="detail-section" key={sectionIdx}>
                            {section.sectionTitle && (
                                <h3 className="section-title">{section.sectionTitle}</h3>
                            )}

                            {section.items?.map((item, itemIdx) => (
                                <article className="event-article" key={itemIdx}>
                                    <RenderItemImages item={item} />

                                    {item.title && <h4 className="item-title">{item.title}</h4>}
                                    {item.desc && <p className="item-desc">{item.desc}</p>}
                                </article>
                            ))}
                        </section>
                    ))}
                </div>

                <div className="detail-bottom">
                    <Link to="/magazine" className="back-btn">
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        </section>
    );
}