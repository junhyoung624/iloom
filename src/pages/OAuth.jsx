import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const OAuth = () => {
    const navigate = useNavigate();
    const { onNaverCallback } = useAuthStore();

    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', '?'));
        const accessToken = params.get('access_token');

        if (accessToken) {
            onNaverCallback(accessToken).then(() => {
                navigate('/');
            });
        } else {
            toast('네이버 로그인 실패')
            navigate('/login');
        }
    }, []);

    return (
        <div>OAuth</div>
    )
}

export default OAuth