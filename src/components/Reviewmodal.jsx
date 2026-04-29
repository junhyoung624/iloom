import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function ReviewModal({ onClose, onSubmit, user, selectedOption }) {
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewTitle, setReviewTitle] = useState('')
    const [reviewContent, setReviewContent] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!reviewTitle || !reviewContent) {
            toast('제목과 내용을 입력해주세요')
            return
        }
        const newReview = {
            id: Date.now(),
            userName: user?.name || '익명',
            rating: reviewRating,
            date: new Date().toISOString().split('T')[0],
            title: reviewTitle,
            content: reviewContent,
            option: selectedOption || '',
            images: []
        }
        onSubmit(newReview)
        toast('상품평이 등록되었습니다!')
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2>상품평 작성</h2>
                <form onSubmit={handleSubmit}>
                    <div className="review-modal-rating">
                        <p>별점</p>
                        <div className="star-select">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star}
                                    onClick={() => setReviewRating(star)}
                                    style={{ cursor: 'pointer', color: star <= reviewRating ? '#c8091e' : '#ddd', fontSize: '28px' }}>
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="review-modal-field">
                        <p>제목</p>
                        <input type="text" placeholder="제목을 입력하세요"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)} />
                    </div>
                    <div className="review-modal-field">
                        <p>내용</p>
                        <textarea placeholder="상품평을 작성해주세요"
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)} />
                    </div>
                    <button type="submit">등록하기</button>
                </form>
            </div>
        </div>
    )
}