export default function CouponSection({
    couponData,
    selectedCoupon,
    setSelectedCoupon,
    couponOpen,
    setCouponOpen,
    totalPrice,
    couponDiscount,
    handleCouponSelect,
    formatPrice,
}) {
    return (
        <div className="discount-row">
            <span className="discount-label">할인쿠폰</span>

            <div className="discount-content">
                <div className="coupon-select-area">
                    <button
                        type="button"
                        className="coupon-select-btn"
                        onClick={() => setCouponOpen((v) => !v)}
                    >
                        {selectedCoupon ? (
                            <span className="coupon-selected-name">{selectedCoupon.name}</span>
                        ) : (
                            <span className="coupon-placeholder">쿠폰을 선택해주세요</span>
                        )}

                        <span className="coupon-count-badge">{couponData.length}장</span>

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
                                transform: couponOpen ? 'rotate(180deg)' : 'none',
                                transition: '0.2s',
                            }}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {selectedCoupon && (
                        <span className="coupon-discount-amount">
                            − {formatPrice(couponDiscount)}
                        </span>
                    )}
                </div>

                {couponOpen && (
                    <ul className="coupon-dropdown">
                        <li
                            className={`coupon-dropdown-item ${!selectedCoupon ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCoupon(null)
                                setCouponOpen(false)
                            }}
                        >
                            <div className="coupon-item-info">
                                <p className="coupon-item-name">쿠폰 사용 안함</p>
                            </div>
                        </li>

                        {couponData.map((coupon) => {
                            const isApplicable = totalPrice >= Number(coupon.minPrice || 0)

                            const previewDiscount = (() => {
                                if (!isApplicable) return 0
                                if (coupon.type === 'fixed') return Number(coupon.discount || 0)
                                if (coupon.type === 'percent') {
                                    const calc = Math.floor(
                                        (totalPrice * Number(coupon.discount || 0)) / 100
                                    )
                                    const maxDiscount = Number(coupon.maxDiscount || 0)
                                    return maxDiscount > 0 ? Math.min(calc, maxDiscount) : calc
                                }
                                return 0
                            })()

                            const maxDiscountText = coupon.maxDiscount
                                ? `최대 ${Number(coupon.maxDiscount).toLocaleString()}원`
                                : null

                            return (
                                <li
                                    key={coupon.id}
                                    className={`coupon-dropdown-item ${selectedCoupon?.id === coupon.id ? 'active' : ''} ${!isApplicable ? 'disabled' : ''}`}
                                    onClick={() => handleCouponSelect(coupon)}
                                >
                                    <div className="coupon-item-left">
                                        <span className="coupon-item-discount">
                                            {coupon.type === 'fixed'
                                                ? `${Number(coupon.discount || 0).toLocaleString()}원`
                                                : `${coupon.discount}%`}
                                        </span>

                                        <div className="coupon-item-info">
                                            <p className="coupon-item-name">{coupon.name}</p>
                                            <p className="coupon-item-desc">
                                                {coupon.desc} ·{' '}
                                                {Number(coupon.minPrice || 0).toLocaleString()}원 이상 구매 시
                                            </p>

                                            {coupon.type === 'percent' && (
                                                <p className="coupon-item-preview">
                                                    {isApplicable
                                                        ? maxDiscountText
                                                            ? `현재 ${previewDiscount.toLocaleString()}원 할인 · ${maxDiscountText}`
                                                            : `현재 ${previewDiscount.toLocaleString()}원 할인`
                                                        : maxDiscountText || `${coupon.discount}% 즉시 할인`}
                                                </p>
                                            )}

                                            <p className="coupon-item-expiry">~ {coupon.expiry}</p>
                                        </div>
                                    </div>

                                    {!isApplicable && (
                                        <span className="coupon-item-unavail">조건 미충족</span>
                                    )}

                                    {selectedCoupon?.id === coupon.id && (
                                        <span className="coupon-item-check">✓</span>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}
