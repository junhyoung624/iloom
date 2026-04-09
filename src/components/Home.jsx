import React from 'react'
import BestSellerSection from './BestSellerSection'
import FooterAccordion from './FooterAccordion'
import Magazine from './Magazine'
import Sns from './Sns'
import Series from './Series'
import FurnitureList from './FurnitureList'
import Place from './Place'
import NewCollection from './NewCollection'




const Home = () => {
  return (
    <div className='main-video'>
      <img src="./images/mainImg.png" alt="" />
      <FurnitureList />
      <BestSellerSection />
      <NewCollection />
      <Place />
      <Series />
      <Sns />
      <Magazine />
      <FooterAccordion />
    </div>
  )
}

export default Home