import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productData } from '../data/productData'
import { colorData } from '../data/colorData'
import { productReviews as initialData } from '../data/reviewData'
import { commonQna } from '../data/qnaData'
import "./scss/product-detail.scss"
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import { Lens } from './Lens'
import CheckUserModal from './CheckUserModal'

import CartModal from '../components/CartModal'
import ZoomModal from '../components/Zoommodal'
import ReviewModal from '../components/Reviewmodal'
import TabDetail from '../components/Tabdetail'
import TabOption from '../components/Taboption'
import TabReview from '../components/TabReview'
import TabQna from '../components/TabQna'
import TabDelivery from '../components/TabDelivery'
import toast from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'
import EmptyState from '../components/EmptyState'

const TABS = ['상세정보', '옵션', '인테리어 팁', '상품평', '제품Q&A', '배송/취소/반품']

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart, isWished, onToggleWishList, wishlist } = useProductStore()
    const { user } = useAuthStore()
    const product = productData.find(p => p.id === id)

    const [mainImg, setMainImg] = useState(0)
    const [selectedOption, setSelectedOption] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('상세정보')
    const [showCartModal, setShowCartModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showCheckUserModal, setShowCheckUserModal] = useState(false)
    const [zoomImg, setZoomImg] = useState(null)
    const [productReviews, setProductReviews] = useState(initialData)
    const wished = wishlist?.some(item => item.id === id)

    useEffect(() => {
        window.scrollTo(0, 0)
        setSelectedOption('')
        setMainImg(0)
    }, [id])

    useEffect(() => {
        if (!product) return
        const recentItems = JSON.parse(localStorage.getItem("recentProducts") || "[]")
        const newItem = {
            id: product.id,
            name: product.name,
            image: product.productImages?.[0] || "",
            price: product.price,
        }
        const filtered = recentItems.filter((item) => item.id !== product.id)
        const updated = [newItem, ...filtered].slice(0, 10)
        localStorage.setItem("recentProducts", JSON.stringify(updated))
    }, [product])

    if (!product) {
        return (
            <EmptyState
                title="상품을 찾을 수 없습니다."
                desc="상품이 삭제되었거나 주소가 변경되었습니다."
                buttonText="홈으로 돌아가기"
                to="/"
            />
        )
    }

    const priceNum = parseInt(product.price.replace(/,/g, ''))
    const totalPrice = (priceNum * quantity).toLocaleString()
    const colorItem = colorData.find(c => c.productCd === product.id)
    const firstImg = product.productImages[0] || ''
    const hasThumbnail = colorItem && !colorItem.colorCd.some(cd => firstImg.includes(cd))
    const productQna = commonQna

    const getColorImg = (colorValue) => {
        if (!colorItem) return null
        const codes = Array.isArray(colorItem.colorCd) ? colorItem.colorCd : [colorItem.colorCd]
        const paths = Array.isArray(colorItem.localImgPath) ? colorItem.localImgPath : [colorItem.localImgPath]
        const idx = codes.indexOf(colorValue)
        return idx !== -1 ? paths[idx] : null
    }

    const handleBuy = () => {
        if (product.options?.length > 0 && !selectedOption) {
            toast('옵션을 선택해주세요')
            return
        }
        user
            ? navigate('/charge', { state: { directBuyItem: { ...product, color: selectedOption, qty: quantity } } })
            : setShowCheckUserModal(true)
    }

    const handleAddCart = () => {
        if (product.options?.length > 0 && !selectedOption) {
            toast('옵션을 선택해주세요')
            return
        }
        addToCart(product, { color: selectedOption }, quantity)
        setShowCartModal(true)
    }

    const handleWishClick = () => {
        if (!user) {
            toast('로그인 후 이용해주세요.')
            navigate('/login')
            return
        }
        onToggleWishList(product, user)
    }

    const handleReviewSubmit = (newReview) => {
        setProductReviews(prev => [newReview, ...prev])
    }

    return (
        <section className="product-detail">
            <Helmet>
                <title>{product.name} | iloom</title>
                <meta name="description" content='{product.series} {product.name} - ${product.price}원' />
            </Helmet>
            <div className="breadcrumb">
                <Link to="/"><img src='/images/logo-icon/home-icon.png' alt="home" /></Link>
                <span>&gt;</span>
                <Link to={`/${product.originalCategory}`}>{product.originalCategory}</Link>
                <span>&gt;</span>
                <span>{product.category2}</span>
            </div>

            <div className="detail-top">
                {/* 이미지 영역 */}
                <div className="image-area">
                    <div className="main-image">
                        <Lens zoomFactor={1.5} lensSize={250}>
                            <img src={product.productImages[mainImg]} alt={product.name} />
                        </Lens>
                    </div>
                    {hasThumbnail && (
                        <div className="thumb-list">
                            <div className={mainImg === 0 ? 'active' : ''} onClick={() => setMainImg(0)}>
                                <img src={product.productImages[0]} alt="썸네일" />
                            </div>
                        </div>
                    )}
                </div>

                {/* 정보 영역 */}
                <div className="info-area">
                    <div className="info-top">
                        <p className="brand">{product.series}</p>
                        <h1 className="product-name">{product.name}</h1>
                        <div className="icon-btns">
                            <button className={`wish-btn ${wished ? 'active' : ''}`} onClick={handleWishClick}>
                                <img src={wished ? '/images/product-detail/like.png' : '/images/product-detail/unlike.png'}
                                    alt="wish" style={{ width: '24px', height: '21px' }} />
                            </button>
                            <button className="share-btn" onClick={() => {
                                navigator.clipboard.writeText(window.location.href)
                                toast('링크가 복사되었습니다')
                            }}>
                                <img src="/images/product-detail/share.png" alt="공유하기"
                                    style={{ width: '27px', height: '27px' }} />
                            </button>
                        </div>
                    </div>

                    <div className="delivery-info">
                        <strong>배송기간</strong><p>약 10일</p>
                        <strong>배송비</strong><p>무료배송</p>
                        <strong>배송방법</strong><p>설치배송</p>
                        <strong>제품코드</strong><p>{product.id}</p>
                    </div>

                    {/* 옵션 선택 */}
                    {product.options?.map((opt, i) => (
                        <div key={i} className="option-select">
                            <div className="custom-select" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                {selectedOption ? (
                                    <span className="selected-value">
                                        {getColorImg(selectedOption) && (
                                            <img src={`/images/${getColorImg(selectedOption)}`} alt={selectedOption} />
                                        )}
                                        {selectedOption}
                                    </span>
                                ) : (
                                    <span className="placeholder">[필수] {opt.name}을 선택해주세요</span>
                                )}
                                <span className="arrow">
                                    <img src="/images/product-detail/down-arrow.png" alt="down-arrow" />
                                </span>
                            </div>
                            {isDropdownOpen && (
                                <ul className="dropdown-list">
                                    {(Array.isArray(opt.values) ? opt.values : [opt.values]).map((v, j) => (
                                        <li key={j} onClick={() => {
                                            setSelectedOption(v)
                                            setIsDropdownOpen(false)
                                            const imgIndex = hasThumbnail ? j + 1 : j
                                            if (product.productImages[imgIndex]) setMainImg(imgIndex)
                                        }}>
                                            {getColorImg(v) && (
                                                <img src={`/images/${getColorImg(v)}`} alt={v} />
                                            )}
                                            <span>{v}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}

                    {/* 제품 이미지 목록 */}
                    {product.productImages && product.productImages.length > 0 && (
                        <div className="color-product-images">
                            <p className="color-product-label">제품 이미지</p>
                            <div className="color-product-list">
                                {(hasThumbnail ? product.productImages.slice(1) : product.productImages).map((img, i) => (
                                    <div key={i}
                                        className={`color-product-item ${mainImg === (hasThumbnail ? i + 1 : i) ? 'active' : ''}`}
                                        onClick={() => setMainImg(hasThumbnail ? i + 1 : i)}>
                                        <img src={img} alt={`제품이미지${i + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 수량/가격 */}
                    {(selectedOption || product.options?.length === 0) && (
                        <div className="selected-option-box">
                            <div className="selected-info">
                                <span>{product.name}{selectedOption ? ` / ${selectedOption}` : ''}</span>
                            </div>
                            <div className="qty-price-row">
                                <div className="qty-control">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                </div>
                                <span className="item-price">{(priceNum * quantity).toLocaleString()}원</span>
                            </div>
                        </div>
                    )}

                    <div className="total-price-row">
                        <span>총 구매가</span>
                        <strong>{totalPrice}원</strong>
                    </div>

                    <div className="action-btns">
                        <button className="buy" onClick={handleBuy}>결제하기</button>
                        <button className="cart" onClick={handleAddCart}>장바구니</button>
                    </div>
                </div>
            </div>

            {/* 상품 필수 정보 */}
            <div className="product-info-table">
                <h3>상품필수정보</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>품목</td><td>{product.category2}</td>
                            <td>품명</td><td>{product.name}</td>
                        </tr>
                        <tr>
                            <td>크기(mm/중량kg)</td><td>*상품페이지 참고</td>
                            <td>색상</td>
                            <td>{Array.isArray(product.options?.find(o => o.name === '색상')?.values)
                                ? product.options.find(o => o.name === '색상').values.join(', ')
                                : product.options?.find(o => o.name === '색상')?.values || '*상품페이지 참고'}</td>
                        </tr>
                        <tr>
                            <td>구성품</td><td>*상품페이지 참고</td>
                            <td>제조자/제조국</td><td>일룸OEM/대한민국</td>
                        </tr>
                        <tr>
                            <td>주요 소재/재질</td><td>{product.material || '*상품페이지 참고'}</td>
                            <td>판매자/수입자</td><td>(주)일룸</td>
                        </tr>
                        <tr>
                            <td>배송/설치비용</td><td>해당사항 없음</td>
                            <td>품질보증기준</td><td>소비자보호법에 의한 1년 무상 A/S</td>
                        </tr>
                        <tr>
                            <td>AS/책임자와 전화번호</td>
                            <td colSpan={3}>일룸 고객센터 1577-5670</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 탭 */}
            <div className="tab-nav">
                {TABS.map(tab => (
                    <button key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div id="tab-content" className="tab-content">
                {activeTab === '상세정보' && <TabDetail product={product} />}
                {activeTab === '옵션' && <TabOption product={product} getColorImg={getColorImg} />}
                {activeTab === '인테리어 팁' && (
                    <div className="tab-interior">
                        <div className="interior-tip">
                            <h3>🛋️인테리어 활용 팁</h3>
                            <ul>
                                <li>침실 공간을 최대한 활용하기 위해 벽 가까이 배치하세요.</li>
                                <li>자연광이 들어오는 방향으로 배치하면 더 넓어 보이는 효과가 있습니다.</li>
                                <li>동일 시리즈 제품과 함께 코디하면 통일감 있는 인테리어가 완성됩니다.</li>
                                <li>러그나 커튼을 활용하면 분위기를 더욱 풍성하게 연출할 수 있습니다.</li>
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === '상품평' && (
                    <TabReview
                        productReviews={productReviews}
                        user={user}
                        onZoomImg={setZoomImg}
                        onWriteReview={() => setShowReviewModal(true)}
                    />
                )}
                {activeTab === '제품Q&A' && <TabQna productQna={productQna} user={user} product={product} />}
                {activeTab === '배송/취소/반품' && <TabDelivery />}
            </div>

            {/* 모달들 */}
            <ZoomModal zoomImg={zoomImg} onClose={() => setZoomImg(null)} />

            {showCartModal && <CartModal onClose={() => setShowCartModal(false)} />}

            {showReviewModal && (
                <ReviewModal
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleReviewSubmit}
                    user={user}
                    selectedOption={selectedOption}
                />
            )}

            {showCheckUserModal && (
                <CheckUserModal
                    moveToLogin={() => { setShowCheckUserModal(false); navigate('/login') }}
                    moveToGuestCharge={() => {
                        setShowCheckUserModal(false)
                        navigate('/charge', { state: { directBuyItem: { ...product, color: selectedOption, qty: quantity } } })
                    }}
                />
            )}
        </section>
    )
}