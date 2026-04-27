import React from 'react'

export default function TabOption({ product, getColorImg }) {
    return (
        <div className="tab-option">
            <h3>구매 가능한 옵션</h3>
            {product.options?.map((opt, i) => (
                <div key={i} className="option-group">
                    <p className="opt-name">{opt.name}</p>
                    <div className="opt-values-grid">
                        {(Array.isArray(opt.values) ? opt.values : [opt.values]).map((v, j) => (
                            <div key={j} className="opt-chip-item">
                                {opt.name === '색상' && getColorImg(v) && (
                                    <img src={`/images/${getColorImg(v)}`} alt={v} className="chip-img" />
                                )}
                                <span className="opt-chip">{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}