import React, { useRef } from 'react'
import "./scss/ordercompletepopup.scss"

export default function OrderCompletePopup({ orderData, onClose }) {

    const formatDate = (date = new Date()) => {
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    }

    return (
        <div className="ocp-overlay" onClick={onClose}>
            <div className="ocp-modal" onClick={(e) => e.stopPropagation()}>
                <button className="ocp-close" onClick={onClose}>✕</button>

                <div className="ocp-tag-wrap">


                    <div className="ocp-rope" />

                    <div className="ocp-tag-swing">
                        <div className="ocp-tag">
                            <img
                                src="/images/logo-icon/tag.png"
                                alt="tag"
                                className="ocp-tag-img"
                            />
                        </div>
                    </div>

                </div>

                <div className="ocp-body">
                    <h3>주문이 완료되었습니다</h3>
                    <p>Thank you for purchasing our product</p>

                    <div className="ocp-info-box">
                        <div className="ocp-info-row">
                            <span>주문번호</span>
                            <span>{orderData.orderNumber}</span>
                        </div>
                        <div className="ocp-info-row">
                            <span>결제일자</span>
                            <span>{formatDate()}</span>
                        </div>
                        <div className="ocp-info-row">
                            <span>주문상품</span>
                            <span>
                                {orderData.items?.[0]?.name}
                                {orderData.items?.length > 1 ? ` 외 ${orderData.items.length - 1}건` : ''}
                            </span>
                        </div>
                        <div className="ocp-info-row total">
                            <span>총 결제 금액</span>
                            <strong>{Number(orderData.total).toLocaleString('ko-KR')}원</strong>
                        </div>
                        <div className="ocp-info-row point">
                            <span>적립금</span>
                            <span>{Math.floor(orderData.total * 0.01 * 0.99).toLocaleString('ko-KR')}원</span>
                        </div>
                    </div>

                    <button className="ocp-confirm-btn" onClick={onClose}>
                        주문/배송 가기
                    </button>
                </div>
            </div>
        </div>
    )
}