import React, { useEffect, useRef } from 'react'
import "./scss/instagram.scss"
import { TextAnimate } from '../pages/Text-animate'

export default function Instagram() {
    const sectionRef = useRef(null)
    const itemRefs = useRef([])

    const instaList = [
        { id: 1, src: "/images/instagram/instagram_01.jpg", alt: "01" },
        { id: 2, src: "/images/instagram/instagram_02.jpg", alt: "02" },
        { id: 3, src: "/images/instagram/instagram_03.jpg", alt: "03" },
        { id: 4, src: "/images/instagram/instagram_04.jpg", alt: "04" },
        { id: 5, src: "/images/instagram/instagram_05.jpg", alt: "05" },
    ]

    useEffect(() => {
        const section = sectionRef.current
        if (!section) return

        const observer = new IntersectionObserver(
            ([entry], obs) => {
                if (entry.isIntersecting) {
                    itemRefs.current.forEach((item, index) => {
                        setTimeout(() => {
                            item?.classList.add('show')
                        }, index * 180)
                    })

                    obs.unobserve(section)
                }
            },
            {
                threshold: 0.2,
            }
        )

        observer.observe(section)

        return () => observer.disconnect()
    }, [])

    return (
        <section className="instagram" ref={sectionRef}>
            <div className="inner">
                <div className="instagram-box">
                    <div className="instagram-text-box">
                        <TextAnimate
                            as="h1"
                            animation="slideUp"
                            by="character"
                            once
                        >
                            INSTAGRAM
                        </TextAnimate>
                        <TextAnimate
                            as="p"
                            animation="slideUp"
                            by="word"
                            delay={0.4}
                            once
                        >
                            @iloom_official
                        </TextAnimate>
                    </div>

                    <div className="instagram-img-box">
                        {instaList.map((item, index) => (
                            <a
                                key={item.id}
                                href="https://www.instagram.com/p/DXZLAyqEosu/"
                                target="_blank"
                                rel="noreferrer"
                                className="instagram-item"
                                ref={(el) => (itemRefs.current[index] = el)}
                            >
                                <img src={item.src} alt={item.alt} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}