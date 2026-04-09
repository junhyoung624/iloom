import React from 'react';
import "../components/scss/sns.scss";

export default function Sns() {
    const videoList = [
        { id: 1, src: "./images/video/sns-video01.mp4" },
        { id: 2, src: "./images/video/sns-video02.mp4" },
        { id: 3, src: "./images/video/sns-video03.mp4" },
        { id: 4, src: "./images/video/sns-video04.mp4" },
        { id: 5, src: "./images/video/sns-video05.mp4" },
    ];

    const handleMouseEnter = (e) => {
        const video = e.currentTarget.querySelector("video");
        if (video) {
            video.play().catch(() => { });
        }
    };

    const handleMouseLeave = (e) => {
        const video = e.currentTarget.querySelector("video");
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    };

    return (
        <section className="sns">
            <div className="inner">
                <div className="title-box">
                    <h1>iloom Moment.</h1>
                    <h3>나의 일상이 화보가 되는 기록</h3>
                </div>

                <div className="sns-grid">
                    {videoList.map((item) => (
                        <div
                            className="video-card"
                            key={item.id}
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