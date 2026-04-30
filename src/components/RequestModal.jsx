export default function RequestModal({ requestDraft, setRequestDraft, onClose, onConfirm }) {
    return (
        <div className="card-modal-overlay" onClick={onClose}>
            <div className="card-modal" onClick={(e) => e.stopPropagation()}>
                <div className="card-modal-header">
                    <h3>배송 요청사항 수정</h3>
                    <p className="card-modal-desc">배송 시 요청사항을 입력해주세요</p>
                    <button type="button" className="card-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="card-modal-body">
                    <div className="card-field">
                        <label>배송 메시지</label>
                        <input
                            type="text"
                            value={requestDraft.message}
                            onChange={(e) =>
                                setRequestDraft((prev) => ({ ...prev, message: e.target.value }))
                            }
                            placeholder="배송 요청사항을 입력해주세요"
                        />
                    </div>

                    <div className="card-field">
                        <label>공동현관 출입 방법</label>
                        <input
                            type="text"
                            value={requestDraft.entrance}
                            onChange={(e) =>
                                setRequestDraft((prev) => ({ ...prev, entrance: e.target.value }))
                            }
                            placeholder="공동현관 비밀번호 또는 출입 방법"
                        />
                    </div>

                    <div className="card-field">
                        <label>엘리베이터 유무</label>
                        <select
                            value={requestDraft.elevator}
                            onChange={(e) =>
                                setRequestDraft((prev) => ({ ...prev, elevator: e.target.value }))
                            }
                        >
                            <option value="있음">있음</option>
                            <option value="없음">없음</option>
                        </select>
                    </div>
                </div>

                <div className="card-modal-footer">
                    <button type="button" className="card-cancel-btn" onClick={onClose}>
                        취소
                    </button>
                    <button type="button" className="card-submit-btn" onClick={onConfirm}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    )
}
