import React, { useEffect, useRef } from "react";
import "../components/scss/magazine.scss";
import { Link } from "react-router-dom";
import { iloomList } from "../data/magazine";
import { TextAnimate } from "../pages/Text-animate";

export default function Magazine() {
    const sectionRef = useRef(null);
    const cardRefs = useRef([]);

    const magazineItems = iloomList
        .filter((item) => item.category === "매거진")
        .slice(0, 3);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry], obs) => {
                if (entry.isIntersecting) {
                    cardRefs.current.forEach((card, index) => {
                        setTimeout(() => {
                            card?.classList.add("show");
                        }, index * 200);
                    });

                    obs.unobserve(section);
                }
            },
            {
                threshold: 0.2,
            }
        );

        observer.observe(section);

        return () => observer.disconnect();
    }, []);

    return (
        <section className="magazine" ref={sectionRef}>
            <div className="inner">
                <div className="title-box">
                    <TextAnimate
                        as="h2"
                        animation="slideUp"
                        by="character"
                        once
                    >
                        Weekly Brand
                    </TextAnimate>

                    <TextAnimate
                        as="p"
                        animation="slideUp"
                        by="word"
                        delay={0.4}
                        once
                    >
                        이번 주, 주목할 브랜드 이야기
                    </TextAnimate>
                </div>

                <div className="magazine-box">
                    {magazineItems.map((item, index) => (
                        <div
                            className="magazine-card"
                            key={item.id}
                            ref={(el) => (cardRefs.current[index] = el)}
                        >
                            <div className="magazine-img-box">
                                <img src={item.thumbnail} alt={item.title} />
                            </div>

                            <div className="text-box">
                                <h2>{item.title}</h2>
                                <p>{item.subtitle}</p>
                                <Link to={`/magazine/${item.id}`} className="story-button">
                                    이야기 더 보기
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}