import React, { useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import "./scss/Card.scss"

const SubCard = ({ item }) => {
    const { onToggleWishList, wishlist } = useProductStore()
    const [isHoverHeart, setIsHoverHeart] = useState(false)

    const isLiked = wishlist.some((wishItem) => wishItem.id === item.id)
    const isActiveHeart = isLiked || isHoverHeart

    const handleHeartClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggleWishList(item)
    }

    return (
        <div className="sub-card">
            <div className="card-img-box">
                <img
                    src={item.productImages[0]}
                    alt="상품이미지"
                    className="product-img"
                />
            </div>

            <div className="card-text-box">
                <div className="series-row">
                    <h1 className="series-name">{item.series}</h1>

                    <button
                        type="button"
                        className={`heart-btn ${isActiveHeart ? "active" : ""}`}
                        onClick={handleHeartClick}
                        onMouseEnter={() => setIsHoverHeart(true)}
                        onMouseLeave={() => setIsHoverHeart(false)}
                    >
                        <img
                            src="/images/logo-icon/heart-lined.png"
                            alt="빈 하트"
                            className="heart heart-line"
                        />
                        <img
                            src="/images/logo-icon/heart-filled.png"
                            alt="찜한 하트"
                            className="heart heart-fill"
                        />
                    </button>
                </div>

                <p className="product-name">{item.name}</p>
                <p className="price">{item.price} 원</p>
            </div>
        </div>
    )
}

export default SubCard