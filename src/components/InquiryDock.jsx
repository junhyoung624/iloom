import { useState } from 'react'
import { useInquiryStore } from '../store/useInquiryStore'
import { useNavigate } from 'react-router-dom'
import "./scss/inquirydock.scss"

const TABS = [
    {
        label: '배송 문의',
        questions: [
            '배송은 얼마나 걸리나요?',
            '배송 현황을 확인하고 싶어요',
            '배송지를 변경하고 싶어요',
        ],
    },
    {
        label: '제품 문의',
        questions: [
            '제품 색상/사이즈를 확인하고 싶어요',
            '제품 재고가 있나요?',
            '설치 서비스가 가능한가요?',
        ],
    },
    {
        label: '교환/반품',
        questions: [
            '교환 신청은 어떻게 하나요?',
            '반품 절차를 알고 싶어요',
            '환불은 언제 처리되나요?',
        ],
    },
    {
        label: '직접 입력',
        questions: [],
    },
]

export default function InquiryDock({ onClose }) {
    const [activeTab, setActiveTab] = useState(0)
    const [customText, setCustomText] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const { addInquiry } = useInquiryStore()
    const navigate = useNavigate()

    const handleQuickSubmit = (question) => {
        addInquiry({ category: TABS[activeTab].label, text: question })
        setSubmitted(true)
        setTimeout(() => { setSubmitted(false); onClose() }, 1800)
    }

    const handleCustomSubmit = () => {
        if (!customText.trim()) return
        addInquiry({ category: '직접 입력', text: customText.trim() })
        setCustomText('')
        setSubmitted(true)
        setTimeout(() => { setSubmitted(false); onClose() }, 1800)
    }

    return (
        <div className="inquiry-dock">
            <div className="inquiry-dock__header">
                <p className="inquiry-dock__title">무엇을 도와드릴까요?</p>
                <div className="inquiry-dock__header-right">
                    <button className="inquiry-dock__mypage-btn" onClick={() => { onClose(); navigate('/inquiry') }}>
                        내 문의 보기
                    </button>
                    <button className="inquiry-dock__close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="inquiry-dock__tabs">
                {TABS.map((tab, i) => (
                    <button
                        key={i}
                        className={`inquiry-dock__tab ${activeTab === i ? 'active' : ''}`}
                        onClick={() => setActiveTab(i)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="inquiry-dock__body">
                {submitted ? (
                    <div className="inquiry-dock__success">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                            stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <p>문의가 접수됐어요!</p>
                    </div>
                ) : activeTab < TABS.length - 1 ? (

                    <ul className="inquiry-dock__questions">
                        {TABS[activeTab].questions.map((q, i) => (
                            <li key={i}>
                                <button className="inquiry-dock__question-btn" onClick={() => handleQuickSubmit(q)}>
                                    <span>{q}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (

                    <div className="inquiry-dock__custom">
                        <textarea
                            className="inquiry-dock__textarea"
                            placeholder="문의 내용을 입력해주세요"
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            rows={4}
                        />
                        <button
                            className="inquiry-dock__submit"
                            onClick={handleCustomSubmit}
                            disabled={!customText.trim()}
                        >
                            문의 접수
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}