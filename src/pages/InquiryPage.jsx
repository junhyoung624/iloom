import { useInquiryStore } from '../store/useInquiryStore'
import MyPageMenu from './MyPageMenu'
import { useLocation } from 'react-router-dom'
import "./scss/inquirypage.scss"

export default function InquiryPage() {
    const { inquiries } = useInquiryStore()
    const location = useLocation()

    return (
        <section className="mypage">
            <div className="inner">
                <MyPageMenu />
                <div className="content inquiry-content">
                    <h2>내 문의</h2>
                    {inquiries.length === 0 ? (
                        <div className="inquiry-empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <p>아직 문의 내역이 없어요</p>
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
            </div>
        </section>
    )
}