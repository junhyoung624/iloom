import React, { useMemo, useState } from "react";
import { companyList, companyTabs } from "../data/magazine";
import "./scss/companypage.scss"

export default function CompanyPage() {
    const [activeTab, setActiveTab] = useState("브랜드 스토리");

    const currentPage = useMemo(() => {
        return companyList.find((item) => item.category === activeTab);
    }, [activeTab]);

    return (
        <section className="company-page">
            <div className="inner company-wrap">
                <h2 className="page-title">{activeTab}</h2>

                <div className="contents-tabs">
                    {companyTabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {currentPage && (
                    <div className="company-detail-content">
                        <div className="detail-hero">
                            <h3 className="detail-page-title">{currentPage.heroTitle}</h3>
                            <p className="detail-page-desc">{currentPage.heroDesc}</p>
                        </div>

                        <div className="detail-wrap">
                            {currentPage.sections.map((section, index) => (
                                <div className={`detail-section ${section.type}`} key={index}>
                                    <h3 className="section-title">{section.title}</h3>

                                    {section.type === "intro" && (
                                        <div className="section-text-box">
                                            {section.text.map((text, idx) => (
                                                <p key={idx} className="section-text">
                                                    {text}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {section.type === "imageText" && (
                                        <div className="section-image-text">
                                            <div className="section-image">
                                                <img src={section.image} alt={section.title} />
                                            </div>
                                            <div className="section-text-box">
                                                {section.text.map((text, idx) => (
                                                    <p key={idx} className="section-text">
                                                        {text}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {section.type === "timeline" && (
                                        <div className="timeline-list">
                                            {section.items.map((item, idx) => (
                                                <div className="timeline-item" key={idx}>
                                                    <span className="timeline-year">{item.year}</span>
                                                    <div className="timeline-content">
                                                        <h4 className="timeline-title">{item.heading}</h4>
                                                        <p className="timeline-desc">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.type === "yearList" && (
                                        <div className="year-list">
                                            {section.items.map((item, idx) => (
                                                <div className="year-item" key={idx}>
                                                    <strong className="year">{item.year}</strong>
                                                    <p className="year-text">{item.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {section.type === "card" && (
                                        <div className="value-card-list">
                                            {section.items.map((item, idx) => (
                                                <div className="value-card" key={idx}>
                                                    <h4 className="value-card-title">{item.title}</h4>
                                                    <p className="value-card-desc">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}