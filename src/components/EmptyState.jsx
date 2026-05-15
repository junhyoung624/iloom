import React from 'react'
import { Link } from 'react-router-dom'
import SubPageEmptyState from './SubPageEmptyState'

export default function EmptyState() {
    return (
        <>
            <SubPageEmptyState
                className="cart-empty-state"
                imageSrc="/images/logo-icon/no-image.svg"
                imageAlt="cart empty"
                title="존재하지 않는 상품입니다."
                actionLabel="홈으로 돌아가기"
                actionTo="/"
            />
        </>
    )
}
