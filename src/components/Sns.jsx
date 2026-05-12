import React, { useEffect, useRef, useState } from 'react';
import "../components/scss/sns.scss";
import { TextAnimate } from '../pages/Text-animate';
import ButtonTabs from './common/ButtonTabs';

export default function Sns() {
    const cardRefs = useRef([]);
    const tabCardRefs = useRef([]);
    const isFirstRender = useRef(true);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeTab, setActiveTab] = useState("Short");

    const videoList = [
        { id: 1, src: "./images/video/sns-video01.mp4" },
        { id: 2, src: "./images/video/sns-video02.mp4" },
        { id: 3, src: "./images/video/sns-video03.mp4" },
        { id: 4, src: "./images/video/sns-video04.mp4" },
        { id: 5, src: "./images/video/sns-video05.mp4" },
    ];

    const wideVideoList = [
        { id: 101, src: "/images/video/sns16901.mp4" },
        { id: 102, src: "/images/video/sns16902.mp4" },
        { id: 103, src: "/images/video/sns16903.mp4" },
        { id: 104, src: "/images/video/sns16904.mp4" },
    ];

    const visibleList = isMobile ? videoList.slice(0, 2) : videoList;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showCardsSequentially = (refs) => {
        refs.forEach((card, index) => {
            setTimeout(() => {
                card?.classList.add("show");
                if (index === 0) {
                    card?.querySelector("video")?.play().catch(() => { });
                }
            }, index * 180);
        });
    };

    useEffect(() => {
        const refs = activeTab === "Short" ? cardRefs.current : tabCardRefs.current;
        const validRefs = refs.filter(Boolean);

        // 모든 카드 초기화
        [...cardRefs.current, ...tabCardRefs.current].forEach(card => {
            if (!card) return;
            card.classList.remove("show");
            const video = card.querySelector("video");
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });

        if (isFirstRender.current) {
            // 최초 로딩: IntersectionObserver로 스크롤 감지
            isFirstRender.current = false;

            const observer = new IntersectionObserver(
                (entries, obs) => {
                    const visible = entries.filter(e => e.isIntersecting);
                    if (visible.length === 0) return;

                    // 첫 감지 시 전체 순차 등장
                    showCardsSequentially(validRefs);
                    obs.disconnect();
                },
                { threshold: 0.1 }
            );

            const raf = requestAnimationFrame(() => {
                validRefs.forEach(card => observer.observe(card));
            });

            return () => {
                cancelAnimationFrame(raf);
                observer.disconnect();
            };

        } else {
            // 탭 전환: 바로 순차 등장
            const raf = requestAnimationFrame(() => {
                showCardsSequentially(validRefs);
            });

            return () => cancelAnimationFrame(raf);
        }

    }, [activeTab, isMobile]);

    const handleMouseEnter = (e, type) => {
        const refs = type === "Short" ? cardRefs.current : tabCardRefs.current;
        const index = refs.indexOf(e.currentTarget);
        if (index === 0) return;
        refs[0]?.querySelector("video")?.pause();
        e.currentTarget.querySelector("video")?.play().catch(() => { });
    };

    const handleMouseLeave = (e, type) => {
        const refs = type === "Short" ? cardRefs.current : tabCardRefs.current;
        const index = refs.indexOf(e.currentTarget);
        if (index === 0) return;
        const video = e.currentTarget.querySelector("video");
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        refs[0]?.querySelector("video")?.play().catch(() => { });
    };

    const tab_menu = ["Short", "Wide"];

    return (
        <section className="sns">
            <div className="inner">
                <div className="title-box">
                    <TextAnimate as="h2" animation="slideUp" by="character" once>
                        iloom Moment.
                    </TextAnimate>
                    <TextAnimate as="p" animation="slideUp" by="word" delay={0.4} once>
                        나의 일상이 화보가 되는 기록
                    </TextAnimate>
                </div>

                {/* <div className="sns-tab">
                    <button
                        className={activeTab === "short" ? "active" : ""}
                        onClick={() => setActiveTab("short")}
                    >
                        Short
                    </button>
                    <button
                        className={activeTab === "wide" ? "active" : ""}
                        onClick={() => setActiveTab("wide")}
                    >
                        Wide
                    </button>
                </div> */}

                <ButtonTabs
                    items={tab_menu}
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    ariaLabel="sns tabs" />

                {activeTab === "Short" && (
                    <div className="sns-grid">
                        {visibleList.map((item, index) => (
                            <div
                                className="video-card"
                                key={item.id}
                                ref={(el) => (cardRefs.current[index] = el)}
                                onMouseEnter={(e) => handleMouseEnter(e, "Short")}
                                onMouseLeave={(e) => handleMouseLeave(e, "Short")}
                            >
                                <video src={item.src} muted playsInline loop preload="auto" />
                                <div className="dim"></div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "Wide" && (
                    <div className="sns-grid wide">
                        {wideVideoList.map((item, index) => (
                            <div
                                className="video-card"
                                key={item.id}
                                ref={(el) => (tabCardRefs.current[index] = el)}
                                onMouseEnter={(e) => handleMouseEnter(e, "Wide")}
                                onMouseLeave={(e) => handleMouseLeave(e, "Wide")}
                            >
                                <video src={item.src} muted playsInline loop preload="auto" />
                                <div className="dim"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}