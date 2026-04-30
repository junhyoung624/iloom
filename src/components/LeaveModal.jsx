import { useEffect } from "react"

const LeaveModal = ({ onClose, onConfirm }) => {
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

                {/* 내용 */}
                <div className="leave-modal__content">
                    <p className="leave-modal__title">
                        정말 탈퇴하시겠습니까?
                    </p>
                    <p className="leave-modal__desc">
                        탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.
                    </p>
                </div>

                {/* 버튼 */}
                <div className="leave-modal__footer">
                    <button className="leave-modal__cancel" onClick={onClose}>
                        취소
                    </button>
                    <button className="leave-modal__confirm" onClick={onConfirm}>
                        탈퇴하기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LeaveModal