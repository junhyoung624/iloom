import React from 'react'
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




const Home = () => {
  return (
    <div className='main-video'>
      <img src="./images/mainImg.png" alt="" />
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

export default Home