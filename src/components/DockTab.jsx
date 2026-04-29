import React, { useEffect, useState } from 'react'
import { Dock, DockIcon, DockSeparator } from '../pages/Dock'
import { Link } from 'react-router-dom'
import "./scss/docktab.scss"
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import WishlistGuardPopup from '../pages/WishlistGuardPopup'
import InquiryDock from './InquiryDock'
import { productData } from '../data/productData'

export default function DockTab() {
    const { cartItems } = useProductStore()
    const { user } = useAuthStore()
    const cartCount = cartItems.length
    const [showPopup, setShowPopup] = useState(false)
    const [showPhone, setShowPhone] = useState(false)
    const [showInquiry, setShowInquiry] = useState(false)

    const cartPreviewItems = cartItems
        .map((cartItem) => {
            const product = productData.find((item) => item.id === cartItem.id)
            if (!product) return null

            return {
                ...product,
                qty: cartItem.qty,
                color: cartItem.color,
            }
        })
        .filter(Boolean)
        .slice(0, 4)


    const handleWishlistClick = (e) => {
        if (!user) { e.preventDefault(); setShowPopup(true) }
    }

    const handlePhoneClick = () => setShowPhone(true)

    useEffect(() => {
        if (!showPhone) return
        const timer = setTimeout(() => setShowPhone(false), 2000)
        return () => clearTimeout(timer)
    }, [showPhone])

    return (
        <div className='dock-tab-wrap'>
            <div className="dock-tab">
                <Dock iconSize={40} iconMagnification={50} iconDistance={120}>
                    <DockIcon>
                        <Link to="/">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </Link>
                    </DockIcon>

                    <DockSeparator />

                    <DockIcon>
                        <div className="dock-cart-wrap">
                            <Link to="/cart" className="dock-cart-link">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
                                </svg>

                                {cartCount > 0 && (
                                    <span className="dock-cart-badge">{cartCount}</span>
                                )}
                            </Link>

                            {cartPreviewItems.length > 0 && (
                                <div className="dock-cart-preview">
                                    <div className="dock-cart-preview__head">
                                        <div>
                                            <span>장바구니 미리보기</span>
                                            <p>담은 상품을 바로 확인해보세요</p>
                                        </div>
                                        <strong>{cartCount}</strong>
                                    </div>

                                    <div className="dock-cart-preview__list">
                                        {cartPreviewItems.map((item) => (
                                            <Link
                                                to={`/product/${item.id}`}
                                                className="dock-cart-preview__item"
                                                key={`${item.id}-${item.color}`}
                                            >
                                                <div className="dock-cart-preview__thumb">
                                                    <img src={item.productImages?.[0]} alt={item.name} />

                                                    {item.qty > 1 && (
                                                        <span className="dock-cart-preview__qty">x{item.qty}</span>
                                                    )}
                                                </div>

                                                <div className="dock-cart-preview__info">
                                                    <p className="dock-cart-preview__series">{item.series}</p>
                                                    <p className="dock-cart-preview__name">{item.name}</p>
                                                    {item.color && (
                                                        <span className="dock-cart-preview__color">{item.color}</span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    {cartItems.length > 4 && (
                                        <Link to="/cart" className="dock-cart-preview__more">
                                            +{cartItems.length - 4}개 더 보기
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </DockIcon>

                    <DockIcon>
                        <Link to="/wishlist" onClick={handleWishlistClick} style={{ opacity: user ? 1 : 0.4 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                        </Link>
                    </DockIcon>

                    <DockSeparator />


                    <DockIcon>
                        <button
                            type="button"
                            className="dock-phone-btn"
                            onClick={() => setShowInquiry((v) => !v)}
                            style={{ color: showInquiry ? '#111' : 'inherit' }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>
                    </DockIcon>

                    <DockIcon>
                        <button type="button" className="dock-phone-btn" onClick={handlePhoneClick}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.66 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.18a2 2 0 0 1 2.11-.45c.84.32 1.72.54 2.62.66A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </button>
                    </DockIcon>

                    <DockIcon>
                        <a href="https://www.instagram.com/iloom_official"
                            target="_blank" rel="noreferrer"
                            className="dock-instagram-btn" aria-label="인스타그램">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <path d="M16 11.37a4 4 0 1 1-2.37-3.63 4 4 0 0 1 2.37 3.63z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                        </a>
                    </DockIcon>
                </Dock>
            </div>

            {showInquiry && <InquiryDock onClose={() => setShowInquiry(false)} />}
            {showPhone && <div className="dock-phone-toast"><span>1577-5670</span></div>}
            {showPopup && <WishlistGuardPopup onClose={() => setShowPopup(false)} />}
        </div>
    )
}