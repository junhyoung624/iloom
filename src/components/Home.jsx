import React, { useEffect, useState } from 'react'
import BestSellerSection from './BestSellerSection'
import FooterAccordion from './FooterAccordion'
import Magazine from './Magazine'
import Sns from './Sns'
import Series from './Series'
import FurnitureList from './FurnitureList'
import Place from './Place'
import NewCollection from './NewCollection'
import SpaceCoordi from './SpaceCoordi'
import Popup from '../pages/EventPopup'
import Instagram from './Instagram'
import { Link } from 'react-router-dom'
import Product3DViewer from './Product3DViewer'
import Reveal from './Reveal'
import { Helmet } from 'react-helmet-async'
import ModuleHero from './ModuleHero'
import VideoModal from './VideoModal'

const HERO_FADE_START = 0
const HERO_FADE_END = 1500
const HERO_OVERLAY_MAX = 0.8

export default function Home() {
  const [overlayOpacity, setOverlayOpacity] = useState(HERO_OVERLAY_MAX)
  const [heroAnimate, setHeroAnimate] = useState(false)

  // 영상 팝업 상태
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  // 히어로 스크롤
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      const progress = Math.min(
        Math.max(
          (scrollY - HERO_FADE_START) /
          (HERO_FADE_END - HERO_FADE_START),
          0
        ),
        1
      )

      setOverlayOpacity(
        HERO_OVERLAY_MAX * (1 - progress)
      )
    }

    window.addEventListener('scroll', handleScroll)

    handleScroll()

    const heroTimer = setTimeout(() => {
      setHeroAnimate(true)
    }, 1200)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(heroTimer)
    }
  }, [])

  // 영상 팝업 (일주일 숨김 체크)
  useEffect(() => {
    const hideUntil = localStorage.getItem(
      "hideVideoPopupUntil"
    )

    const now = Date.now()

    // 저장된 값 없거나 만료되면 팝업 열기
    if (!hideUntil || now > Number(hideUntil)) {
      const timer = setTimeout(() => {
        setIsVideoOpen(true)
      }, 1800)

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className="home">
      <Helmet>
        <title>iloom</title>

        <meta
          name="description"
          content="일상 속에서 꾸준히 사랑받는 일룸의 베스트셀러 가구와 홈데코를 만나보세요."
        />
      </Helmet>

      <section className="hero-scroll-section">
        <div className="hero-video">
          <video
            src="./images/video/home.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          <div
            className="hero-overlay"
            style={{ opacity: overlayOpacity }}
          />

          <div
            className={`hero-text ${heroAnimate ? 'show' : ''
              }`}
          >
            <h2 className="hero-title">
              Timeless Favorites for Everyday Living.
            </h2>

            <p className="hero-desc">
              일상 속에서 꾸준히 사랑받는 일룸의 베스트셀러
            </p>

            <Link
              to="/BestSeller"
              className="hero-cta"
            >
              <span className="hero-cta__label">
                베스트셀러 보기
              </span>

              <span
                className="hero-cta__icon"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 영상 팝업 */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />

      <Popup />

      <Reveal>
        <Product3DViewer />
      </Reveal>

      <Reveal>
        <FurnitureList />
      </Reveal>

      <Reveal>
        <BestSellerSection />
      </Reveal>

      <Reveal>
        <NewCollection />
      </Reveal>

      <Reveal>
        <Place />
      </Reveal>

      <Reveal>
        <SpaceCoordi />
      </Reveal>

      <Reveal>
        {/* <Series /> */}
        <ModuleHero />
      </Reveal>

      <Sns />
      <Instagram />
      <Magazine />
      <FooterAccordion />
    </div>
  )
}