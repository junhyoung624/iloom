import React from 'react'

const SORT_OPTIONS = [
    { label: "가격 높은순", type: "price", order: "desc" },
    { label: "가격 낮은순", type: "price", order: "asc" },
    { label: "인기순", type: "ranking", order: "desc" },
    { label: "신상품순", type: "new", order: "desc" },
    { label: "상품명순", type: "name", order: "asc" },
]

export default function SubSortControl({ sortType, sortOrder, onSetSort }) {
    const selectedValue = `${sortType}:${sortOrder}`

    const handleChange = (event) => {
        const [type, order] = event.target.value.split(":")
        onSetSort(type, order)
    }

    return (
        <>
            <div className="sub-filter-sort-btn-group">
                {SORT_OPTIONS.map((option) => {
                    const isActive = sortType === option.type && sortOrder === option.order

                    return (
                        <button
                            key={`${option.type}-${option.order}`}
                            type="button"
                            className={isActive ? "active" : ""}
                            onClick={() => onSetSort(option.type, option.order)}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>

            <div className="sub-filter-sort-select-wrap">
                <select
                    className="sub-filter-sort-select"
                    value={selectedValue}
                    onChange={handleChange}
                    aria-label="상품 정렬"
                >
                    {SORT_OPTIONS.map((option) => (
                        <option
                            key={`${option.type}-${option.order}`}
                            value={`${option.type}:${option.order}`}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </>
    )
}
