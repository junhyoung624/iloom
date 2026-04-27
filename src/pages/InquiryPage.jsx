import { useState } from 'react'
import { useInquiryStore } from '../store/useInquiryStore'
import MyPageMenu from './MyPageMenu'
import { useLocation } from 'react-router-dom'
import { commonQna } from '../data/qnaData'
import './scss/inquirypage.scss'

function AccordionItem({ item, isOpen, onToggle }) {
    return (
        <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
            <button className="accordion-header" onClick={onToggle}>
                <span className="accordion-q">Q</span>
                <span className="accordion-title">{item.title}</span>
                <svg
                    className="accordion-arrow"
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            <div className="accordion-body">
                <div className="accordion-body-inner">
                    <p className="accordion-question-text">{item.content}</p>
                    <div className="accordion-answer">
                        <span className="accordion-a">A</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function InquiryPage() {
    const { inquiries } = useInquiryStore()
    const [openId, setOpenId] = useState(null)
    const [activeTab, setActiveTab] = useState('faq')

    const handleToggle = (id) => {
        setOpenId((prev) => (prev === id ? null : id))
    }

    return (
        <section className="mypage">
            <div className="inner">
                <MyPageMenu />

                <div className="content inquiry-content">

                    <div className="inquiry-page-tabs">
                        <button
                            className={`inquiry-page-tab ${activeTab === 'faq' ? 'active' : ''}`}
                            onClick={() => setActiveTab('faq')}
                        >
                            자주 묻는 질문
                        </button>
                        <button
                            className={`inquiry-page-tab ${activeTab === 'mine' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mine')}
                        >
                            내 문의
                            {inquiries.length > 0 && (
                                <span className="inquiry-page-tab-badge">{inquiries.length}</span>
                            )}
                        </button>
                    </div>


                    {activeTab === 'faq' && (
                        <div className="faq-section">
                            <div className="accordion-list">
                                {commonQna.map((item) => (
                                    <AccordionItem
                                        key={item.id}
                                        item={item}
                                        isOpen={openId === item.id}
                                        onToggle={() => handleToggle(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}


                    {activeTab === 'mine' && (
                        <div className="mine-section">
                            {inquiries.length === 0 ? (
                                <div className="inquiry-empty">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                        stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <p>아직 문의 내역이 없어요</p>
                                    <span>독 메뉴의 말풍선 아이콘으로 문의를 남겨보세요</span>
                                </div>
                            ) : (
                                <ul className="inquiry-list">
                                    {inquiries.map((item) => (
                                        <li key={item.id} className="inquiry-item">
                                            <div className="inquiry-item__top">
                                                <span className="inquiry-item__category">{item.category}</span>
                                                <span className={`inquiry-item__status ${item.status === '답변 완료' ? 'done' : ''}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="inquiry-item__text">{item.text}</p>
                                            <span className="inquiry-item__date">{item.createdAt}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}