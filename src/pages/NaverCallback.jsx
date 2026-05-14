import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function NaverCallback() {
    const { onNaverCallback } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        const hash = window.location.hash
        const params = new URLSearchParams(hash.replace('#', '?'))
        const accessToken = params.get('access_token')

        if (accessToken) {
            onNaverCallback(accessToken).then(() => {
                navigate('/mypage')
            })
        } else {
            navigate('/mypage')
        }
    }, [])
    return (
        <div>네이버 로그인 처리 중...</div>
    )
}
