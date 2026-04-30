export default function DeliveryInfo({
    user,
    addressForm,
    requestForm,
    onOpenAddress,
    onOpenRequest,
}) {
    return (
        <div className="charge-section">
            <h3 className="section-title">배송 정보</h3>

            <div className="info-table">
                <div className="info-row">
                    <span className="label">배송지</span>

                    <div className="value address-box">
                        <div className="address-top">
                            <strong>{addressForm.name}</strong>
                            <span className="badge">기본 배송지</span>
                        </div>

                        <p>{addressForm.address}</p>

                        <button type="button" className="mini-btn" onClick={onOpenAddress}>
                            변경
                        </button>
                    </div>
                </div>

                <div className="info-row">
                    <span className="label">배송 요청사항</span>

                    <div className="value request-box">
                        <div className="request-inline">
                            <p>{requestForm.message}</p>
                            <span className="divider"></span>
                            <p>{requestForm.entrance}</p>
                        </div>

                        <p>엘리베이터 유무: {requestForm.elevator}</p>
                        <p>
                            {user?.name || '-'}, {user?.phone || '등록된 번호 없음'}
                        </p>

                        <button type="button" className="mini-btn" onClick={onOpenRequest}>
                            수정
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
