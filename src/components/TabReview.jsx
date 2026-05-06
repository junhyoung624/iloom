import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase/firebase'
import {
    collection, query, where, orderBy,
    onSnapshot, doc, deleteDoc
} from 'firebase/firestore'
import { productReviews as initialData } from '../data/reviewData'
import ReviewModal from '../components/Reviewmodal'

export default function TabReview({ productId, user, onZoomImg, onWriteReview }) {
    const navigate = useNavigate()
    const [firestoreReviews, setFirestoreReviews] = useState([])
    const [editTarget, setEditTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)

    useEffect(() => {
        const q = query(
            collection(db, 'reviews'),
            where('productId', '==', String(productId)),
            orderBy('createdAt', 'desc')
        )

        const unsub = onSnapshot(q, (snap) => {
            setFirestoreReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        })

        return () => unsub()
    }, [productId])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setEditTarget(null)
                setDeleteTarget(null)
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    const reviews = [...firestoreReviews, ...initialData]

    const handleDelete = async () => {
        if (!deleteTarget) return
        await deleteDoc(doc(db, 'reviews', deleteTarget.id))
        toast('삭제되었습니다.')
        setDeleteTarget(null)
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0'

    return (
        <div className="tab-review">
            <div className="review-summary">
                <div className="review-rating-wrap">
                    <div className="rating-big">{avgRating}</div>
                </div>
                <div className="review-stars-row">
                    {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
                </div>
                <p>총 리뷰 {reviews.length}개</p>
            </div>

            {reviews.length > 0 ? (
                <ul className="review-list">
                    {reviews.map(r => (
                        <li key={r.id} className="review-item">
                            <div className="review-top">
                                <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                <span className="user">{r.userName}</span>
                                <span className="date">{r.date}</span>

                                {user?.uid === r.userId && (
                                    <div className="inquiry-item__actions">
                                        <button
                                            className="inquiry-item__btn edit"
                                            onClick={() => setEditTarget(r)}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="inquiry-item__btn delete"
                                            onClick={() => setDeleteTarget(r)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="review-title">{r.title}</p>
                            <div className="review-img">
                                {r.images?.map((img, idx) => (
                                    <img key={idx} src={img} alt={`review${idx + 1}`}
                                        onClick={() => onZoomImg(img)}
                                        style={{ cursor: 'pointer' }} />
                                ))}
                            </div>
                            <p className="review-content">{r.content}</p>
                            <span className="review-option">옵션: {r.option}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-content">아직 작성한 상품평이 없습니다.</p>
            )}

            <button className="review-write-btn" onClick={() => {
                if (!user) {
                    toast('로그인 후 이용해주세요')
                    navigate('/login')
                    return
                }
                onWriteReview()
            }}>
                상품평 작성하기
            </button>

            {/* 수정 모달 */}
            {editTarget && (
                <ReviewModal
                    onClose={() => setEditTarget(null)}
                    user={user}
                    selectedOption={editTarget.option}
                    productId={productId}
                    editData={editTarget}
                    onSuccess={() => setEditTarget(null)}
                />
            )}

            {/* 삭제 확인 팝업 */}
            {deleteTarget && (
                <>
                    <div className="delete-modal-overlay" onClick={() => setDeleteTarget(null)} />
                    <div className="delete-modal">
                        <div className="delete-modal__content">
                            <p className="delete-modal__heading">상품평을 삭제하시겠습니까?</p>
                            <p className="delete-modal__desc">삭제된 상품평은 복구할 수 없습니다.</p>
                        </div>
                        <div className="delete-modal__footer">
                            <button
                                className="delete-modal__cancel"
                                onClick={() => setDeleteTarget(null)}
                            >
                                취소
                            </button>
                            <button
                                className="delete-modal__confirm"
                                onClick={handleDelete}
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}