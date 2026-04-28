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

const HERO_FADE_START = 0
const HERO_FADE_END = 700

export default function Home() {
  const [overlayOpacity, setOverlayOpacity] = useState(0.7)
  const [heroAnimate, setHeroAnimate] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      const progress = Math.min(
        Math.max((scrollY - HERO_FADE_START) / (HERO_FADE_END - HERO_FADE_START), 0),
        1
      )

      const nextOpacity = 0.5 * (1 - progress)
      setOverlayOpacity(nextOpacity)
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

  return (
    <div className="home">
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
          <div className={`hero-text ${heroAnimate ? 'show' : ''}`}>
            <h2 className="hero-title">Timeless Favorites for Everyday Living.</h2>
            <p className="hero-desc">
              일상 속에서 꾸준히 사랑받는 일룸의 베스트셀러
            </p>

            <Link to="/BestSeller" className="hero-cta">
              <span className="hero-cta__label">베스트셀러 보기</span>
              <span className="hero-cta__icon" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Popup />
      <Product3DViewer />
      <FurnitureList />
      <BestSellerSection />
      <NewCollection />
      <Place />
      <SpaceCoordi />
      <Series />
      <Sns />
      <Instagram />
      <Magazine />
      <FooterAccordion />
    </div>
  )
}