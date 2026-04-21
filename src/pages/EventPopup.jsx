import React, { useEffect, useState } from "react";
import "./scss/popup.scss"
import { Link } from "react-router-dom";
import { iloomList } from "../data/magazine";

export default function Popup() {
    const [visible, setVisible] = useState(false)
    const [isOpen, setIsOpen] = useState(false)  // ← 위로 올림

    // 로딩 딜레이
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(true)
        }, 1800)
        return () => clearTimeout(timer)
    }, [])

    // 팝업 오픈 여부 (visible 바뀔 때 실행)
    useEffect(() => {
        if (!visible) return
        const hideUntil = localStorage.getItem("hidePopupUntil")
        const now = new Date().getTime()
        if (!hideUntil || now > Number(hideUntil)) {
            setIsOpen(true)
        }
    }, [visible])  // ← visible이 true 될 때 localStorage 체크

    const popupItem = iloomList.find((item) => item.id === "event_243")

    const handleClose = () => setIsOpen(false)

    const handleHideToday = () => {
        const now = new Date()
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
        localStorage.setItem("hidePopupUntil", String(tomorrow))
        setIsOpen(false)
    }

    if (!visible || !isOpen) return null  // ← 조건부 return은 맨 아래에

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
    )
}