import React, { useEffect, useRef } from 'react';
import "../components/scss/sns.scss";
import { TextAnimate } from '../pages/Text-animate';

export default function Sns() {
    const sectionRef = useRef(null);
    const cardRefs = useRef([]);

    const videoList = [
        { id: 1, src: "./images/video/sns-video01.mp4" },
        { id: 2, src: "./images/video/sns-video02.mp4" },
        { id: 3, src: "./images/video/sns-video03.mp4" },
        { id: 4, src: "./images/video/sns-video04.mp4" },
        { id: 5, src: "./images/video/sns-video05.mp4" },
    ];

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry], obs) => {
                if (entry.isIntersecting) {
                    cardRefs.current.forEach((card, index) => {
                        setTimeout(() => {
                            card?.classList.add("show");

                            if (index === 0) {
                                const video = card?.querySelector("video");
                                if (video) video.play().catch(() => { });
                            }
                        }, index * 200);
                    });
                    obs.unobserve(section);
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    const handleMouseEnter = (e) => {

        const index = cardRefs.current.indexOf(e.currentTarget);
        if (index === 0) return;

        const firstCard = cardRefs.current[0];
        const firstVideo = firstCard?.querySelector("video");
        if (firstVideo) firstVideo.pause();

        const video = e.currentTarget.querySelector("video");
        if (video) video.play().catch(() => { });
    };

    const handleMouseLeave = (e) => {
        const index = cardRefs.current.indexOf(e.currentTarget);
        if (index === 0) return;

        const video = e.currentTarget.querySelector("video");
        if (video) {
            video.pause();
            video.currentTime = 0;
        }

        const firstCard = cardRefs.current[0];
        const firstVideo = firstCard?.querySelector("video");
        if (firstVideo) firstVideo.play().catch(() => { });
    };

    return (
        <section className="sns" ref={sectionRef}>
            <div className="inner">
                <div className="title-box">
                    <TextAnimate
                        as="h2"
                        animation="slideUp"
                        by="character"
                        once
                    >
                        iloom Moment.
                    </TextAnimate>
                    <TextAnimate
                        as="p"
                        animation="slideUp"
                        by="word"
                        delay={0.4}
                        once
                    >
                        나의 일상이 화보가 되는 기록
                    </TextAnimate>
                </div>

                <div className="sns-grid">
                    {videoList.map((item, index) => (
                        <div
                            className="video-card"
                            key={item.id}
                            ref={(el) => (cardRefs.current[index] = el)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <video
                                src={item.src}
                                muted
                                playsInline
                                loop
                                preload="metadata"
                            />
                            <div className="dim"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}