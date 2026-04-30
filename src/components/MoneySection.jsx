export default function MoneySection({
    iloomMoney,
    moneyInput,
    setMoneyInput,
    useMoney,
    onMoneyApply,
    onMoneyAll,
    formatPrice,
}) {
    return (
        <div className="discount-row">
            <span className="discount-label">일룸머니</span>

            <div className="discount-content">
                <div className="money-row">
                    <div className="money-input-wrap">
                        <input
                            type="text"
                            className="money-input"
                            value={moneyInput}
                            onChange={(e) =>
                                setMoneyInput(e.target.value.replace(/[^0-9]/g, ''))
                            }
                            placeholder="0"
                        />
                        <span className="money-unit">원</span>

                        <button type="button" className="money-apply-btn" onClick={onMoneyApply}>
                            적용
                        </button>

                        <button type="button" className="money-all-btn" onClick={onMoneyAll}>
                            전액사용
                        </button>
                    </div>

                    {useMoney > 0 && (
                        <span className="coupon-discount-amount">− {formatPrice(useMoney)}</span>
                    )}
                </div>

                <div className="money-info-row">
                    <span>보유 일룸머니</span>
                    <strong>{iloomMoney.toLocaleString()}원</strong>
                </div>
            </div>
        </div>
    )
}
