import React from "react";
import "./scss/quickmenu.scss";

export default function QuickMenu() {
    const handleScrollTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="quick-menu-wrap">
            <button
                type="button"
                className="quick-btn top-btn"
                onClick={handleScrollTop}
                aria-label="맨 위로 이동"
            >
                <img src="./images/quick-menu/upquick.png" alt="맨 위로 이동" />
            </button>

            <a
                href="https://letus-gptbot.bizmsg.io/jsp/gpt/chat/stg.jsp?encrypt=Z68XMJAVQoRPX1GbCXO-Gn6MqnK-ucI_gfpGYJni-sRqPz6tb0A8SgJ-Vhfutx26&inRoute=ILOOM"
                className="quick-btn chat-bot-btn"
            >
                <img src="./images/quick-menu/chatbot.png" alt="챗봇" />
            </a>
        </div>
    );
}