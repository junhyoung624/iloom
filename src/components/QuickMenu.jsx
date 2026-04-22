import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./scss/quickmenu.scss";

export default function QuickMenu() {
    const [recentProducts, setRecentProducts] = useState([]);
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

    return (
        <div className="quick-menu-wrap">
            <button
                type="button"
                className="quick-btn top-btn"
                onClick={handleScrollTop}
                aria-label="맨 위로 이동"
            >
                <img src="/images/quick-menu/upquick.png" alt="맨 위로 이동" />
            </button>

            <a
                href="https://letus-gptbot.bizmsg.io/jsp/gpt/chat/stg.jsp?encrypt=Z68XMJAVQoRPX1GbCXO-Gn6MqnK-ucI_gfpGYJni-sRqPz6tb0A8SgJ-Vhfutx26&inRoute=ILOOM"
                className="quick-btn chat-bot-btn"
                target="_blank"
                rel="noreferrer"
            >
                <img src="/images/quick-menu/chatbot.png" alt="챗봇" />
            </a>

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
    );
}