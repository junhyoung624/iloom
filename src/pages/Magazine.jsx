import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { iloomList } from "../data/magazine";
import "./scss/contentlist.scss"
import { Helmet } from "react-helmet-async";

const tabs = ["이벤트", "매거진"];

function getSafeImageUrl(url = "") {
  if (!url) return "";

  return url.replace("https://www.iloom.com/", "https://cdn.iloom.com/");
}

export default function ContentsPage() {
  const [activeTab, setActiveTab] = useState("이벤트");

  const filteredItems = useMemo(() => {
    return iloomList.filter((item) => item.category === activeTab);
  }, [activeTab]);

  return (
    <section className="contents-page">
      <Helmet>
        <title>매거진 | iloom</title>
        <meta name="description" content="일룸의 인테리어 매거진과 라이프스타일 콘텐츠를 확인해보세요." />
      </Helmet>
      <div className="inner contents-wrap">
        <h2 className="page-title">{activeTab}</h2>

        <div className="contents-tabs">
          {tabs.map((tab) => (
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

        <div className="contents-grid">
          {filteredItems.map((item) => (
            <Link
              to={`/magazine/${item.id}`}
              className="contents-card"
              key={item.id}
            >
              <div className="card-thumb">
                {item.thumbnail ? (
                  <img
                    src={getSafeImageUrl(item.thumbnail)}
                    alt={item.title}
                    onError={(e) => {

                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="thumb-empty">NO IMAGE</div>
                )}
              </div>

              <div className="card-text">
                <h3 className="card-title">{item.title}</h3>
                {item.summary && <p className="card-desc">{item.summary}</p>}
                {item.date && <p className="card-date">{item.date}</p>}
                {item.period && <p className="card-date">{item.period}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}