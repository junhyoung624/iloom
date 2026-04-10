import React, { useMemo, useState } from "react";
import { noticeList, FAQList } from "../data/magazine";
import "./scss/notice.scss";
import { Link } from "react-router-dom";

const tabs = ["공지사항", "FAQ"];

export default function Notice() {
  const [activeTab, setActiveTab] = useState("공지사항");
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const currentList = useMemo(() => {
    return activeTab === "공지사항" ? noticeList : FAQList;
  }, [activeTab]);

  return (
    <section className="notice-page">
      <div className="inner">
        <div className="notice-head">
          <h2 className="notice-page-title">{activeTab}</h2>
        </div>

        <div className="contents-tabs notice-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setOpenId(null);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="notice-board">
          <div className="notice-board-head">
            <span className="col-no">NO</span>
            <span className="col-title">제목</span>
            <span className="col-date">등록일</span>
          </div>

          <div className="notice-board-body">
            {currentList.map((item) => {
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
                    <span className="col-no">{item.no}</span>
                    <span className="col-title">{item.title}</span>
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

        <div className="service-store">
          <div className="service">
            <h1>서비스 신청 및 문의</h1>
            <p>
              일룸 제품 관련 A/S, 분해/이동 서비스 신청 및 문의는
              <br />
              일룸 서비스센터 사이트를 이용해주세요.
            </p>
            <Link to="https://cs.iloom.com/">일룸 서비스센터 바로가기</Link>
          </div>

          <div className="store">
            <h1>매장 문의</h1>
            <p>
              매장에서 구매하신 제품의 배송문의, 주문내용 변경 등은 해당 대리
              <br />
              점에서 문의 가능합니다. 매장 운영시간은 매장 안내에서 확인하실
              <br />
              수 있습니다.
            </p>
            <Link to="/">매장 안내 바로가기</Link>
          </div>
        </div>

        <div className="bottom">
          <div className="chat-bot">
            <div className="chat-left">
              <div className="chat-bot-title">
                <h1>일룸 AI챗봇상담</h1>
                <img src="../images/footer/icnKakaoBlck.svg" alt="kakao" />
              </div>
              <p>
                일룸 대화형 AI챗봇 상담을 통해 서비스 신청 및 다양한 문의를
                <br />
                실시간으로 편리하게 해결하실 수 있습니다.
              </p>
              <Link
                to="https://letus-gptbot.bizmsg.io/jsp/gpt/chat/stg.jsp?encrypt=RX9vsR5ATu8kHdU3b7CGUDPkHNmzhDEuD52sBYXzIS7Ih0NsVLh3iQi9_j-1QkQ-&inRoute=ILOOM"
                className="chat-bot-btn"
              >
                AI 챗봇 상담하기 ▶
              </Link>
            </div>

            <div className="chat-right">
              <img src="../images/footer/qrcode.jpg" alt="qrcode" />
              <p>
                QR코드를 스캔하시면
                <br />
                바로 상담이 가능합니다.
              </p>
            </div>
          </div>

          <div className="call-center">
            <div className="call-top">
              <h1>고객센터 전화문의</h1>
              <p>1577-5670</p>
            </div>
            <p>
              전화로 문의 시 월,화요일 / 공휴일 다음날은 상담전화가 많아 일정이
              다소 지연될 수 있습니다.
            </p>
            <div className="call-middle">
              <p>평일</p>
              <span>9:30 ~ 17:30 ( 점심시간 12:30 ~ 13:30 )</span>
              <p>토요일</p>
              <span>9:30 ~ 12:30 ( A/S 관련 상담만 진행 ) </span>
              <span>일요일 및 법정 공휴일 휴무.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}