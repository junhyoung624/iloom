import React, { useEffect } from 'react'
import './scss/chargeModal.scss'

export default function ChargeModal({ onClose, onConfirm }) {
    
    
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])
    return (
        <div className="charge-modal-overlay" onClick={onClose}>
            <div className="charge-confirm-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="charge-modal-close"
                    onClick={onClose}
                    aria-label="닫기"
                >
                    ✕
                </button>


                <div className="charge-modal-text">
                    <h3>결제를 진행할까요?</h3>
                    <p>
                        주문 정보를 확인하신 후<br />
                        결제하기 버튼을 눌러주세요.
                    </p>
                </div>

                <div className="charge-modal-actions">
                    <button
                        type="button"
                        className="charge-modal-cancel"
                        onClick={onClose}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        className="charge-modal-submit"
                        onClick={onConfirm}
                    >
                        결제하기
                    </button>
                </div>
            </div>
        </div>
    )
}