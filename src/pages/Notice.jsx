import React, { useState } from "react";
import { noticeList } from "../data/magazine";
import "./scss/notice.scss";

export default function Notice() {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="notice-page">
      <div className="inner">
        <div className="notice-head">
          <h2 className="notice-page-title">공지사항</h2>
        </div>

        <div className="notice-board">
          <div className="notice-board-head">
            <span className="col-no">NO</span>
            <span className="col-title">제목</span>
            <span className="col-date">등록일</span>
          </div>

          <div className="notice-board-body">
            {noticeList.map((item, index) => {
              const isOpen = openId === item.id;

              return (
                <div
                  key={item.id}
                  className={`notice-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    type="button"
                    className="notice-summary"
                    onClick={() => handleToggle(item.id)}
                  >
                    <span className="col-no">
                      {item.no}
                    </span>

                    <span className="col-title">
                      {item.title}
                    </span>

                    <span className="col-date">{item.date}</span>

                  </button>

                  <div className="notice-detail">
                    <div className="notice-detail-inner">
                      <p style={{ whiteSpace: "pre-line" }}>{item.summary}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}