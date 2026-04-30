import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function InquiryDeleteModal({ onClose, onConfirm }) {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    return createPortal(
        <>
            <div className="delete-modal-overlay" onClick={onClose} />
            <div className="delete-modal">
                <div className="delete-modal__content">
                    <p className="delete-modal__heading">문의를 삭제할까요?</p>
                    <p className="delete-modal__desc">삭제된 문의는 복구할 수 없어요.</p>
                </div>
                <div className="delete-modal__footer">
                    <button className="delete-modal__cancel" onClick={onClose}>취소</button>
                    <button className="delete-modal__confirm" onClick={onConfirm}>삭제</button>
                </div>
            </div>
        </>,
        document.body
    )
}