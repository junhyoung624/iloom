import NumberFlow from '@number-flow/react'

export default function PaymentSummaryBar({ finalPrice, orderItems, onPayment }) {
    return (
        <div className="charge-fixed-paybar">
            <div className="fixed-pay-info">
                <span>최종 결제금액</span>
                <strong>
                    <NumberFlow value={finalPrice} suffix="원" />
                </strong>
            </div>

            <button
                type="button"
                disabled={orderItems.length === 0}
                onClick={onPayment}
            >
                결제하기
            </button>
        </div>
    )
}
