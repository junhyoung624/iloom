import React, { useState } from 'react'
import { colorData } from '../data/colorData'

export default function CartOptionModal({ item, onClose, onConfirm }) {
    const productColors = colorData.find(c =>
        c.productCd === item.productCd || c.productCd === item.id
    )

    const colors = productColors
        ? Array.isArray(productColors.colorCd)
            ? productColors.colorCd
            : [productColors.colorCd]
        : []

    const paths = productColors
        ? Array.isArray(productColors.localImgPath)
            ? productColors.localImgPath
            : [productColors.localImgPath]
        : []

    const [selectedColor, setSelectedColor] = useState(item.color || colors[0] || '')

    const handleConfirm = () => {
        onConfirm(item.id, item.color, selectedColor)
    }

    return (
        <div className="cart-option-overlay" onClick={onClose}>
            <div className="cart-option-modal" onClick={e => e.stopPropagation()}>
                <div className="cart-option-modal__header">
                    <h3>옵션변경</h3>
                    <button className="cart-option-modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="cart-option-modal__product">
                    <p className="cart-option-modal__label">선택한 상품</p>
                    <div className="cart-option-modal__product-info">
                        <img src={item.productImages?.[0]} alt={item.name} />
                        <div>
                            <p className="cart-option-modal__product-name">{item.name}</p>
                            <strong className="cart-option-modal__product-price">{item.price}원</strong>
                        </div>
                    </div>
                </div>

                <div className="cart-option-modal__divider" />

                <div className="cart-option-modal__options">
                    <p className="cart-option-modal__label">상품옵션선택</p>
                    <p className="cart-option-modal__sublabel">색상</p>

                    {colors.length > 0 ? (
                        <div className="cart-option-modal__color-list">
                            {colors.map((color, idx) => (
                                <button
                                    key={color}
                                    className={`cart-option-modal__color-item ${selectedColor === color ? 'active' : ''}`}
                                    onClick={() => setSelectedColor(color)}
                                >
                                    {paths[idx] && (
                                        <img
                                            src={`/images/${paths[idx]}`}
                                            alt={color}
                                            onError={e => { e.target.style.display = 'none' }}
                                        />
                                    )}
                                    <span>{color}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="cart-option-modal__no-color">색상 옵션이 없는 상품입니다.</p>
                    )}
                </div>

                <div className="cart-option-modal__footer">
                    <button className="cart-option-modal__confirm" onClick={handleConfirm}>
                        변경하기
                    </button>
                </div>
            </div>
        </div>
    )
}