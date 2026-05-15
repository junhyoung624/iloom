import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { Link } from 'react-router-dom'
import "./scss/place.scss"

export default function Place() {
    const placeList = [
        { id: "1", link: "거실", key: "livingroom", image: "./images/place/livingroom.png", message: "대화의 온기가 깊어지는 곳" },
        { id: "2", link: "주방", key: "diningroom", image: "./images/place/diningroom.png", message: "함께하는 식사가 더 특별해지는 곳" },
        { id: "3", link: "침실", key: "bedroom", image: "./images/place/bedroom.png", message: "하루의 끝을 포근히 감싸는 곳" },
        { id: "4", link: "옷장", key: "closet", image: "./images/place/closet.png", message: "나만의 취향을 차곡히 담아내는 곳" },
        { id: "5", link: "서재", key: "library", image: "./images/place/library.png", message: "생각과 영감이 조용히 머무는 곳" },
        { id: "6", link: "학생방", key: "studyroom", image: "./images/place/studyroom.png", message: "집중의 흐름이 자연스럽게 이어지는 곳" },
        { id: "7", link: "키즈룸", key: "kidsroom", image: "./images/place/kidsroom.png", message: "상상과 웃음이 자라나는 곳" },
    ]

    const x = useMotionValue(0)
    const animRef = useRef(null)
    const loopList = [...placeList, ...placeList, ...placeList]
    const getItemWidth = () => window.matchMedia('(max-width: 768px)').matches ? 230 : 355
    const [itemWidth, setItemWidth] = useState(() => getItemWidth())
    const totalWidth = itemWidth * placeList.length

    const startAnimation = useCallback((from) => {
        const remaining = totalWidth - Math.abs(from % totalWidth)
        const fullDuration = 60
        const remainingDuration = (remaining / totalWidth) * fullDuration

        animRef.current = animate(x, from - remaining, {
            duration: remainingDuration,
            ease: 'linear',
            onComplete: () => {
                x.set(0)
                startAnimation(0)
            }
        })
    }, [totalWidth, x])

    useEffect(() => {
        const updateItemWidth = () => setItemWidth(getItemWidth())

        updateItemWidth()
        window.addEventListener('resize', updateItemWidth)

        return () => window.removeEventListener('resize', updateItemWidth)
    }, [])

    useEffect(() => {
        animRef.current?.stop()
        x.set(0)
        startAnimation(0)
        return () => animRef.current?.stop()
    }, [itemWidth, startAnimation, x])

    const handleMouseEnter = () => animRef.current?.stop()
    const handleMouseLeave = () => startAnimation(x.get())

    return (
        <section className="place">
            <div className="inner">
                <div className="title-box">
                    <h2>일상의 모든 순간을 더 깊고 아늑하게</h2>
                    <h3>가장 나다운 모습으로 머무는 자리</h3>
                    <img src="/images/place/line.png" alt="" />
                    <p>일룸이 제안하는 새로운 일상</p>
                </div>
            </div>

            <div className="place-swiper-wrap">
                <motion.div
                    style={{ display: 'flex', gap: '10px', width: 'max-content', x }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {loopList.map((item, index) => (
                        <div
                            key={index}
                            className="place-item"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const x = e.clientX - rect.left
                                const y = e.clientY - rect.top

                                e.currentTarget.style.setProperty('--x', `${x}px`)
                                e.currentTarget.style.setProperty('--y', `${y}px`)
                            }}
                        >
                            <Link to={`/${item.link}`}>
                                <img src={item.image} alt={item.key} />

                                <div className="place-overlay" />

                                {/* 손전등 효과 */}
                                <div className="place-light" />

                                <span className="place-label">{item.key}</span>

                                <div className="place-content">
                                    <p className="place-key">{item.key}</p>
                                    <p className="place-message">{item.message}</p>
                                    <button className="place-btn">더 보기</button>
                                </div>
                            </Link>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
