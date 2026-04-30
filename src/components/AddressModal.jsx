import { useEffect } from "react"

export default function AddressModal({ addressDraft, setAddressDraft, onClose, onConfirm }) {

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
                    <h3>배송지 변경</h3>
                    <p className="card-modal-desc">받으실 분의 배송 정보를 입력해주세요</p>
                    <button type="button" className="card-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="card-modal-body">
                    <div className="card-field">
                        <label>받으시는 분</label>
                        <input
                            type="text"
                            value={addressDraft.name}
                            onChange={(e) =>
                                setAddressDraft((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="이름을 입력해주세요"
                        />
                    </div>

                    <div className="card-field">
                        <label>배송지 주소</label>
                        <input
                            type="text"
                            value={addressDraft.address}
                            onChange={(e) =>
                                setAddressDraft((prev) => ({ ...prev, address: e.target.value }))
                            }
                            placeholder="경기 성남시 분당구 정자일로 95"
                        />
                    </div>

                    <div className="card-field">
                        <label>연락처</label>
                        <input
                            type="text"
                            value={addressDraft.phone}
                            onChange={(e) =>
                                setAddressDraft((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            placeholder="010-0000-0000"
                        />
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
