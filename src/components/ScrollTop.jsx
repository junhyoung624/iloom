import { useLayoutEffect, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollTop() {
    const { pathname, search } = useLocation()

    // 브라우저 자동 스크롤 복원 끄기
    useLayoutEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
    }, [])

    // 페이지 이동할 때 맨 위로
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto',
        })
    }, [pathname, search])

    return null
}