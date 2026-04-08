import React from 'react';
import "../components/scss/sns.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
// import "swiper/css/navigation";

export default function Sns() {
    return (
        <section className="sns">
            <div className="inner">
                <div className="title-box">
                    <h1>iloom Moment.</h1>
                    <h3>나의 일상이 화보가 되는 기록</h3>
                </div>
            </div>

            <div className="sns-swiper-wrap">
                <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={25}
                    slidesPerView={6}
                    className="mySwiper"
                >
                    {/* <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide>
                    <SwiperSlide><video src="./images/video/sns-video01.mp4" controls /></SwiperSlide> */}
                </Swiper>
            </div>
        </section>
    );
}