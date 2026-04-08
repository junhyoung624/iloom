import React from "react";
import "../components/scss/magazine.scss";
import { Link } from "react-router-dom";

const brandData = [
    {
        category: "브랜드",
        title: "모션 (MOTION) 문제가 있었다 캠페인",
        desc: "당신을 향한 다정함이 깃든 일룸의 모션 제품들을 만나보세요.",
        image: "./images/magazine/magazine01.png",
    },
    {
        category: "솔루션",
        title: "홈파티의 기술",
        desc: "소중한 사람들과 집에서 함께 시간을 즐기는 방법",
        image: "./images/magazine/magazine01.png",
    },
    {
        category: "솔루션",
        title: "꾸준하게 쌓아서 이룬 결과는 오래가니까요",
        desc: "김준서, 김나림, 김리안, 김리원 가족의 이야기를 만나보세요.",
        image: "./images/magazine/magazine01.png",
    },
];

export default function Magazine() {
    return (
        <section className="magazine">
            <div className="inner">
                <div className="title-box">
                    <h1>Weekly Brand</h1>
                    <h3>이번 주, 주목할 브랜드 이야기</h3>
                </div>

                <div className="magazine-box">
                    {brandData.map((item, index) => (
                        <div className="magazine-card" key={index}>
                            <div className="magazine-img-box">
                                <img src={item.image} alt={item.title} />
                            </div>

                            <div className="text-box">
                                <h4>{item.category}</h4>
                                <h2>{item.title}</h2>
                                <p>{item.desc}</p>
                                <Link to="/" className="story-button">이야기 더 보기</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}