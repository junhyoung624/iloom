import React from 'react'
import { useCompareStore } from '../store/useCompareStore'
import { useNavigate } from 'react-router-dom'
import './scss/ComparePage.scss'

const FALLBACK = '/images/no-image.png'

const ROWS = [
    { label: '이미지', key: 'image' },
    { label: '시리즈', key: 'series' },
    { label: '상품명', key: 'name' },
    { label: '가격', key: 'price' },
    { label: '색상 옵션', key: 'colors' },
    { label: '카테고리', key: 'category2' },
]

const ComparePage = () => {
    const { compareList, removeCompareItem, clearCompare } = useCompareStore()
    const navigate = useNavigate()

    if (compareList.length === 0) {
        return (
            <div className="compare-empty">
                <p>비교할 상품이 없어요.</p>
                <button onClick={() => navigate(-1)}>상품 보러가기</button>
            </div>
        )
    }

    const renderCell = (item, key) => {
        switch (key) {
            case 'image':
                return (
                    <img
                        src={item.productImages?.[0] || FALLBACK}
                        alt={item.name}
                        className="compare-img"
                    />
                )
            case 'price':
                return <strong>{item.price}원</strong>

            case 'colors':
                const colorValues = item.options?.find(opt => opt.name === '색상')?.values || []
                return (
                    <div className="color-swatches">
                        {colorValues.length > 0
                            ? colorValues.map((code, i) => (
                                <span key={i} className="color-badge">
                                    {code}
                                </span>
                            ))
                            : <span className="no-data">-</span>
                        }
                    </div>
                )

            default:
                return <span>{item[key] || '-'}</span>
        }
    }

    return (
        <div className="compare-page" style={{ paddingTop: "200px" }}>
            <div className="compare-page__header">
                <h1>상품 비교</h1>
                <button className="btn-clear" onClick={() => { clearCompare(); navigate(-1) }}>
                    초기화 후 돌아가기
                </button>
            </div>

            <div className="compare-table-wrap">
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th className="row-label" />
                            {compareList.map((item) => (
                                <th key={item.id}>
                                    <button
                                        className="remove-col"
                                        onClick={() => removeCompareItem(item.id)}
                                    >
                                        ✕ 제거
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {ROWS.map(({ label, key }) => (
                            <tr key={key} className={`row-${key}`}>
                                <td className="row-label">{label}</td>
                                {compareList.map((item) => (
                                    <td key={item.id} className="row-cell">
                                        {renderCell(item, key)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ComparePage