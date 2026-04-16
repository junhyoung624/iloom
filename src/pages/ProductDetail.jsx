import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productData } from '../data/productData'
import { useProductStore } from '../store/useProductStore'

const TABS = ['상세정보', '옵션', '인테리어 팁', '상품평', '제품Q&A', '배송/취소/반품']

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useProductStore()
    const product = productData.find(p => p.id === id)

    const [mainImg, setMainImg] = useState(0)
    const [selectedOption, setSelectedOption] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('상세정보')
    const [isWished, setIsWished] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        if (product?.options?.[0]?.values[0]) {
            setSelectedOption(product.options[0].values[0])
        }
    }, [id])

    if (!product) {
        return (
            <div className="not-found">
                <p>상품을 찾을 수 없습니다.</p>
                <button onClick={() => navigate(-1)}>뒤로가기</button>
            </div>
        )
    }

    const priceNum = parseInt(product.price.replace(/,/g, ''))
    const totalPrice = (priceNum * quantity).toLocaleString()

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        const el = document.getElementById('tab-content')
        if (el) el.scrollIntoView({ behavier: 'smooth' })
    }

    const handleAddCart = () => {
        if (product.options?.length > 0 && !selectedOption) {
            alert('옵션을 선택해주세요')
            return
        }

        addToCart(product, { color: selectedOption }, quantity)
        alert('장바구니에 담겼습니다')
        navigate('/cart')
    }

    return (
        <div className="product-detail">
            <div className="breadcrumb">
                <Link to="/">홈</Link>
                <span>&gt;</span>
                <Link to={`/category/${product.originalCategory}`}>{product.originalCategory}</Link>
                <span>&gt;</span>
                <span>{product.category2}</span>
            </div>

            <div className="detail-top">
                <div className="image-area">
                    <div className="main-image">
                        <img src={product.productImages[mainImg]} alt={product.name} />
                    </div>
                    {product.productImages.length > 1 && (
                        <div className="thumb-list">
                            {product.productImages.map((img, i) => (
                                <div>
                                    <img src={img} alt={`썸네일${i + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="info-area">
                    <div className="info-top">
                        <p className="brand">일룸</p>
                        <h1 className="product-name">{product.name}</h1>
                        <p className="series">{product.series}</p>
                    </div>

                    {product.productImages.length > 1 && (
                        <div className='color-options'>
                            {product.productImages.map((img, i) => (
                                <div
                                    key={i}
                                    className={`color-thumb ${mainImg === i ? 'active' : ''}`}
                                    onClick={() => setMainImg(i)}>
                                    <img src={img} alt={`옵션${i + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    {product.options?.map((opt, i) => (
                        <div
                            key={i}
                            className="option-select">
                            <select
                                value={selectedOption}
                                onChange={e => setSelectedOption(e.target.value)}>
                                <option value="">[필수] {opt.name}을 선택해주세요</option>
                                {opt.values.map((v, j) => (
                                    <option key={j} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    ))}

                    {selectedOption && (
                        <div className="selected-option-box">
                            <div className="selected-info">
                                <span>{product.name} / {selectedOption}</span>
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

                    {/* 총구매가 */}
                    <div className="total-price-row">
                        <span>총 구매가</span>
                        <strong>{totalPrice}원</strong>
                    </div>

                    <div className="action-btns">
                        <button className="buy" onClick={() => alert('결제 페이지로 이동')}>결제하기</button>
                        <button className="cart" onClick={handleAddCart}>장바구니</button>
                    </div>


                    <div className="icon-btns">
                        <button className={`wish-btn ${isWished ? 'active' : ''}`}
                            onClick={() => setIsWished(w => !w)}>
                            <img src={isWished ? '/images/product-detail/like.png' : '/images/product-detail/unlike.png'} alt="wish"
                                style={{ width: '20px', height: '20px' }} />
                        </button>
                        <button className="share-btn" onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            alert('링크가 복사되었습니다');
                        }}><img src="/images/product-detail/share.png" alt="공유하기" /></button>
                    </div>
                </div>
            </div>

            <div className="product-info-table">
                <h3>상품필수정보</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>품목</td>
                            <td>{product.category2}</td>
                            <td>품명</td>
                            <td>{product.name}</td>
                        </tr>
                        <tr>
                            <td>크기(mm/중량kg)</td>
                            <td>*상품페이지 참고</td>
                            <td>색상</td>
                            <td>{product.options?.find(o => o.name === '색상')?.values.join(', ') || '*상품페이지 참고'}</td>
                        </tr>
                        <tr>
                            <td>구성품</td>
                            <td>*상품페이지 참고</td>
                            <td>제조자/제조국</td>
                            <td>일룸OEM/대한민국</td>
                        </tr>
                        <tr>
                            <td>주요 소재/재질</td>
                            <td>{product.material || '*상품페이지 참고'}</td>
                            <td>판매자/수입자</td>
                            <td>(주)일룸</td>
                        </tr>
                        <tr>
                            <td>배송/설치비용</td>
                            <td>해당사항 없음</td>
                            <td>품질보증기준</td>
                            <td>소비자보호법에 의한 1년 무상 A/S</td>
                        </tr>
                        <tr>
                            <td>AS/책임자와 전화번호</td>
                            <td colSpan={3}>일룸 고객센터 1577-5670</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="tab-nav">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab)}>{tab}</button>
                ))}
            </div>

            <div id="tab-content" className="tab-content">
                {activeTab === '상세정보' && (
                    <div className="tab-detail">
                        {product.detailImg && product.detailImg.length > 0 ? (
                            product.detailImg.map((img, i) => (
                                <img key={i} src={img} alt={`상세이미지${i + 1}`} />
                            ))
                        ) : (
                            <p className="no-content">상세이미지가 없습니다.</p>
                        )}
                    </div>
                )}

                {activeTab === '옵션' && (
                    <div className="tab-option">
                        <h3>구매 가능한 옵션</h3>
                        {product.options?.map((opt, i) => (
                            <div key={i} className="option-group">
                                <p className="opt-name">{opt.name}</p>
                                <div className="opt-values">
                                    {opt.values.map((v, j) => (
                                        <span key={j} className="opt-chip">{v}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                    <div className="tab-review">
                        <div className="review-summary">
                            <div className="rating-big">4.5</div>
                            <div className="stars">★★★★☆</div>
                            <p>총 리뷰 0개</p>
                        </div>
                        <div className="no-content">아직 작성된 상품평이 없습니다. 첫 번째 상품평을 남겨보세요!</div>
                        <button className="review-write-btn" onClick={() => alert('로그인 후 이용해주세요')}>상품평 작성하기</button>
                    </div>
                )}

                {activeTab === '제품 Q&A' && (
                    <div className="tab-qna">
                        <div className="qna-header">
                            <p>구매 전 궁금한 점을 문의해주세요.</p>
                            <button onClick={() => alert('로그인 후 이용해주세요')}>문의하기</button>
                        </div>
                        <div className="no-content">등록된 문의가 없습니다</div>
                    </div>
                )}

                {activeTab === '배송/취소/반품' && (
                    <div className="tab-delivery">
                        <div className="delivery-section">
                            <h3>01.배송비</h3>
                            <ul>
                                <li>- 전국 무료 배송 및 설치를 진행하고 있습니다.</li>
                                <li>- 제주도는 제주 지역 배송비 부담 시, 온라인 주문도 가능합니다. (아래 "제주 지역 배송비 관련" 내용 참고)</li>
                                <li>- 단, 제주도를 제외한 울릉도 등 도서/산간 지역의 경우 택배상품만 온라인 주문이 가능합니다. 설치배송은 가까운 매장에 문의 부탁드립니다.</li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>※ 제주 지역 배송비 관련</h3>
                            <ul>
                                <li>1) 배송비 안내</li>
                                <li>제주 지역 배송비는 소비자가(정가)의 약 4%입니다.</li>
                                <li>정확한 금액은 주문 이후 결제안내 알림톡을 통해 확인가능합니다.</li>
                                <li>2)배송비 입금</li>
                                <li>주문 이후 발송되는 결제 안내 알림톡을 통해</li>
                                <li></li>
                                <li></li>
                                <li></li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>설치배송 상품 배송안내</h3>
                            <div className="delivery-process">
                                <div className="process-step"><span>주문 당일</span><p>배송예정일 확정 알림톡 발송</p></div>
                                <div className="process-arrow">▶</div>
                                <div className="process-step"><span>배송 전 3일까지</span><p>배송일 변경 가능</p></div>
                                <div className="process-arrow">▶</div>
                                <div className="process-step"><span>배송 전일 오후</span><p>배송 확정 알림톡 발송</p></div>
                                <div className="process-arrow">▶</div>
                                <div className="process-step"><span>배송 당일</span><p>설치완료 후 수령확인 서명</p></div>
                            </div>
                            <ul>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
