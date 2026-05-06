import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { db } from '../firebase/firebase'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'

export default function ReviewModal({ onClose, onSuccess, user, selectedOption, productId, editData }) {
    const isEdit = !!editData

    const [reviewRating, setReviewRating] = useState(editData?.rating || 5)
    const [reviewTitle, setReviewTitle] = useState(editData?.title || '')
    const [reviewContent, setReviewContent] = useState(editData?.content || '')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!reviewTitle || !reviewContent) {
            toast('제목과 내용을 입력해주세요')
            return
        }

        try {
            if (isEdit) {
                await updateDoc(doc(db, 'reviews', editData.id), {
                    rating: reviewRating,
                    title: reviewTitle,
                    content: reviewContent,
                    updatedAt: serverTimestamp(),
                })
                toast('수정되었습니다.')
            } else {
                await addDoc(collection(db, 'reviews'), {
                    productId: String(productId),
                    userId: user.uid,
                    userName: user.name || '익명',
                    rating: reviewRating,
                    title: reviewTitle,
                    content: reviewContent,
                    option: selectedOption || '',
                    images: [],
                    date: new Date().toISOString().split('T')[0],
                    createdAt: serverTimestamp(),
                })
                toast('상품평이 등록되었습니다!')
            }
            onSuccess()
        } catch (err) {
            console.error(err)
            toast.error('오류가 발생했습니다.')
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2>{isEdit ? '상품평 수정' : '상품평 작성'}</h2>
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
                    <button type="submit">{isEdit ? '수정하기' : '등록하기'}</button>
                </form>
            </div>
        </div>
    )
}