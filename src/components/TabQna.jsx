import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useInquiryStore } from '../store/useInquiryStore'

export default function TabQna({ productQna, user, product }) {
    const { addInquiry, inquiries } = useInquiryStore()
    const [showQnaModal, setShowQnaModal] = useState(false)
    const [qnaTitle, setQnaTitle] = useState('')
    const [qnaContent, setQnaContent] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!qnaTitle || !qnaContent) {
            toast('제목과 내용을 입력해주세요')
            return
        }

        addInquiry({
            category: '제품 Q&A',
            text: `[${qnaTitle}] ${qnaContent}`,
            productId: product?.id || '',
            productName: product?.name || '',
        })

        setSubmitted(true)
    }

    const handleClose = () => {
        setShowQnaModal(false)
        setSubmitted(false)
        setQnaTitle('')
        setQnaContent('')
    }

    return (
        <div className="tab-qna">
            <div className="qna-header">
                <p>구매 전 궁금한 점을 문의해주세요.</p>
                <button onClick={() => {
                    if (!user) {
                        toast('로그인 후 이용해주세요')
                        return
                    }
                    setShowQnaModal(true)
                }}>문의하기</button>
            </div>

            {productQna && productQna.length > 0 ? (
                <ul className="qna-list">
                    {productQna.map((q) => (
                        <li key={q.id} className="qna-item">
                            <div className="qna-top">
                                <span className={`status ${q.status === '답변완료' ? 'done' : ''}`}>
                                    {q.status}
                                </span>
                                <span className="user">{q.user}</span>
                                <span className="date">{q.date}</span>
                            </div>
                            <p className="qna-title">Q.{q.title}</p>
                            <p className="qna-content">{q.content}</p>
                            {q.answer && (
                                <div className="qna-answer">
                                    <strong>A. 답변:</strong>
                                    <p>{q.answer}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-content">등록된 문의가 없습니다.</div>
            )}

            {showQnaModal && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="qna-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleClose}>✕</button>

                        {submitted ? (
                            <div className="qna-submitted">
                                <p className="submitted-icon">✅</p>
                                <h2>문의가 접수되었습니다.</h2>
                                <p>답변은 영업일 기준 1~3일 내에 등록됩니다.</p>
                                <button onClick={handleClose}>확인</button>
                            </div>
                        ) : (
                            <>
                                <h2>제품 문의하기</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="qna-modal-field">
                                        <p>제목</p>
                                        <input
                                            type="text"
                                            placeholder="제목을 입력하세요"
                                            value={qnaTitle}
                                            onChange={(e) => setQnaTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="qna-modal-field">
                                        <p>문의 내용</p>
                                        <textarea
                                            placeholder="문의 내용을 입력해주세요"
                                            value={qnaContent}
                                            onChange={(e) => setQnaContent(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit">문의 완료</button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}