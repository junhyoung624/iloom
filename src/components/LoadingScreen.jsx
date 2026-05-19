import { useEffect, useState } from 'react'
import "./scss/loadingscreen.scss"

export default function LoadingScreen({ onFinish }) {
    const [phase, setPhase] = useState('fill')

    useEffect(() => {
        const fillTimer = setTimeout(() => {
            setPhase('fadeout')
        }, 1400)

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
                <img
                    className="loading-screen__logo-black"
                    src="/images/logo-icon/main-logo-black.png"
                    alt="iloom"
                />
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