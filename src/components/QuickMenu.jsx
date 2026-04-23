import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./scss/quickmenu.scss";

export default function QuickMenu() {
    const [recentProducts, setRecentProducts] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatList, setChatList] = useState([
        { role: "bot", text: "안녕하세요. 일룸 챗봇입니다. 무엇을 도와드릴까요?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();

    const handleScrollTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("recentProducts") || "[]");
        setRecentProducts(stored.slice(0, 3));
    }, [location.pathname]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message;
        setChatList((prev) => [...prev, { role: "user", text: userMessage }]);
        setMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:4000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();
            console.log("chat response:", data);

            setChatList((prev) => [
                ...prev,
                {
                    role: "bot",
                    text: data.answer || data.error || "답변을 불러오지 못했습니다.",
                },
            ]);
        } catch (error) {
            console.error(error);
            setChatList((prev) => [
                ...prev,
                { role: "bot", text: "서버 연결 중 오류가 발생했습니다." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="quick-menu-wrap">
                <button
                    type="button"
                    className="quick-btn top-btn"
                    onClick={handleScrollTop}
                    aria-label="맨 위로 이동"
                >
                    <img src="/images/quick-menu/upquick.png" alt="맨 위로 이동" />
                </button>

                <button
                    type="button"
                    className="quick-btn chat-bot-btn"
                    onClick={() => setIsChatOpen((prev) => !prev)}
                    aria-label="챗봇 열기"
                >
                    <img src="/images/quick-menu/chatbot.png" alt="챗봇" />
                </button>

                <div className="recent-view-hover-area">
                    <div
                        className={`recent-view-box ${recentProducts.length >= 3
                            ? "has-3"
                            : recentProducts.length === 2
                                ? "has-2"
                                : ""
                            }`}
                    >
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
                        <button
                            type="button"
                            className="chatbot-close"
                            onClick={() => setIsChatOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="chatbot-body">
                        {chatList.map((chat, idx) => (
                            <div
                                key={idx}
                                className={`chatbot-message ${chat.role === "user" ? "user" : "bot"}`}
                            >
                                {chat.text}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chatbot-message bot">
                                답변 작성 중...
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
                        <button type="button" onClick={sendMessage}>
                            전송
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}