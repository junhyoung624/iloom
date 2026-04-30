import { useEffect } from "react"

export default function CardRegisterModal({
    cardForm,
    cardErrors,
    onCardChange,
    onCardNumberChange,
    onClose,
    onSubmit,
}) {

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
                    <h3>결제 수단</h3>
                    <p className="card-modal-desc">모든 거래는 안전하게 암호화됩니다</p>
                    <button type="button" className="card-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="card-modal-body">
                    <div className="card-field">
                        <label>카드 소유자 이름</label>
                        <input
                            type="text"
                            name="name"
                            value={cardForm.name}
                            onChange={onCardChange}
                            placeholder="홍길동"
                        />
                        {cardErrors.name && <p className="card-error">{cardErrors.name}</p>}
                    </div>

                    <div className="card-field">
                        <label>카드 번호</label>
                        <input
                            type="text"
                            name="number"
                            value={cardForm.number}
                            onChange={onCardNumberChange}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                        />
                        {cardErrors.number && <p className="card-error">{cardErrors.number}</p>}
                    </div>

                    <div className="card-field-row">
                        <div className="card-field">
                            <label>유효기간</label>
                            <div className="card-expiry">
                                <select name="month" value={cardForm.month} onChange={onCardChange}>
                                    <option value="">MM</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                            {String(i + 1).padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>

                                <select name="year" value={cardForm.year} onChange={onCardChange}>
                                    <option value="">YYYY</option>
                                    {Array.from({ length: 10 }, (_, i) => (
                                        <option key={i} value={2025 + i}>
                                            {2025 + i}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {(cardErrors.month || cardErrors.year) && (
                                <p className="card-error">유효기간을 선택해주세요.</p>
                            )}
                        </div>

                        <div className="card-field">
                            <label>CVV</label>
                            <input
                                type="password"
                                name="cvv"
                                value={cardForm.cvv}
                                onChange={onCardChange}
                                placeholder="···"
                                maxLength={4}
                            />
                            {cardErrors.cvv && <p className="card-error">{cardErrors.cvv}</p>}
                        </div>
                    </div>

                    <div className="card-field-separator">청구지 주소</div>
                    <p className="card-field-desc">결제 수단과 연결된 청구지 주소입니다</p>

                    <div className="card-field card-field-check">
                        <input
                            type="checkbox"
                            id="sameAsShipping"
                            name="sameAsShipping"
                            checked={cardForm.sameAsShipping}
                            onChange={onCardChange}
                        />
                        <label htmlFor="sameAsShipping">배송지 주소와 동일</label>
                    </div>
                </div>

                <div className="card-modal-footer">
                    <button type="button" className="card-cancel-btn" onClick={onClose}>
                        취소
                    </button>
                    <button type="button" className="card-submit-btn" onClick={onSubmit}>
                        등록
                    </button>
                </div>
            </div>
        </div>
    )
}
