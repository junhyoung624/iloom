import { colorData } from "../data/colorData"
export default function OrderProductList({ orderItems, totalPrice, formatPrice }) {
    const getColorInfo = (productId, colorCode) => {
        const found = colorData.find(c => c.productCd === String(productId))
        console.log('found:', found, 'productId:', productId)
        if (!found) return null
        const idx = found.colorCd.indexOf(colorCode)
        console.log('idx:', idx, 'colorCode:', colorCode)
        if (idx === -1) return null
         return '/images/' + found.localImgPath[idx]
    }
    return (
        <div className="charge-section">
            <h3 className="section-title">주문 상품</h3>

            <div className="order-head">
                <span className="col-info">상품정보</span>
                <span className="col-price">단가</span>
                <span className="col-qty">수량</span>
                <span className="col-total">총금액</span>
                <span className="col-status">배송형태</span>
            </div>

            <div className="order-list">
                {orderItems.length === 0 ? (
                    <div className="empty-order">결제할 상품이 없습니다.</div>
                ) : (
                    orderItems.map((item) => (
                        <div
                            className="order-item"
                            key={`${item.id}-${item.color || 'default'}`}
                        >
                            <div className="col-info product-info">
                                <div className="thumb">
                                    <img
                                        src={item.productImages?.[0] || item.image}
                                        alt={item.name}
                                    />
                                </div>

                                <div className="text-box">
                                    <h4>{item.series || '일룸'}</h4>
                                    <p>{item.name}</p>

                                    {item.color && (() => {
                                        const imgPath = getColorInfo(item.id, item.color)
                                        return (
                                            <div className="option-line">
                                                <span>[필수] 색상: {item.color}</span>
                                                {imgPath && (
                                                    <img
                                                        src={imgPath}
                                                        alt={item.color}
                                                        className="color-dot"
                                                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </div>
                                        )
                                    })()}

                                </div>
                            </div>

                            <div className="col-price">{formatPrice(item.priceNumber)}</div>
                            <div className="col-qty">{item.qty}</div>
                            <div className="col-total">{formatPrice(item.totalPrice)}</div>
                            <div className="col-status">{item.deliveryType || '택배'}</div>
                        </div>
                    ))
                )}
            </div>

            <p className="delivery-notice">* 택배 / 시공 상품이 별도 배송될 수 있습니다.</p>

            <div className="order-total-box">
                <span>상품 결제 예정 금액</span>
                <strong>{formatPrice(totalPrice)}</strong>
            </div>
        </div>
    )
}
