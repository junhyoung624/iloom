import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { iloomList } from "../data/magazine";
import "./scss/magazine-news-event.scss"

const tabs = ["이벤트", "뉴스", "매거진"];

export default function ContentsPage() {
  const [activeTab, setActiveTab] = useState("이벤트");

  const filteredItems = useMemo(() => {
    return iloomList.filter((item) => item.category === activeTab);
  }, [activeTab]);

  return (
    <section className="contents-page">
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
                  <img src={item.thumbnail} alt={item.title} />
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