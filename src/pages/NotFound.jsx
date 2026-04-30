import React from 'react'
import '../pages/scss/product-detail.scss'

export default function NotFound() {
    return (
        <div className="not-found">
            <p>페이지를 찾을 수 없어요.</p>
            <span>주소가 잘못되었거나 삭제된 페이지입니다.</span>
            <Link to="/">홈으로 돌아가기</Link>
        </div>
    )
}
