import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../store/useProductStore'
import { productData } from '../data/productData'
import { colorData } from '../data/colorData'
import CartOptionModal from './CartOptionModal'
import "./scss/cartpanel.scss"

export default function CartPanel({ onClose }) {
    const {
        cartItems,
        increaseQty,
        decreaseQty,
        toggleChecked,
        toggleAllChecked,
        removeCartItem,
        changeItemColor,
    } = useProductStore()

    const [optionModalItem, setOptionModalItem] = useState(null)

    const mergedCartItems = useMemo(() => {
        return cartItems
            .map((cartItem) => {
                const product = productData.find((item) => item.id === cartItem.id)
                if (!product) return null
                return { ...product, qty: cartItem.qty, checked: cartItem.checked, color: cartItem.color }
            })
            .filter(Boolean)
    }, [cartItems])

    const allChecked = mergedCartItems.length > 0 && mergedCartItems.every((item) => item.checked)
    const selectedItems = mergedCartItems.filter((item) => item.checked)

    const totalPrice = selectedItems.reduce((acc, item) => {
        return acc + Number(item.price.replace(/,/g, '')) * item.qty
    }, 0)

    const finalPrice = totalPrice

    const handleOptionConfirm = (id, oldColor, newColor) => {
        setOptionModalItem(null)
        if (oldColor !== newColor) setTimeout(() => changeItemColor(id, oldColor, newColor), 50)
    }

    return (
        <div className="cart-panel">

            <div className="cart-panel__header">
                <h3>장바구니 <span className="cart-panel__count">{mergedCartItems.length}</span></h3>
                <button className="cart-panel__close" onClick={onClose}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {mergedCartItems.length === 0 ? (
                <div className="cart-panel__empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                        stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
                    </svg>
                    <p>장바구니가 비어있어요</p>
                </div>
            ) : (
                <>

                    <div className="cart-panel__select-all">
                        <label className="cart-panel__check-label">
                            <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={(e) => toggleAllChecked(e.target.checked)}
                            />
                            <span>전체선택 ({selectedItems.length}/{mergedCartItems.length})</span>
                        </label>
                    </div>


                    <ul className="cart-panel__list">
                        {mergedCartItems.map((item) => {
                            const colorInfo = colorData.find((c) => c.productCd === item.id)
                            const colorIndex = colorInfo?.colorCd.indexOf(item.color)
                            const colorImg = colorInfo?.localImgPath[colorIndex]
                            const itemTotal = Number(item.price.replace(/,/g, '')) * item.qty

                            return (
                                <li key={`${item.id}-${item.color}`} className={`cart-panel__item ${item.checked ? 'checked' : ''}`}>
                                    <div className="cart-panel__item-check">
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={() => toggleChecked(item.id, item.color)}
                                        />
                                    </div>

                                    <Link to={`/product/${item.id}`} className="cart-panel__thumb" onClick={onClose}>
                                        <img src={item.productImages?.[0]} alt={item.name} />
                                    </Link>

                                    <div className="cart-panel__info">
                                        <div className="cart-panel__info-top">
                                            <div>
                                                <p className="cart-panel__series">{item.series}</p>
                                                <p className="cart-panel__name">{item.name}</p>
                                                {item.color && (
                                                    <div className="cart-panel__color">
                                                        {colorImg && <img src={`/images/${colorImg}`} alt={item.color} />}
                                                        <span>{item.color}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className="cart-panel__remove"
                                                onClick={() => removeCartItem(item.id, item.color)}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="cart-panel__info-bottom">
                                            {/* 수량 조절 */}
                                            <div className="cart-panel__qty">
                                                <button onClick={() => decreaseQty(item.id, item.color)}>−</button>
                                                <span>{item.qty}</span>
                                                <button onClick={() => increaseQty(item.id, item.color)}>+</button>
                                            </div>

                                            <div className="cart-panel__price-wrap">
                                                <strong className="cart-panel__price">{itemTotal.toLocaleString()}원</strong>
                                                <button
                                                    className="cart-panel__option-btn"
                                                    onClick={() => setOptionModalItem(item)}
                                                >
                                                    옵션변경
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>

                    {/* 가격 요약 */}
                    <div className="cart-panel__summary">
                        <div className="cart-panel__summary-row">
                            <span>총 상품금액</span>
                            <span>{totalPrice.toLocaleString()}원</span>
                        </div>
                        <div className="cart-panel__summary-row discount">

                        </div>
                        <div className="cart-panel__summary-row total">
                            <span>결제 예정금액</span>
                            <strong>{finalPrice.toLocaleString()}원</strong>
                        </div>
                    </div>

                    {/* 하단 버튼 */}
                    <div className="cart-panel__footer">
                        <Link to="/cart" className="cart-panel__cart-btn" onClick={onClose}>
                            장바구니 바로가기
                        </Link>
                        <Link to="/charge" className="cart-panel__order-btn" onClick={onClose}>
                            {finalPrice.toLocaleString()}원 주문하기
                        </Link>
                    </div>
                </>
            )}

            {optionModalItem && (
                <CartOptionModal
                    item={optionModalItem}
                    onClose={() => setOptionModalItem(null)}
                    onConfirm={handleOptionConfirm}
                />
            )}
        </div>
    )
}