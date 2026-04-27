import React from 'react'

export default function ZoomModal({ zoomImg, onClose }) {
    if (!zoomImg) return null

    return (
        <div className="zoom-overlay" onClick={onClose}>
            <img src={zoomImg} alt="확대이미지" onClick={(e) => e.stopPropagation()} />
        </div>
    )
}