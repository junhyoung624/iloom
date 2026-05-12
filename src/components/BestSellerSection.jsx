import React, { useEffect, useRef, useState } from 'react'
import { Autoplay, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import "./scss/bestseller.scss"
import "./scss/bestseller-dot.scss"
import 'swiper/css'
import 'swiper/css/navigation'
import { Link } from 'react-router-dom'

const DOT_POSITIONS = [
  [{ x: 40, y: 65 }, { x: 65, y: 38 }],
  [{ x: 45, y: 65 }, { x: 45, y: 17 }],
  [{ x: 40, y: 55 }, { x: 85, y: 55 }],
  [{ x: 90, y: 45 }, { x: 25, y: 60 }],
  [{ x: 43, y: 58 }, { x: 75, y: 55 }],
  [{ x: 30, y: 50 }, { x: 63, y: 65 }],
]

function BestDot({ product, position }) {
  const [visible, setVisible] = useState(false)
  const isRight = position.x > 50
  const isBottom = position.y > 50

  return (
    <li
      className="best-dot-li"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div className="best-dot-area" />
      <div
        className={`best-price-tag ${visible ? 'best-price-tag--visible' : 'best-price-tag--hidden'}`}
        style={{
          right: isRight ? '24px' : 'auto',
          left: isRight ? 'auto' : '24px',
          bottom: isBottom ? '24px' : 'auto',
          top: isBottom ? 'auto' : '24px',
        }}
      >
        <div className="best-tag-inner">
          <div className="best-tag-img">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="best-tag-info">
            <p className="best-tag-series">{product.serise}</p>
            <p className="best-tag-name">{product.name}</p>
            <p className="best-tag-price">{product.price}</p>
          </div>
          <div className="best-tag-btn-area">
            <Link to={`/product/${product.id}`}>
              <div className="best-tag-arrow-btn">
                <img src="./images/spaceCoordi/pricetag_icon/arrow.png" alt="상품 보기" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function Best() {
  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const sectionRef = useRef(null)

  const [visibleItems, setVisibleItems] = useState([])

  const bestList = [
    {
      id: "1", key: "best1", image: "./images/best-seller/bestseller-01.png",
      product: [
        { id: "HCH9003", image: "./images/best-seller/product-01.png", serise: "핀", name: "원목 의자(쿠션형, 2EA)", price: "349,000 원" },
        { id: "HSFC063N", image: "./images/best-seller/product-02.png", serise: "에디", name: "3단 600폭 책장", price: "99,000 원" }
      ]
    },
    {
      id: "2", key: "best2", image: "./images/best-seller/bestseller-02.png",
      product: [
        { id: "IDD0023A", image: "./images/best-seller/product-03.png", serise: "필즈", name: "세라믹 원형 식탁 1100폭", price: "1,390,000 원" },
        { id: "IAL00GA12A", image: "./images/best-seller/product-04.png", serise: "아고", name: "서커스 샹들리에 펜던트 조명", price: "748,000 원" }
      ]
    },
    {
      id: "3", key: "best3", image: "./images/best-seller/bestseller-03.png",
      product: [
        { id: "HCS763PLF", image: "./images/best-seller/product-05.png", serise: "캐스터네츠", name: "펫 3인 소파(우,패브릭)", price: "1,129,000 원" },
        { id: "HSVP042", image: "./images/best-seller/product-06.png", serise: "케플러클래식", name: "책상서랍", price: "279,000 원" }
      ]
    },
    {
      id: "4", key: "best4", image: "./images/best-seller/bestseller-04.png",
      product: [
        { id: "HSO123BN", image: "./images/best-seller/product-07.png", serise: "로이", name: "로이 3단 측판형책상 세트 1200폭", price: "589,000 원" },
        { id: "IBF0038A", image: "./images/best-seller/product-08.png", serise: "쿠시노 코지", name: "침대 프레임 SS(실리콘패브릭)", price: "653,000 원" }
      ]
    },
    {
      id: "5", key: "best5", image: "./images/best-seller/bestseller-05.png",
      product: [
        { id: "ICS0004A", image: "./images/best-seller/product-09.png", serise: "모니스W", name: "3단 수납장 800폭", price: "159,000 원" },
        { id: "HP900841R", image: "./images/best-seller/product-10.png", serise: "미엘", name: "서랍장 4단 800폭", price: "329,000 원" }
      ]
    },
    {
      id: "6", key: "best6", image: "./images/best-seller/bestseller-06.png",
      product: [
        { id: "HTUD1200H", image: "./images/best-seller/product-11.png", serise: "엘바패밀리", name: "1200폭 홈바 세트", price: "617,000 원" },
        { id: "ITY00CD00A", image: "./images/best-seller/product-12.png", serise: "테싯", name: "의자 (우드쉘, 1EA)", price: "209,000 원" }
      ]
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          bestList.forEach((_, i) => {
            setTimeout(() => {
              setVisibleItems(prev => [...prev, i])
            }, i * 120)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="best" ref={sectionRef}>
      <div className="inner">
        <div className="title-box">
          <h2>iloom best seller</h2>
          <p>일룸의 베스트 상품을 만나보세요</p>
        </div>
      </div>

      <div className="best-swiper-wrap">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current
            swiper.params.navigation.nextEl = nextRef.current
          }}
          slidesPerView={3}
          spaceBetween={30}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
        >
          {bestList.map((item, slideIndex) => (
            <SwiperSlide key={item.id}>
              <div
                className={`best-item ${visibleItems.includes(slideIndex) ? 'visible' : ''}`}
              >
                <div className="best-img-wrap">
                  <img src={item.image} alt={item.key} />
                  <ul className="best-dot-list">
                    {item.product.map((product, dotIndex) => (
                      <BestDot
                        key={product.id}
                        product={product}
                        position={
                          DOT_POSITIONS[slideIndex]?.[dotIndex] ??
                          { x: 30 + dotIndex * 30, y: 50 }
                        }
                      />
                    ))}
                  </ul>
                </div>
                <div>
                  <ul className="best-product-list">
                    {item.product.map((rel) => (
                      <li key={rel.id}>
                        <Link to={`/product/${rel.id}`}>
                          <div className="best-img-box">
                            <img src={rel.image} alt={rel.name} />
                          </div>
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
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="section-more-wrap">
        <Link to="/BestSeller" className="section-more-btn">
          <span>베스트셀러 더 보러가기</span>
          <span className="section-more-arrow">→</span>
        </Link>
      </div>
    </section>
  )
}