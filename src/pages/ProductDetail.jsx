import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productData } from '../data/productData'
import { colorData } from '../data/colorData'
import { productReviews as initialData } from '../data/reviewData'
import { commonQna } from '../data/qnaData'
import "./scss/product-detail.scss"
import { useProductStore } from '../store/useProductStore'

const TABS = ['상세정보', '옵션', '인테리어 팁', '상품평', '제품Q&A', '배송/취소/반품']

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useProductStore()
    const product = productData.find(p => p.id === id)

    const [mainImg, setMainImg] = useState(0)
    const [selectedOption, setSelectedOption] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('상세정보')
    const [showCartModal, setShowCartModal] = useState(false)
    //const [isWished, setIsWished] = useState(false)
    const { onToggleWishList, isWished } = useProductStore();
    const wished = isWished(id);

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
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    const getColorImg = (colorValue) => {
        const colorItem = colorData.find(c => c.productCd === product.id)
        if (!colorItem) return null

        const codes = Array.isArray(colorItem.colorCd) ? colorItem.colorCd : [colorItem.colorCd]
        const paths = Array.isArray(colorItem.localImgPath) ? colorItem.localImgPath : [colorItem.localImgPath]

        const idx = codes.indexOf(colorValue)
        return idx !== -1 ? paths[idx] : null
    }

    // const productReviews = reviewData.find(r => r.productId === id)?.reviews || []
    // const productReviews = reviewData.flatMap(r => r.reviews) || [];
    const [productReviews, setProductReviews] = useState(initialData);
    // const productQna = qnaData.flatMap(q => q.questions) || [];
    const productQna = commonQna;

    const avgRating = productReviews && productReviews.length > 0
        ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) : '0.0'

    const handleBuy = () => {
        if (product.options?.length > 0 && !selectedOption) {
            alert('옵션을 선택해주세요')
            return
        }
        navigate('/order', { state: { product, option: selectedOption, quantity } })
    }

    const handleAddCart = () => {
        if (product.options?.length > 0 && !selectedOption) {
            alert('옵션을 선택해주세요')
            return
        }
        addToCart(product, { color: selectedOption }, quantity)
        setShowCartModal(true)
    }

    return (
        <section className="product-detail">
            <div className="breadcrumb">
                <Link to="/"><img src='/images/product-detail/home.png' alt="home" /></Link>
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
                    <div className="thumb-list">
                        <div className={mainImg === 0 ? 'active' : ''} onClick={() => setMainImg(0)}><img src={product.productImages[0]} alt="thumb1" />
                        </div>
                    </div>
                </div>

                <div className="info-area">
                    <div className="info-top">
                        <p className="brand">{product.series}</p>
                        <h1 className="product-name">{product.name}</h1>
                        <div className="icon-btns">
                            <button className={`wish-btn ${wished ? 'active' : ''}`}
                                onClick={() => onToggleWishList(product)}>
                                <img src={wished ? '/images/product-detail/like.png' : '/images/product-detail/unlike.png'} alt="wish"
                                    style={{ width: '24px', height: '21px' }} />
                            </button>
                            <button className="share-btn" onClick={() => {
                                navigator.clipboard.writeText(window.location.href)
                                alert('링크가 복사되었습니다');
                            }}><img src="/images/product-detail/share.png" alt="공유하기"
                                style={{ width: '27px', height: '27px' }} /></button>
                        </div>
                    </div>
                    <div className="delivery-info">
                        <strong>배송기간</strong>
                        <p>약 10일</p>
                        <strong>배송비</strong>
                        <p>무료배송</p>
                        <strong>배송방법</strong>
                        <p>설치배송</p>
                        <strong>제품코드</strong>
                        <p>{product.id}</p>
                    </div>

                    {product.options?.map((opt, i) => (
                        <div
                            key={i}
                            className="option-select">
                            <div className="custom-select" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                {selectedOption ? (
                                    <span className="selected-value">
                                        {getColorImg(selectedOption) && (
                                            <img src={`/${getColorImg(selectedOption)}`} alt={selectedOption} />
                                        )}
                                        {selectedOption}
                                    </span>
                                ) : (
                                    <span className="placeholder">[필수] {opt.name}을 선택해주세요</span>
                                )}
                                <span className="arrow"><img src="/images/product-detail/down-arrow.png" alt="down-arrow" /></span>
                            </div>

                            {isDropdownOpen && (
                                <ul className="dropdown-list">
                                    {opt.values.map((v, j) => (
                                        <li key={j}
                                            onClick={() => {
                                                setSelectedOption(v)
                                                setIsDropdownOpen(false)
                                            }}>
                                            {getColorImg(v) && (
                                                <img src={`/${getColorImg(v)}`} alt={v} />
                                            )}
                                            <span>{v}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}

                    {selectedOption && product.productImages && product.productImages.length > 0 && (
                        <div className="color-product-images">
                            <p className="color-product-label">제품 이미지</p>
                            <div className="color-product-list">
                                {product.productImages.map((img, i) => (
                                    <div key={1}
                                        className={`color-product-item ${mainImg === i ? 'active' : ''}`}
                                        onCilck={() => setMainImg(i)}>
                                        <img src={img} alt={`제품이미지${i + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                <div className="opt-values-grid">
                                    {opt.values.map((v, j) => (
                                        <div key={j} className="opt-chip-item">
                                            {opt.name === '색상' && getColorImg(v) && (
                                                <img src={getColorImg(v)} alt={v} className="chip-img" />
                                            )}
                                            <span key={j} className="opt-chip">{v}</span>
                                        </div>
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
                                                <img key={idx} src={img} alt={`review${idx + 1}`} />
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
                        <button className="review-write-btn" onClick={() => alert('로그인 후 이용해주세요')}>상품평 작성하기</button>
                    </div>
                )}

                {activeTab === '제품Q&A' && (
                    <div className="tab-qna">
                        <div className="qna-header">
                            <p>구매 전 궁금한 점을 문의해주세요.</p>
                            <button onClick={() => alert('로그인 후 이용해주세요')}>문의하기</button>
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
                                <li>주문 이후 발송되는 결제 안내 알림톡을 통해 결제 가능합니다.</li>
                                <li>제주배송비 결제는 알림톡 수신일 포함 2일 이내에 진행해 주셔야 합니다. (기간 안에 결제되지 않을 경우 주문은 자동 취소되며, 상품 배송 원하실 경우 재주문으로 진행해 주셔야 하는 점 양해 부탁드립니다.)</li>
                                <li>배송비 결제 안내 알림톡을 수신하지 못한 경우 고객센터로 문의 부탁드립니다.(주말/공휴일 제외)</li>
                                <li>배송비도 현금영수증 발행이 가능하오니, 결제 시 현금영수증 정보를 입력해주세요.</li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>02.설치배송 상품 배송안내</h3>
                            <ul>
                                <li>일룸은 전문시공기사가 배송과 동시에 설치까지 해드립니다. 완제품 배송이 아닌 설치 제품으로 아래 내용을 꼭 숙지해주세요.</li>
                            </ul>
                            <div className="delivery-process">
                                <div className="process-step"><span>주문 당일</span><p>배송예정일 확정 알림톡 발송</p></div>
                                <div className="process-arrow">▶</div>
                                <div className="process-step"><span>배송 전 3일까지</span><p>배송일 변경 가능</p></div>
                                <div className="process-arrow">▶</div>
                                <div className="process-step"><span>배송 전일 오후</span><p>배송 확정 알림톡 발송</p></div>
                                <div className="process-arrow">▶</div>
                                <div className="process-step"><span>배송 당일</span><p>설치완료 후 수령확인 서명진행</p></div>
                            </div>
                            <ul>
                                <li>배송은 주문 확인 후 영업일 기준 7~10일 (주말, 공휴일 제외) 정도 소요합니다. 일요일 및 공휴일에는 배송(시공)을 하지 않습니다.</li>
                                <li>성수기(1~4월) 기간은 별도 배송공지에 따라 운영됩니다.</li>
                                <li>배송일 지정은 주문 당일 알림톡을 받으신 후 AI챗봇을 통해 직접 변경하실 수 있습니다.
                                    만약 주문일의 익일 15시까지 알림톡을 수신하지 못한 경우, 일룸 고객센터(1588-6792)로 연락해주세요.</li>
                                <li>배송 전일 오후에 담당 시공팀이 방문시간을 안내 드립니다.</li>
                                <li>단, 제주 지역의 경우, 알림톡으로 안내되는 날짜는 실제 고객 배송일이 아닌 제품의 제주도 도착일입니다.
                                    실제 시공일은 영업일 기준 2~3일 추가 소요됩니다. 정확한 배송일은 별도 안내드릴 예정입니다.</li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>03. 택배배송 상품 배송안내</h3>
                            <ul>
                                <li>택배 상품은 일반택배로 배송되며 주문 당일 배송예정일 알림톡이 발송됩니다.</li>
                                <li>택배 송장번호는 배송예정일 전일 배송/조회, 알림톡, AI챗봇 주문조회를 통해 확인할 수 있습니다.</li>
                                <li>수령지역 및 택배사 사정에 따라 실제 배송일은 달라질 수 있습니다.</li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>04. 배송일 변경</h3>
                            <ul>
                                <li>배송예정일로부터 영업일 기준 3일전에 변경 요청바랍니다.</li>
                                <li>희망 배송일 신청은 AI챗봇으로만 가능합니다.</li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>05. 지역별 배송 요일</h3>
                            <ul>
                                <li>경기도 일부, 충청, 강원, 경상, 전라도, 연륙교가 있는 섬 지역은 배송하는 요일이 지정되어 있습니다.</li>
                                <li>주문 후 각 지역별로 배송일이 정해지면 카톡 알림이나 문자로 안내해드리고 있습니다.</li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>06. 해외배송 불가 안내</h3>
                            <ul>
                                <li>일룸은 해외 배송 및 시공 서비스는 제공하고 있지 않습니다.</li>
                                <li>별도 임의로 진행된 해외 배송 및 직접조립으로 인해 발생한 제품 하자는 A/S 및 반품이 불가합니다.
                                    (시공조립설명서, 박스규격 및 중량 등의 정보 제공 불가능)</li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>주문취소 및 반품 기준</h3>
                            <table className="return-table">
                                <tbody>
                                    <tr>
                                        <td>주문 후 ~ 배송 전일</td>
                                        <td>무상 주문 취소 가능</td>
                                    </tr>
                                    <tr>
                                        <td>배송 당일 ~ 배송 후 7일 이내</td>
                                        <td>구매 품목별 반품비 부과</td>
                                    </tr>
                                    <tr>
                                        <td>7일 이후</td>
                                        <td>반품 불가</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="delivery-section return-grid">
                            <div className="return-possible">
                                <h4>✔️반품 가능한 경우</h4>
                                <ul>
                                    <li>배송된 상품이 주문 내용과 상이한 경우</li>
                                    <li>재화 등의 내용이 표시/광고와 다른 경우</li>
                                    <li>상품에 오염이나 손상이 있는 경우</li>
                                    <li>상품 자체의 이상 및 결함이 있는 경우</li>
                                </ul>
                            </div>
                        </div>

                        <div className="delivery-section">
                            <h3>환불 안내</h3>
                            <ul>
                                <li>취소일 또는 반환 받은 날로부터 영업일 3일 이내 환불 처리됩니다.</li>
                                <li>신용카드 결제의 경우 익월 카드사에서 환급 처리됩니다.</li>
                                <li>무통장입금의 경우 주문 취소 또는 제품 회수 후 입금 계좌 확인 시 3일 이내 환불됩니다. (토·일·공휴일 제외)</li>
                            </ul>
                        </div>

                        <div className="delivery-section">
                            <h3>유·무상 수리 기준</h3>
                            <ul>
                                <li>교환 및 A/S는 부품단위 조치를 원칙으로 합니다.</li>
                                <li>고장이 아닌 경우 출장 서비스 요금이 부과될 수 있습니다.</li>
                                <li>간단한 문제는 일룸 서비스센터(cs.illom.com)의 간편 해결 및 온라인 상담을 먼저 이용해주세요.</li>
                            </ul>
                        </div>

                        <div className="delivery-section customer-center">
                            <h3>고객센터</h3>
                            <p>일룸 고객센터: <strong>1588-6792</strong></p>
                            <p>운영시간: 평일 09:00 ~ 18:00 (주말/공휴일 휴무)</p>
                        </div>
                    </div>
                )}
            </div>

            {showCartModal && (
                <div className="cart-modal-overlay" onClick={() => setShowCartModal(false)}>
                    <div className="cart-modal" onClick={e => e.stopPropagation()}>
                        <p className="cart-modal-title">장바구니에 담겼습니다.</p>
                        <p className="cart-modal-sub">장바구니로 이동하시겠습니까?</p>
                        <div className="cart-modal-btns">
                            <button className="cart-modal-continue" onClick={() => setShowCartModal(false)}>쇼핑 계속하기</button>
                            <button className="cart-modal-go" onClick={() => {
                                setShowCartModal(false)
                                navigate('/cart')
                            }}>장바구니 이동</button>
                        </div>
                    </div>
                </div>
            )}
        </ section >
    )
}
