import { useState, useEffect } from 'react'
import './scss/inquiryeditmodal.scss'

export default function InquiryEditModal({ item, onSave, onClose }) {
    const [text, setText] = useState(item.text)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const handleSave = () => {
        if (!text.trim()) return
        onSave(item.id, text.trim())
        onClose()
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div className="edit-modal-backdrop" onClick={handleBackdropClick}>
            <div className="edit-modal">
                <div className="edit-modal__header">
                    <p className="edit-modal__title">문의 수정</p>
                    <button className="edit-modal__close" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="edit-modal__body">
                    <span className="edit-modal__category">{item.category}</span>
                    <textarea
                        className="edit-modal__textarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={5}
                        autoFocus
                    />
                </div>

                <div className="edit-modal__footer">
                    <button className="edit-modal__btn cancel" onClick={onClose}>취소</button>
                    <button
                        className="edit-modal__btn save"
                        onClick={handleSave}
                        disabled={!text.trim() || text.trim() === item.text}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    )
}