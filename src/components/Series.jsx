import React from 'react'
import { Link } from 'react-router-dom'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import "./scss/series.scss"

export default function Series() {
    const seriesList = [
        { id: "1", key: "아르지안", image: "./images/series/arjian.jpg" },
        { id: "2", key: "멘디", image: "./images/series/mendy.jpg" },
        { id: "3", key: "헤이즐 R", image: "./images/series/hazelr.jpg" },
        { id: "4", key: "앤트레디션", image: "./images/series/antredition.jpg" },
        { id: "5", key: "플로코", image: "./images/series/floco.jpg" },

    ]
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
                        className='mySwiper'>
                        {seriesList.map((item) => (
                            <SwiperSlide key={item.id}>
                                <div className='series-card'>
                                    <div className="img-box">
                                        <img src={item.image} alt={item.id} />
                                    </div>
                                    <div className="text-box">
                                        <h2>{item.key}</h2>
                                        <Link><button>지금 만나보기</button></Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}

                    </Swiper>
                </div>
            </div>
        </section >
    )
}
