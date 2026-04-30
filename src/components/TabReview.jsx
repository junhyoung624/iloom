
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function TabReview({ productReviews, user, onZoomImg, onWriteReview }) {
    const navigate = useNavigate()

    const avgRating = productReviews && productReviews.length > 0
        ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
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
                <p>총 리뷰 {productReviews.length}개</p>
            </div>

            {productReviews.length > 0 ? (
                <ul className="review-list">
                    {productReviews.map(r => (
                        <li key={r.id} className="review-item">
                            <div className="review-top">
                                <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                <span className="user">{r.userName}</span>
                                <span className="date">{r.date}</span>
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
        </div>
    )
}