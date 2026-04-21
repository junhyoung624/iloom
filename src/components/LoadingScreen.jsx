import { useEffect, useState } from 'react'
import "./scss/loadingscreen.scss"

export default function LoadingScreen({ onFinish }) {
    const [phase, setPhase] = useState('fill')   // 'fill' → 'fadeout'

    useEffect(() => {
        // 1.2s 동안 마스크 fill 애니메이션
        const fillTimer = setTimeout(() => {
            setPhase('fadeout')
        }, 1400)

        // fadeout 끝나고 컴포넌트 제거
        const doneTimer = setTimeout(() => {
            onFinish?.()
        }, 2200)

        return () => {
            clearTimeout(fillTimer)
            clearTimeout(doneTimer)
        }
    }, [])

    return (
        <div className={`loading-screen ${phase === 'fadeout' ? 'loading-screen--fadeout' : ''}`}>
            <div className="loading-screen__logo">
                {/* 하단 레이어: 검정 로고 (항상 보임) */}
                <img
                    className="loading-screen__logo-black"
                    src="/images/logo-icon/main-logo-black.png"
                    alt="iloom"
                />
                {/* 상단 레이어: 흰 로고, clip-path 마스크로 아래→위 fill */}
                <img
                    className={`loading-screen__logo-white ${phase === 'fill' ? 'loading-screen__logo-white--animate' : 'loading-screen__logo-white--full'}`}
                    src="/images/logo-icon/main-logo-white.png"
                    alt=""
                    aria-hidden="true"
                />
            </div>
        </div>
    )
}