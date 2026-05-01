import React, { useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import "./scss/Card.scss"
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCompareStore } from '../store/useCompareStore'

const Card = ({ item, showCompare = false }) => {
    const { onToggleWishList, wishlist } = useProductStore()
    const { user } = useAuthStore()
    const navigate = useNavigate()



    const [isHoverHeart, setIsHoverHeart] = useState(false)
    const [isImgLoaded, setIsImgLoaded] = useState(false)

    const { compareList, onToggleCompare } = useCompareStore()
    const isCompared = compareList.some((c) => c.id === item.id)

    const isLiked = wishlist.some((wishItem) => wishItem.id === item.id)
    const isActiveHeart = isLiked || isHoverHeart


    const handleHeartClick = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            toast('로그인 후 이용해주세요.')
            navigate('/login')
            return
        }

        onToggleWishList(item, user)
    }

    const handleCompareClick = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (isChecked) {
            removeCompare(item.id)
            toast('비교 목록에서 제외되었습니다.')
            return
        }

        const success = addCompare(item)

        if (!success) {
            toast('최대 3개까지 비교할 수 있어요.')
            return
        }

        toast('비교 목록에 추가되었습니다.')
    }


    const handleCompareClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const success = onToggleCompare(item)
        if (success === false) {
            toast.error('최대 3개까지만 비교할 수 있어요.')
        }
    }

    return (
        <div className="sub-card">
            <div className={`card-img-box ${isImgLoaded ? 'loaded' : ''}`}>
                {!isImgLoaded && <div className="card-img-skeleton" />}

                <img
                    src={item.productImages[0]}
                    alt="상품이미지"
                    className="product-img default"
                    onLoad={() => setIsImgLoaded(true)}
                />

                <img
                    src={item.productImages[1]}
                    alt="상품이미지"
                    className="product-img hover"
                />
            </div>

            <div className="card-text-box">
                <div className="series-row">
                    {showCompare && (
                        <button
                            type="button"
                            className={`compare-btn ${isChecked ? 'active' : ''}`}
                            onClick={handleCompareClick}
                        >
                            {isChecked ? '비교중' : '비교'}
                        </button>
                        <button
                            type="button"
                            className={`compare-btn ${isCompared ? 'active' : ''}`}
                            onClick={handleCompareClick}
                            aria-label="비교 추가"
                        >
                            <span className="compare-dot" />
                            <span className="compare-label">{isCompared ? '비교중' : '비교'}</span>
                        </button>
                    </div>

                <div className="product-info">
                    <h1 className="series-name">{item.series}</h1>
                    <p className="product-name">{item.name}</p>
                    <p className="price">{item.price} 원</p>
                </div>
            </div>
        </div>
    )
}

export default Card