import React from 'react';
import "./scss/chargeModal.scss";
export default function ChargeModal({ onClose, onConfirm }) {
    return (
        <div className='modal-bg'>
            <div className="modal">
                <p>결제를 확정해주세요</p>
                <div className='button-area'>
                    <button onClick={onClose}>취소</button>
                    <button type='button' onClick={onConfirm}>결제하기</button>
                </div>
            </div>

        </div>
    );
}
