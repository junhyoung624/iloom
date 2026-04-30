import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./scss/quickmenu.scss";
import { commonQna } from "../data/qnaData";

const QUICK_BTNS = [
    { label: "배송 기간", id: 1 },
    { label: "배송 날짜 변경", id: 2 },
    { label: "A/S 보증 기간", id: 6 },
    { label: "E0 등급 목재", id: 5 },
]

export default function QuickMenu() {
    const [recentProducts, setRecentProducts] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatList, setChatList] = useState([
        { role: "bot", text: "안녕하세요! 일룸 챗봇입니다 \n아래 자주 묻는 질문을 선택하거나 직접 입력해주세요." }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("recentProducts") || "[]");
        setRecentProducts(stored.slice(0, 5));
    }, [location.pathname]);

    // 새 메시지 올 때마다 스크롤 하단
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
        }
    }, [chatList])

    const handleKeyDown = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    // 자주묻는질문 버튼 클릭
    const handleQuickQuestion = (qnaId) => {
        const item = commonQna.find((q) => q.id === qnaId)
        if (!item) return

        setChatList((prev) => [
            ...prev,
            { role: "user", text: item.title },
            { role: "bot", text: item.answer },
        ])
    }

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message;
        setChatList((prev) => [...prev, { role: "user", text: userMessage }]);
        setMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:4000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });
            const data = await res.json();
            setChatList((prev) => [
                ...prev,
                { role: "bot", text: data.answer || data.error || "답변을 불러오지 못했습니다." },
            ]);
        } catch (error) {
            setChatList((prev) => [
                ...prev,
                { role: "bot", text: "서버 연결 중 오류가 발생했습니다." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <>
            <div className="quick-menu-wrap">
                <button type="button" className="quick-btn top-btn" onClick={handleScrollTop} aria-label="맨 위로 이동">
                    <img src="/images/quick-menu/upquick.png" alt="맨 위로 이동" />
                </button>
                <button type="button" className="quick-btn chat-bot-btn" onClick={() => setIsChatOpen((prev) => !prev)} aria-label="챗봇 열기">
                    <img src="/images/quick-menu/chatbot.png" alt="챗봇" />
                </button>
                <div className="recent-view-hover-area">
                    <div className={`recent-view-box ${recentProducts.length >= 5 ? "has-5" : recentProducts.length === 2 ? "has-2" : ""}`}>
                        <p className="recent-view-title">최근 본 상품</p>
                        <ul className="recent-view-list">
                            {recentProducts.length > 0 ? (
                                recentProducts.map((item) => (
                                    <li key={item.id}>
                                        <Link to={`/product/${item.id}`} className="recent-view-item">
                                            <img src={item.image} alt={item.name} />
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="recent-empty">없음</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {isChatOpen && (
                <div className="chatbot-panel">
                    <div className="chatbot-header">
                        <h3>일룸 챗봇</h3>
                        <button type="button" className="chatbot-close" onClick={() => setIsChatOpen(false)}>×</button>
                    </div>

                    <div className="chatbot-body" ref={chatBodyRef}>
                        {chatList.map((chat, idx) => (
                            <div key={idx} className={`chatbot-message ${chat.role === "user" ? "user" : "bot"}`}>
                                {chat.text}
                            </div>
                        ))}

                        {!isLoading && chatList[chatList.length - 1]?.role === 'bot' && (
                            <div className="chatbot-quick-btns">
                                <p className="chatbot-quick-label">자주 묻는 질문</p>
                                <div className="chatbot-quick-grid">
                                    {QUICK_BTNS.map((btn) => (
                                        <button
                                            key={btn.id}
                                            className="chatbot-quick-btn"
                                            onClick={() => handleQuickQuestion(btn.id)}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="chatbot-message bot">
                                <span className="chatbot-typing">
                                    <span /><span /><span />
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="chatbot-input-wrap">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="메시지를 입력하세요"
                        />
                        <button type="button" onClick={sendMessage}>전송</button>
                    </div>
                </div>
            )}
        </>
    );
}