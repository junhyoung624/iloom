import React from 'react'
import { useProductStore } from '../store/useProductStore'

export default function Search() {
    const { items, searchWordAll } = useProductStore();
    //기본값 설정
    let categoryItems = items;
    //검색 필터
    if (searchWordAll) {
        const lowerWord = searchWordAll.toLowerCase();
        categoryItems = items.filter((item) =>
            item.title.toLowerCase().includes(lowerWord))
    }
    return (
        <div className='search-box'>
            <input type="text" />

        </div>
    )
}
