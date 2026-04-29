import React from 'react'
import { useNavigate } from 'react-router-dom'
import NumberFlow from '@number-flow/react'

export default function CartModal({ onClose }) {
    const navigate = useNavigate()

    return (
        <div className="cart-modal-overlay" onClick={onClose}>
            <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cart-modal-text">
                    <span className="cart-modal-label">CART</span>
                    <p className="cart-modal-title">장바구니에 담았습니다.</p>
                    <p className="cart-modal-sub">장바구니 페이지로 이동합니다.</p>
                </div>
                <div className="cart-modal-btns">
                    <button type="button" className="cart-modal-continue" onClick={onClose}>
                        쇼핑 계속하기
                    </button>
                    <button type="button" className="cart-modal-go"
                        onClick={() => { onClose(); navigate('/cart') }}>
                        이동하기
                    </button>
                </div>
            </div>
        </div>
    )
}