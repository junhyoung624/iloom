import { useState } from 'react'
import './scss/stickybanner.scss'

const MESSAGES = [
    "🛋️ 카드사 프로모션 무이자할부 / 캐시백 혜택을 만나보세요",
    "🚚 5만원 이상 구매 시 무료배송",
    "✨ 일룸 신규 회원가입 시 5,000원 즉시 할인",
]

export default function StickyBanner({ onClose }) {
    const [visible, setVisible] = useState(true)
    const [msgIndex, setMsgIndex] = useState(0)
    const [animating, setAnimating] = useState(false)

    const handleNext = () => {
        if (animating) return
        setAnimating(true)
        setTimeout(() => {
            setMsgIndex((i) => (i + 1) % MESSAGES.length)
            setAnimating(false)
        }, 300)
    }

    const handlePrev = () => {
        if (animating) return
        setAnimating(true)
        setTimeout(() => {
            setMsgIndex((i) => (i - 1 + MESSAGES.length) % MESSAGES.length)
            setAnimating(false)
        }, 300)
    }

    const handleClose = () => {
        setVisible(false)
        onClose?.()
    }

    if (!visible) return null

    return (
        <div className="sticky-banner">
            <div className="sticky-banner__inner">
                <button className="sticky-banner__arrow" onClick={handlePrev} aria-label="이전">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div className="sticky-banner__text-wrap">
                    <p className={`sticky-banner__text ${animating ? "fade-out" : "fade-in"}`}>
                        {MESSAGES[msgIndex]}
                    </p>
                </div>

                <button className="sticky-banner__arrow" onClick={handleNext} aria-label="다음">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                <button className="sticky-banner__close" onClick={handleClose} aria-label="닫기">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    )
}