import React from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import "./scss/bestseller.scss"
import 'swiper/css'
import 'swiper/css/navigation'
import { Link } from 'react-router-dom'

export default function Best() {
  const bestList = [
    {
      id: "1", key: "best1", image: "./images/best-seller/bestseller-01.png",
      product: [
        { id: "1-1", image: "./images/best-seller/product-01.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" },
        { id: "1-2", image: "./images/best-seller/product-02.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" }
      ]
    },
    {
      id: "2", key: "best2", image: "./images/best-seller/bestseller-02.png",
      product: [
        { id: "2-1", image: "./images/best-seller/product-03.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" },
        { id: "2-2", image: "./images/best-seller/product-04.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" }
      ]
    },
    {
      id: "3", key: "best3", image: "./images/best-seller/bestseller-03.png",
      product: [
        { id: "3-1", image: "./images/best-seller/product-05.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" },
        { id: "3-2", image: "./images/best-seller/product-06.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" }
      ]
    },
    {
      id: "4", key: "best4", image: "./images/best-seller/bestseller-04.png",
      product: [
        { id: "4-1", image: "./images/best-seller/product-07.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" },
        { id: "4-2", image: "./images/best-seller/product-08.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" }
      ]
    },
    {
      id: "5", key: "best5", image: "./images/best-seller/bestseller-05.png",
      product: [
        { id: "5-1", image: "./images/best-seller/product-09.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" },
        { id: "5-2", image: "./images/best-seller/product-10.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" }
      ]
    },
    {
      id: "6", key: "best6", image: "./images/best-seller/bestseller-06.png",
      product: [
        { id: "6-1", image: "./images/best-seller/product-05.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" },
        { id: "6-2", image: "./images/best-seller/product-12.png", serise: "일룸", name: "일룸 팅클팝 피넛형 좌식 책상 830x550mm, IVGY(아이보리+그레이)", price: "109,000 원" }
      ]
    }
  ]

  return (
    <section className="best">
      <div className="inner">
        <div className="title-box">
          <h1>iloom best seller</h1>
          <h2>일룸의 베스트 상품을 만나보세요</h2>
        </div>

      <div className="best-swiper-wrap">
        <Swiper
          navigation={true}
          modules={[Navigation]}
          slidesPerView={3}
          spaceBetween={30}
          loop={true}
          className="mySwiper"
        >
          {bestList.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="best-item">
                <Link to={`/best/${item.id}`}>
                  <img src={item.image} alt={item.key} />
                </Link>
                <ul className="product-list">
                  {item.product.map((rel) => (
                    <li key={rel.id}>
                      <Link to={`/product/${rel.id}`}>
                        <img src={rel.image} alt={rel.name} />
                        <div className="product-info">
                          <p className='serise'>{rel.serise}</p>
                          <p className='name'>{rel.name}</p>
                          <p className='price'>{rel.price}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

        <div className="best-swiper-wrap">
          <Swiper
            navigation={true}
            modules={[Navigation]}
            slidesPerView={3}
            spaceBetween={30}
            loop={true}
            className="mySwiper"
          >
            {bestList.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="best-item">
                  <Link to={`/bestseller`}>
                    <img src={item.image} alt={item.key} />
                  </Link>

                  <ul className="product-list">
                    <Link>
                      {item.product.map((rel) => (
                        <li key={rel.id}>
                          <img src={rel.image} alt={rel.name} />
                          <div className="product-info">
                            <p className='serise'>{rel.serise}</p>
                            <p className='name'>{rel.name}</p>
                            <p className='price'>{rel.price}</p>
                          </div>
                        </li>
                      ))}
                    </Link>
                  </ul>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}