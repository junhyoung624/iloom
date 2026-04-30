import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

const detectCardIssuer = (number = '') => {
    const n = number.replace(/\s/g, '')
    if (/^4/.test(n)) return 'visa'
    if (/^5[1-5]/.test(n)) return 'mastercard'
    if (/^3[47]/.test(n)) return 'amex'
    if (/^9/.test(n)) return 'local'
    return 'default'
}

const CARD_STYLES = {
    visa: { label: 'VISA', bg: ['#1a1f71', '#3b57ff'], textColor: '#fff' },
    mastercard: { label: 'Mastercard', bg: ['#eb001b', '#f79e1b'], textColor: '#fff' },
    amex: { label: 'AMEX', bg: ['#2e77bc', '#67b7dc'], textColor: '#fff' },
    local: { label: '국내카드', bg: ['#111', '#555'], textColor: '#fff' },
    default: { label: 'CARD', bg: ['#333', '#999'], textColor: '#fff' },
}

const SIMPLE_PAY_LIST = [
    {
        key: 'naverpay',
        name: '네이버페이',
        sub: '포인트 최대 2% 적립',
        logoSrc: './images/logo-icon/npay.png',
        accent: '#03c75a',
        textDark: true,
    },
    {
        key: 'kakaopay',
        name: '카카오페이',
        sub: '카카오머니 즉시결제',
        logoSrc: './images/logo-icon/kakaopay.png',
        accent: '#fee500',
        textDark: true,
    },
    {
        key: 'tosspay',
        name: '토스페이',
        sub: '간편하게 1초 결제',
        logoSrc: './images/logo-icon/tosspay.png',
        accent: '#0064ff',
        textDark: false,
    },
]

export default function PaymentMethodSection({
    paymentMethod,
    setPaymentMethod,
    iloomPoint,
    showMorePayment,
    setShowMorePayment,
    registeredCards,
    selectedCardIndex,
    setSelectedCardIndex,
    onOpenCardForm,
    onOpenPointModal,
    finalPrice,
    formatPrice,
    orderItems,
    onPayment,
}) {
    return (
        <div className="charge-section">
            <h3 className="section-title">
                결제 수단
                <span className="section-title-price">{formatPrice(finalPrice)}</span>
            </h3>

            <div className="payment-wrap">
                {/* 일룸포인트 */}
                <div
                    className={`payment-option-box ${paymentMethod === 'iloom' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('iloom')}
                >
                    <div className="payment-option-row">
                        <div className="payment-radio">
                            <div className={`radio-dot ${paymentMethod === 'iloom' ? 'on' : ''}`} />
                        </div>

                        <div className="payment-option-info">
                            <span className="payment-option-label">일룸포인트 충전결제</span>
                            <span className="payment-option-sub point-green">
                                보유 {(iloomPoint || 0).toLocaleString()}P
                            </span>
                        </div>

                        <button
                            type="button"
                            className="point-charge-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                onOpenPointModal()
                            }}
                        >
                            충전하기
                        </button>
                    </div>
                </div>

                {/* 카드 간편결제 */}
                <div
                    className={`payment-option-box ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                >
                    <div className="payment-option-row">
                        <div className="payment-radio">
                            <div className={`radio-dot ${paymentMethod === 'card' ? 'on' : ''}`} />
                        </div>
                        <span className="payment-option-label">카드 간편결제</span>
                    </div>

                    {paymentMethod === 'card' && (
                        <div
                            className="card-slider-section"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {registeredCards.length > 0 ? (
                                <>
                                    <Swiper
                                        slidesPerView={1.7}
                                        spaceBetween={12}
                                        className="credit-card-swiper"
                                        onSlideChange={(swiper) =>
                                            setSelectedCardIndex(swiper.activeIndex)
                                        }
                                    >
                                        {registeredCards.map((card, idx) => {
                                            const issuer = detectCardIssuer(card.number)
                                            const style = CARD_STYLES[issuer]
                                            const isSelected = selectedCardIndex === idx

                                            return (
                                                <SwiperSlide key={`${card.number}-${idx}`}>
                                                    <div
                                                        className={`card-list-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => setSelectedCardIndex(idx)}
                                                    >
                                                        <div
                                                            className="card-list-thumb"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${style.bg[0]}, ${style.bg[1]})`,
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: style.textColor,
                                                                    fontSize: 10,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {style.label}
                                                            </span>
                                                            <div className="card-list-thumb-chip" />
                                                        </div>

                                                        <div className="card-list-info">
                                                            <p className="card-list-name">{style.label}</p>
                                                            <p className="card-list-number">
                                                                신용 · {card.number.replace(/\s/g, '').slice(-4)}
                                                            </p>
                                                            <select
                                                                className="card-installment-select"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <option>일시불</option>
                                                                <option>2개월</option>
                                                                <option>3개월</option>
                                                                <option>6개월</option>
                                                                <option>12개월</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            )
                                        })}

                                        <SwiperSlide>
                                            <button
                                                type="button"
                                                className="card-add-btn"
                                                onClick={onOpenCardForm}
                                            >
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                                <span>카드 추가</span>
                                            </button>
                                        </SwiperSlide>
                                    </Swiper>

                                    <div className="card-benefit-banner">
                                        <span>최대 5% 적립 + 일룸 제휴 혜택</span>
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className="card-register-btn"
                                    onClick={onOpenCardForm}
                                >
                                    + 카드 등록
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* 다른 결제수단 더보기 */}
                <button
                    type="button"
                    className="payment-more-btn"
                    onClick={() => setShowMorePayment((v) => !v)}
                >
                    다른 결제수단 보기
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            transform: showMorePayment ? 'rotate(180deg)' : 'none',
                            transition: '0.2s',
                        }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {showMorePayment && (
                    <div className="payment-more-wrap">
                        <div className="simplepay-grid">
                            {SIMPLE_PAY_LIST.map((pay) => {
                                const isActive = paymentMethod === pay.key
                                return (
                                    <button
                                        key={pay.key}
                                        type="button"
                                        className={`simplepay-card ${isActive ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod(pay.key)}
                                        style={{ '--accent': pay.accent }}
                                    >
                                        <div className={`simplepay-radio ${isActive ? 'on' : ''}`}>
                                            {isActive && (
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                    <path
                                                        d="M2 6l3 3 5-5"
                                                        stroke="#fff"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="simplepay-logo-wrap">
                                            <img
                                                src={pay.logoSrc}
                                                alt={pay.name}
                                                className="simplepay-logo"
                                            />
                                        </div>

                                        <div className="simplepay-text-wrap">
                                            <p className={`simplepay-name ${pay.textDark ? 'dark' : 'light'}`}>
                                                {pay.name}
                                            </p>
                                            <p className={`simplepay-sub ${pay.textDark ? 'dark' : 'light'}`}>
                                                {pay.sub}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="payment-notice">
                <p>
                    1. 고객의 단순한 변심으로 인한 교환, 반품 및 환불을 요구할 때
                    수반되는 배송비는 고객님께서 부담하셔야합니다.
                </p>
                <p>
                    2. 상품을 개봉했거나 설치한 후에는 상품의 재판매가 불가능하므로
                    고객님의 변심에 대한 교환, 반품이 불가능함을 양지해 주시기 바랍니다.
                </p>
            </div>

            <button
                type="button"
                className="payment-btn"
                disabled={orderItems.length === 0}
                onClick={onPayment}
            >
                {formatPrice(finalPrice)} 결제하기
            </button>
        </div>
    )
}
