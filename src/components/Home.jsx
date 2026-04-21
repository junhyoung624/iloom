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

const HERO_FADE_START = 0
const HERO_FADE_END = 700

export default function Home() {
  const [overlayOpacity, setOverlayOpacity] = useState(0.7)

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

    return () => window.removeEventListener('scroll', handleScroll)
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
          <div className="hero-text">
            <h2 className="hero-title">Comfort meets design</h2>
            <p className="hero-desc">
              일상을 편안하게 만드는 공간의 변화
            </p>


          </div>
        </div>
      </section>

      <Popup />
      <FurnitureList />
      <BestSellerSection />
      <NewCollection />
      <Place />
      <SpaceCoordi />
      <Series />
      <Sns />
      <Magazine />
      <FooterAccordion />
    </div>
  )
}