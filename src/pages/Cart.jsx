import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { productData } from '../data/productData'
import { useProductStore } from '../store/useProductStore'
import "./scss/cart.scss"
import CartOptionModal from '../components/CartOptionModal'
import { colorData } from '../data/colorData'
import { Helmet } from 'react-helmet-async'
import NumberFlow from '@number-flow/react'
import SubPageEmptyState from '../components/SubPageEmptyState'

export default function Cart() {
  const {
    items,
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
        return {
          ...product,
          qty: cartItem.qty,
          checked: cartItem.checked,
          color: cartItem.color,
        }
      })
      .filter(Boolean)
  }, [cartItems])

  const allChecked =
    mergedCartItems.length > 0 &&
    mergedCartItems.every((item) => item.checked)

  const selectedItems = mergedCartItems.filter((item) => item.checked)

  const totalProductPrice = selectedItems.reduce((acc, item) => {
    const priceNumber = Number(item.price.replace(/,/g, ''))
    return acc + priceNumber * item.qty
  }, 0)

  const shippingPrice = 0
  const finalPrice = totalProductPrice + shippingPrice

  const recommendItems = productData
    .filter((item) => !cartItems.some((cart) => cart.id === item.id))
    .slice(0, 5)

  const handleOptionConfirm = (id, oldColor, newColor) => {
    if (oldColor === newColor) {
      setOptionModalItem(null)
      return
    }
    setOptionModalItem(null)
    setTimeout(() => {
      changeItemColor(id, oldColor, newColor)
    }, 50)
  }

  if (mergedCartItems.length === 0) {
    return (
      <section className="cart-page empty">
        <div className="inner">
          <div className="cart-title-box">
            <h2>장바구니</h2>
            <p>장바구니에 담긴 상품이 없습니다.</p>
          </div>
          <SubPageEmptyState
            className="cart-empty-state"
            imageSrc="/images/logo-icon/nocart.png"
            imageAlt="cart empty"
            title="아직 담긴 상품이 없어요."
            actionLabel="쇼핑하기"
            actionTo="/"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <Helmet>
        <title>장바구니 | iloom</title>
        <meta name="description" content="담아둔 상품을 확인하세요." />
      </Helmet>
      <div className="inner">
        <div className="cart-title-box">
          <h2>장바구니</h2>
          <p>주문하실 상품을 선택하세요</p>
        </div>

        <div className="cart-content">
          <div className="cart-left">
            <div className="cart-head">
              <div className="col-check">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleAllChecked(e.target.checked)}
                  />
                  <span>전체 선택</span>
                </label>
              </div>
              <div className="col-info">상품 정보</div>
              <div></div>
              <div className="col-qty">수량</div>
              <div className="col-price">상품 금액</div>
            </div>

            <ul className="cart-list">
              {mergedCartItems.map((item) => {
                const colorInfo = colorData.find((c) => c.productCd === item.id)
                const colorIndex = colorInfo?.colorCd.indexOf(item.color)
                const colorImg = colorInfo?.localImgPath[colorIndex]
                const itemTotal = Number(item.price.replace(/,/g, '')) * item.qty

                return (
                  <li className="cart-item" key={`${item.id}-${item.color || 'default'}`}>
                    <div className="col-check">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecked(item.id, item.color)}
                      />
                    </div>

                    <div className="col-info">
                      <Link to={`/product/${item.id}`} className="thumb-box">
                        <img src={item.productImages?.[0]} alt={item.name} />
                      </Link>
                      <div className="info-text">
                        <strong className="brand">일룸</strong>
                        <p className="name">{item.name}</p>
                        <p className="meta">
                          색상: {item.color || '-'} {colorImg && <img src={`/images/${colorImg}`} alt={item.color} />}
                        </p>
                        <button
                          type="button"
                          className="option-change-btn"
                          onClick={() => setOptionModalItem(item)}
                        >
                          옵션변경
                        </button>
                      </div>
                    </div>

                    <div className="col-remove">
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeCartItem(item.id, item.color)}
                      >
                        삭제
                      </button>
                    </div>

                    <div className="col-qty">
                      <div className="qty-box">
                        <button type="button" onClick={() => decreaseQty(item.id, item.color)}>-</button>
                        <span>{item.qty}</span>
                        <button type="button" onClick={() => increaseQty(item.id, item.color)}>+</button>
                      </div>
                    </div>

                    <div className="col-price">
                      <strong><NumberFlow value={itemTotal} suffix="원" /></strong>
                      <span className="free-delivery">무료</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="cart-right">
            <h3>상품 주문 내역</h3>
            <div className="summary-row">
              <span>총 상품 금액</span>
              <strong><NumberFlow value={totalProductPrice} suffix="원" /></strong>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <strong><NumberFlow value={shippingPrice} suffix="원" /></strong>
            </div>
            <div className="summary-row discount"></div>

            <div className="summary-total">
              <span>상품 결제 예정금액</span>
              <strong><NumberFlow value={finalPrice} suffix="원" /></strong>
            </div>
            <Link to="/charge" className="charge-btn">
              <NumberFlow value={finalPrice} suffix="원" /> 주문하기
            </Link>
          </div>
        </div>

        <div className="recommend-section">
          <h3>이 상품을 구매한 고객이 함께 구매한 상품</h3>
          <div className="recommend-slider-wrap">
            <ul className="recommend-list">
              {recommendItems.map((item) => (
                <li key={item.id}>
                  <Link to={`/product/${item.id}`}>
                    <div className="img-box">
                      <img src={item.productImages?.[0]} alt={item.name} />
                    </div>
                    <strong>{item.series}</strong>
                    <p>{item.name}</p>
                    <span>{item.price}원</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {optionModalItem && (
        <CartOptionModal
          item={optionModalItem}
          onClose={() => setOptionModalItem(null)}
          onConfirm={handleOptionConfirm}
        />
      )}
    </section>
  )
}