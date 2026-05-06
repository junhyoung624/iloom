import { useEffect } from "react"

const UnlinkWarningModal = ({ onClose, onConfirm }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <div className="leave-overlay">
            <div className="leave-modal">
                <div className="leave-modal__content">
                    <p className="leave-modal__title">
                        마지막 연동 계정입니다.
                    </p>
                    <p className="leave-modal__desc">
                        회원탈퇴 페이지로 이동할까요?
                    </p>
                </div>
                <div className="leave-modal__footer">
                    <button className="leave-modal__cancel" onClick={onClose}>
                        취소
                    </button>
                    <button className="leave-modal__confirm" onClick={onConfirm}>
                        이동하기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UnlinkWarningModal