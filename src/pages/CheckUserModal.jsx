import React from 'react';
import "./scss/checkUserModal.scss";
const CheckUserModal = ({ moveToLogin, moveToGuestCharge }) => {
    return (
        <div className='check-user-modal-bg'>
            <div className="modal">
                <p>현재 비로그인 상태입니다.</p>
                <p>로그인 후 구매하시겠습니까?</p>
                <div className='button-area'>
                    <button onClick={moveToLogin}>로그인</button>
                    <button type='button' onClick={moveToGuestCharge}>비회원구매</button>
                </div>
            </div>

        </div>
    );
}

export default CheckUserModal;
