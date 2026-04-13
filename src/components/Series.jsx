import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import "./scss/series.scss"
import { productData } from '../data/productData'

const tabs = ["에디", "하이프", "레마", "코모"]

export default function Series() {
    const [activeTab, setActiveTab] = useState("에디")

    const seriesList = [
        { id: "1", key: "에디", image: "./images/series/eddi.jpg" },
        { id: "2", key: "하이프", image: "./images/series/Hype.jpg" },
        { id: "3", key: "레마", image: "./images/series/rema.jpg" },
        { id: "4", key: "코모", image: "./images/series/como.jpg" },
    ]

    const seriesItem = productData.filter((item) => item.series === activeTab).slice(0, 10);

    return (
        <section className="series">
            <div className="inner">
                <div className="title-box">
                    <h1>공간을 완성하는 시리즈</h1>
                    <h3>일상의 흐름에 맞춰 구성된 일룸의 컬렉션</h3>
                </div>

                <div className="img-slide-wrap">
                    <Swiper
                        navigation={true}
                        modules={[Navigation]}
                        slidesPerView={2.5}
                        spaceBetween={10}
                        className="mySwiper"
                    >
                        {seriesList.map((item) => (
                            <SwiperSlide key={item.id}>
                                <div className="series-card">
                                    <div className="img-box">
                                        <img src={item.image} alt={item.key} />
                                    </div>
                                    <div className="text-box">
                                        <h2>{item.key}</h2>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(item.key)}
                                        >
                                            지금 만나보기
                                        </button>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className="item">
                    <div className="tab-menu">
                        {tabs.map((tab) => (
                            <button
                                type="button"
                                key={tab}
                                className={activeTab === tab ?
                                    "series-name active" : "series-name"}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="item-card-wrap">

                        {seriesItem.map((item, index) => (
                            <Link
                                to={`/product/${item.id}`}
                                className="item-card"
                                key={`${item.id}-${index}`}
                            >
                                <div>
                                    <img src={item.productImages[1]} alt={item.name} />
                                    <div className="series-label">{item.series}</div>
                                    <h1>{item.name}</h1>
                                    <h2>{item.category3}</h2>
                                    <span>{item.price}원</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}