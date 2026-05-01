import React, { useEffect, useState } from 'react'
import { useCompareStore } from '../store/useCompareStore'
import { useNavigate } from 'react-router-dom'
import './scss/CompareBar.scss'

const FALLBACK = '/images/no-image.png'

const CompareBar = () => {
    const { compareList, removeCompareItem, clearCompare } = useCompareStore()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)

    const hasItems = compareList.length > 0

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [isOpen])

    return (
        <>
            {/* FAB 버튼 */}
            <button
                className={`compare-fab ${hasItems ? 'has-items' : ''} ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="비교 목록"
            >
                <svg className="fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="8" height="18" rx="1" />
                    <rect x="14" y="3" width="8" height="18" rx="1" />
                </svg>
                {hasItems && (
                    <span className="fab-badge">{compareList.length}</span>
                )}
            </button>

            {/* 사이드바 */}
            <div className={`compare-sidebar ${isOpen ? 'visible' : ''}`}>
                <div className="compare-sidebar__header">
                    <span className="compare-sidebar__title">상품 비교</span>
                    <button className="compare-sidebar__clear" onClick={clearCompare}>
                        초기화
                    </button>
                </div>

                <div className="compare-sidebar__slots">
                    {[0, 1, 2].map((idx) => {
                        const item = compareList[idx]
                        return (
                            <div key={idx} className={`compare-slot ${item ? 'filled' : 'empty'}`}>
                                {item ? (
                                    <>
                                        <img
                                            src={item.productImages?.[0] || FALLBACK}
                                            alt={item.name}
                                            className="slot-img"
                                        />
                                        <div className="slot-info">
                                            <span className="slot-series">{item.series}</span>
                                            <span className="slot-name">{item.name}</span>
                                            <span className="slot-price">
                                                {item.price}원
                                            </span>
                                        </div>
                                        <button
                                            className="slot-remove"
                                            onClick={() => removeCompareItem(item.id)}
                                            aria-label="제거"
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : (
                                    <span className="slot-placeholder">+ 상품을 선택하세요</span>
                                )}
                            </div>
                        )
                    })}
                </div>

                <button
                    className="compare-sidebar__go"
                    onClick={() => { navigate('/compare'); setIsOpen(false) }}
                    disabled={compareList.length < 2}
                >
                    비교하기 ({compareList.length}/3)
                </button>
            </div>

            {/* 백드롭 */}
            {isOpen && (
                <div className="compare-backdrop" onClick={() => setIsOpen(false)} />
            )}
        </>
    )
}

export default CompareBar