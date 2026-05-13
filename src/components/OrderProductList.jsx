import { colorData } from "../data/colorData"

const COLOR_HEX_MAP = {
    'Golden Yellow': '#E8A020',
    'Pure White': '#F0EEE9',
    'Graphite Black': '#2A2A2A',
    'Warm Grey': '#9E9E96',
    'Deep Red': '#C0222A',
    'Forest Green': '#3A6B4A',
    'Sky Blue': '#5A8FBF',
    'Terracotta': '#C4603A',
    'Dusty Pink': '#D4908A',
    'Olive': '#7A7A3A',
}

export default function OrderProductList({
    orderItems,
    totalPrice,
    formatPrice
}) {

    const getColorInfo = (productId, colorCode) => {
        const found = colorData.find(
            c => c.productCd === String(productId)
        )

        if (!found) return null

        const idx = found.colorCd.indexOf(colorCode)

        if (idx === -1) return null

        return '/images/' + found.localImgPath[idx]
    }

    return (
        <div className="charge-section">

            <h3 className="section-title">
                주문 상품
            </h3>

            <div className="order-head">
                <span className="col-info">상품정보</span>
                <span className="col-price">단가</span>
                <span className="col-qty">수량</span>
                <span className="col-total">총금액</span>
                <span className="col-status">배송형태</span>
            </div>

            <div className="order-list">

                {orderItems.length === 0 ? (

                    <div className="empty-order">
                        결제할 상품이 없습니다.
                    </div>

                ) : (

                    orderItems.map((item) => {

                        const imgSrc =
                            item.productImages?.[0] ||
                            item.image ||
                            ''

                        return (
                            <div
                                className="order-item"
                                key={`${item.id}-${item.color || 'default'}`}
                            >

                                {/* 상품 정보 */}
                                <div className="col-info product-info">

                                    <div className="thumb">
                                        {imgSrc ? (

                                            <img
                                                src={imgSrc}
                                                alt={item.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: 'block',
                                                }}
                                            />

                                        ) : (

                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    background: '#f3f3f3',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 11,
                                                    color: '#bbb',
                                                    letterSpacing: '0.06em',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                No Image
                                            </div>

                                        )}
                                    </div>

                                    <div className="text-box">

                                        <h4>
                                            {item.series || '일룸'}
                                        </h4>

                                        <p>
                                            {item.name}
                                        </p>

                                        {item.color && (() => {
                                            // 커스텀 상품: hex 도트
                                            if (item._custom) {
                                                const hex = COLOR_HEX_MAP[item.color]
                                                return (
                                                    <div className="option-line">
                                                        <span>[필수] 색상: {item.color}</span>
                                                        {hex && (
                                                            <span style={{
                                                                display: 'inline-block',
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%',
                                                                background: hex,
                                                                border: '1px solid rgba(0,0,0,0.12)',
                                                                flexShrink: 0,
                                                            }} />
                                                        )}
                                                    </div>
                                                )
                                            }
                                            // 일반 상품: colorData 이미지
                                            const imgPath = getColorInfo(item.id, item.color)
                                            return (
                                                <div className="option-line">
                                                    <span>[필수] 색상: {item.color}</span>
                                                    {imgPath && (
                                                        <img
                                                            src={imgPath}
                                                            alt={item.color}
                                                            className="color-dot"
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })()}

                                    </div>
                                </div>

                                {/* 가격 */}
                                <div className="col-price">
                                    {formatPrice(item.priceNumber)}
                                </div>

                                {/* 수량 */}
                                <div className="col-qty">
                                    {item.qty}
                                </div>

                                {/* 총금액 */}
                                <div className="col-total">
                                    {formatPrice(item.totalPrice)}
                                </div>

                                {/* 배송 */}
                                <div className="col-status">
                                    {item.deliveryType || '택배'}
                                </div>

                            </div>
                        )
                    })

                )}

            </div>

            <p className="delivery-notice">
                * 택배 / 시공 상품이 별도 배송될 수 있습니다.
            </p>

            <div className="order-total-box">
                <span>상품 결제 예정 금액</span>
                <strong>{formatPrice(totalPrice)}</strong>
            </div>

        </div>
    )
}