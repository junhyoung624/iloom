import React from "react";
import "../components/scss/magazine.scss";
import { Link } from "react-router-dom";
import { iloomList } from "../data/magazine";

export default function Magazine() {
    const magazineItems = iloomList.filter((item) => item.category === "매거진")
        .slice(0, 3);


    return (
        <section className="magazine">
            <div className="inner">
                <div className="title-box">
                    <h1>Weekly Brand</h1>
                    <h3>이번 주, 주목할 브랜드 이야기</h3>
                </div>

                <div className="magazine-box">
                    {magazineItems.map((item) => (
                        <div className="magazine-card" key={item.id}>
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