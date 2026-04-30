import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function PointChargeModal({ iloomPoint, onClose }) {
    const [pointChargeAmount, setPointChargeAmount] = useState(0)

    const handleCharge = () => {
        if (!pointChargeAmount || pointChargeAmount < 1000) {
            toast('최소 1,000원 이상 충전 가능합니다')
            return
        }
        toast(`${pointChargeAmount.toLocaleString()}P 충전이 완료되었습니다!`)
        onClose()
    }

    
    
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <div className="card-modal-overlay" onClick={onClose}>
            <div className="card-modal" onClick={(e) => e.stopPropagation()}>
                <div className="card-modal-header">
                    <h3>일룸포인트 충전</h3>
                    <p className="card-modal-desc">포인트를 충전하여 즉시 사용하세요</p>
                    <button type="button" className="card-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="card-modal-body">
                    <div className="point-modal-balance">
                        <span>현재 보유 포인트</span>
                        <strong style={{ color: '#CA1230' }}>
                            {(iloomPoint || 0).toLocaleString()}P
                        </strong>
                    </div>

                    <div className="card-field">
                        <label>충전 금액 선택</label>
                        <div className="point-charge-grid">
                            {[5000, 10000, 30000, 50000, 100000].map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={`point-charge-amount-btn ${pointChargeAmount === amount ? 'active' : ''}`}
                                    onClick={() => setPointChargeAmount(amount)}
                                >
                                    {amount.toLocaleString()}원
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card-field">
                        <label>직접 입력</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                placeholder="충전할 금액 입력"
                                value={pointChargeAmount ? pointChargeAmount.toLocaleString() : ''}
                                onChange={(e) => {
                                    const val = Number(e.target.value.replace(/,/g, ''))
                                    if (!Number.isNaN(val)) setPointChargeAmount(val)
                                }}
                                style={{ flex: 1 }}
                            />
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: 14,
                                    color: '#555',
                                }}
                            >
                                원
                            </span>
                        </div>
                    </div>

                    <div className="card-field">
                        <label>충전 결제수단</label>
                        <select
                            style={{
                                height: 42,
                                padding: '0 12px',
                                border: '1px solid #ddd',
                                fontSize: 14,
                                outline: 'none',
                            }}
                        >
                            <option>신용카드</option>
                            <option>계좌이체</option>
                            <option>네이버페이</option>
                            <option>카카오페이</option>
                            <option>토스페이</option>
                        </select>
                    </div>

                    <div className="point-modal-notice">
                        <p>· 충전된 포인트는 즉시 사용 가능합니다</p>
                        <p>· 포인트 유효기간은 충전일로부터 5년입니다</p>
                        <p>· 미사용 포인트는 환불 신청 가능합니다</p>
                    </div>
                </div>

                <div className="card-modal-footer">
                    <button type="button" className="card-cancel-btn" onClick={onClose}>
                        취소
                    </button>
                    <button type="button" className="card-submit-btn" onClick={handleCharge}>
                        {pointChargeAmount
                            ? `${pointChargeAmount.toLocaleString()}원 충전하기`
                            : '충전하기'}
                    </button>
                </div>
            </div>
        </div>
    )
}
