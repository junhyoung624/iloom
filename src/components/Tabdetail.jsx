import React from 'react'

export default function TabDetail({ product }) {
    return (
        <div className="tab-detail">
            {product.detailImg && product.detailImg.length > 0 ? (
                product.detailImg.map((img, i) => (
                    <img key={i} src={img} alt={`상세이미지${i + 1}`} />
                ))
            ) : (
                <p className="no-content">상세이미지가 없습니다.</p>
            )}
        </div>
    )
}