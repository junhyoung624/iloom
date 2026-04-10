import React, { useEffect, useState } from "react";
import "./scss/popup.scss"
import { Link } from "react-router-dom";
import { iloomList } from "../data/magazine";

export default function Popup() {
    const popupItem = iloomList.find((item) => item.id === "event_243")
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hideUntil = localStorage.getItem("hidePopupUntil");
        const now = new Date().getTime();

        if (!hideUntil || now > Number(hideUntil)) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleHideToday = () => {
        const now = new Date();
        const tomorrow = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        ).getTime();

        localStorage.setItem("hidePopupUntil", String(tomorrow));
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="event-popup">
            <div className="popup-box">
                {popupItem && (
                    <Link to={`/magazine/${popupItem.id}`}>
                        <div className="popup-img">
                            <img src="./images/popup/popup01.png" alt={popupItem.title} />
                        </div>
                    </Link>
                )}
                <div className="popup-bottom">
                    <button type="button" onClick={handleHideToday} className="button">
                        오늘 하루 보지 않기
                    </button>
                    <button type="button" onClick={handleClose} className="close-button">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}