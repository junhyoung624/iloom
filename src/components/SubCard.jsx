import React, { useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import './scss/Card.scss'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const FALLBACK_IMAGE = '/images/no-image.png'

const getImage = (item, index) => {
    return item?.productImages?.[index] || item?.productImages?.[0] || FALLBACK_IMAGE
}

const SubCard = ({ item }) => {
    const { onToggleWishList, wishlist } = useProductStore()
    const { user } = useAuthStore()
    const navigate = useNavigate()

    const [isHoverHeart, setIsHoverHeart] = useState(false)
    const [isDefaultLoaded, setIsDefaultLoaded] = useState(false)
    const [defaultSrc, setDefaultSrc] = useState(getImage(item, 1))
    const [hoverSrc, setHoverSrc] = useState(getImage(item, 0))

    const isLiked = wishlist.some((wishItem) => wishItem.id === item.id)
    const isActiveHeart = isLiked || isHoverHeart

    const handleHeartClick = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            toast.error('로그인 후 이용해주세요.')
            navigate('/login')
            return
        }

        onToggleWishList(item, user)
        toast.success(isLiked ? '위시리스트에서 삭제되었습니다.' : '위시리스트에 추가되었습니다.')
    }

    return (
        <Link to={`/product/${item.id}`} className="sub-card-link">
            <div className="sub-card">
                <div className={`card-img-box ${isDefaultLoaded ? 'loaded' : ''}`}>
                    {!isDefaultLoaded && <div className="card-img-skeleton" />}

                    <img
                        src={defaultSrc}
                        alt={item.name || '상품이미지'}
                        className="product-img default"
                        onLoad={() => setIsDefaultLoaded(true)}
                        onError={() => {
                            setDefaultSrc(FALLBACK_IMAGE)
                            setIsDefaultLoaded(true)
                        }}
                    />

                    <img
                        src={hoverSrc}
                        alt={item.name || '상품이미지'}
                        className="product-img hover"
                        onError={() => {
                            setHoverSrc(defaultSrc || FALLBACK_IMAGE)
                        }}
                    />
                </div>

                <div className="card-text-box">
                    <div className="series-row">
                        <button
                            type="button"
                            className={`heart-btn ${isActiveHeart ? 'active' : ''}`}
                            onClick={handleHeartClick}
                            onMouseEnter={() => setIsHoverHeart(true)}
                            onMouseLeave={() => setIsHoverHeart(false)}
                            aria-label="위시리스트"
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

                    <div className="product-info">
                        <h1 className="series-name">{item.series}</h1>
                        <p className="product-name">{item.name}</p>
                        <p className="price">{item.price} 원</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default SubCard