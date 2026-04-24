import React from 'react'
import { Dock, DockIcon, DockSeparator } from '../pages/Dock'
import { Link } from 'react-router-dom'
import "./scss/docktab.scss"
import { useProductStore } from '../store/useProductStore'

export default function DockTab() {
    const { cartItems } = useProductStore()
    const cartCount = cartItems.length

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
                        <Link to="/cart" style={{ position: "relative" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="dock-cart-badge">{cartCount}</span>
                            )}
                        </Link>
                    </DockIcon>

                    <DockIcon>
                        <Link to="/wishlist">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                        </Link>
                    </DockIcon>
                </Dock>
            </div>
        </div>
    )
}