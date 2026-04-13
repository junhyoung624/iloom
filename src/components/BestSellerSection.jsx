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
        { id: "1-1", image: "./images/best-seller/product-01.png", serise: "핀", name: "원목 의자(쿠션형, 2EA)", price: "349,000 원" },
        { id: "1-2", image: "./images/best-seller/product-02.png", serise: "에디", name: "3단 600폭 책장", price: "99,000 원" }
      ]
    },
    {
      id: "2", key: "best2", image: "./images/best-seller/bestseller-02.png",
      product: [
        { id: "2-1", image: "./images/best-seller/product-03.png", serise: "필즈", name: "세라믹 원형 식탁 1100폭", price: "1,390,000 원" },
        { id: "2-2", image: "./images/best-seller/product-04.png", serise: "아고", name: "서커스 샹들리에 펜던트 조명 S (Cirkus Chandelier Pendent S", price: "748,000 원" }
      ]
    },
    {
      id: "3", key: "best3", image: "./images/best-seller/bestseller-03.png",
      product: [
        { id: "3-1", image: "./images/best-seller/product-05.png", serise: "캐스터네츠", name: "펫 3인 소파(우,패브릭,온라인몰 전용)", price: "1,129,000 원" },
        { id: "3-2", image: "./images/best-seller/product-06.png", serise: "케플러클래식", name: "책상서랍", price: "279,000 원" }
      ]
    },
    {
      id: "4", key: "best4", image: "./images/best-seller/bestseller-04.png",
      product: [
        { id: "4-1", image: "./images/best-seller/product-07.png", serise: "멘디", name: "패키지(1400책상,2000파티션책장,SS침대 프레임)", price: "969,000 원" },
        { id: "4-2", image: "./images/best-seller/product-08.png", serise: "쿠시노 코지", name: "침대 프레임 SS(실리콘패브릭)", price: "653,000 원" }
      ]
    },
    {
      id: "5", key: "best5", image: "./images/best-seller/bestseller-05.png",
      product: [
        { id: "5-1", image: "./images/best-seller/product-09.png", serise: "모니스W", name: "3단 수납장 800폭 (도어 미포함)", price: "159,000 원" },
        { id: "5-2", image: "./images/best-seller/product-10.png", serise: "미엘", name: "서랍장 4단 800폭", price: "329,000 원" }
      ]
    },
    {
      id: "6", key: "best6", image: "./images/best-seller/bestseller-06.png",
      product: [
        { id: "6-1", image: "./images/best-seller/product-11.png", serise: "엘바패밀리", name: "1200폭 홈바 세트 (우드쉘,D450)", price: "617,000 원" },
        { id: "6-2", image: "./images/best-seller/product-12.png ", serise: "테싯", name: "의자 (우드쉘, 1EA)", price: "209,000 원" }
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
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}