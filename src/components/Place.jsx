import React from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
// import 'swiper/css/navigation'
import { Link } from 'react-router-dom'
import "./scss/place.scss"

export default function Place() {
    const placeList = [
        { id: "1", link: "거실", key: "livingroom", image: "./images/place/livingroom.png", message: "대화의 온기가 깊어지는 곳" },
        { id: "2", link: "주방", key: "diningroom", image: "./images/place/diningroom.png", message: "함께하는 식사가 더 특별해지는 곳" },
        { id: "3", link: "침실", key: "bedroom", image: "./images/place/bedroom.png", message: "하루의 끝을 포근히 감싸는 곳" },
        { id: "4", link: "옷장", key: "closet", image: "./images/place/closet.png", message: "나만의 취향을 차곡히 담아내는 곳" },
        { id: "5", link: "서재", key: "library", image: "./images/place/library.png", message: "생각과 영감이 조용히 머무는 곳" },
        { id: "6", link: "학생방", key: "studyroom", image: "./images/place/studyroom.png", message: "집중의 흐름이 자연스럽게 이어지는 곳" },
        { id: "7", link: "키즈룸", key: "kidsroom", image: "./images/place/kidsroom.png", message: "상상과 웃음이 자라나는 곳" },
    ]

    return (
        <section className="place">
            <div className="inner">
                <div className="title-box">
                    <h2>일상의 모든 순간을 더 깊고 아늑하게</h2>
                    <h1>가장 나다운 모습으로 머무는 자리</h1>
                    <span>/</span>
                    <p>일룸이 제안하는 새로운 일상</p>
                </div>
            </div>

            <div className="place-swiper-wrap">
                <Swiper
                    navigation={true}
                    modules={[Navigation]}
                    slidesPerView={"auto"}
                    spaceBetween={10}
                    // loop={true}
                    className="mySwiper"
                >
                    {placeList.map((item) => (
                        <SwiperSlide key={item.id}>
                            <div className="place-item">
                                <Link to={`/${item.link}`}>
                                    <img src={item.image} alt={item.key} />
                                    <p>{item.key}</p>
                                    <span className="place-message">{item.message}</span>
                                    <p className='place-btn'>더 보기</p>
                                </Link>
                                
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    )
}