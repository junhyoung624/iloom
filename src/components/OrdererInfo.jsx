export default function OrdererInfo({ user }) {
    return (
        <div className="charge-section">
            <h3 className="section-title">주문자 정보</h3>

            <div className="info-table">
                <div className="info-row">
                    <span className="label">보내는 분</span>
                    <span className="value">{user?.name || '-'}</span>
                </div>

                <div className="info-row">
                    <span className="label">휴대폰</span>
                    <span className="value">{user?.phone || '등록된 번호 없음'}</span>
                </div>

                <div className="info-row">
                    <span className="label">이메일</span>
                    <span className="value">{user?.email || '-'}</span>
                </div>
            </div>
        </div>
    )
}
