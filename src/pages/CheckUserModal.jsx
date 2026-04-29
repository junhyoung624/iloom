import React from 'react'
import './scss/checkUserModal.scss'

const CheckUserModal = ({ moveToLogin, moveToGuestCharge, onClose }) => {
    return (
        <div className="check-user-modal-bg" onClick={onClose}>
            <div className="check-user-modal" onClick={(e) => e.stopPropagation()}>

                <div className="modal-text">
                    <h3>로그인이 필요합니다</h3>
                    <p>
                        현재 비로그인 상태입니다.
                        <br />
                        로그인 후 구매하시겠습니까?
                    </p>
                </div>

                <div className="button-area">
                    <button
                        type="button"
                        className="guest-btn"
                        onClick={moveToGuestCharge}
                    >
                        비회원 구매
                    </button>

                    <button
                        type="button"
                        className="login-btn"
                        onClick={moveToLogin}
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CheckUserModal