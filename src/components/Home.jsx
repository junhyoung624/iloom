import React from 'react'
import BestSellerSection from './BestSellerSection'
import FooterAccordion from './FooterAccordion'
import Magazine from './Magazine'
import Sns from './Sns'
import Series from './Series'




const Home = () => {
  return (
    <div className='main-video'>
      <img src="./images/mainImg.png" alt="" />
      <img src="./images/ex-iloom.png" alt="" />
      <BestSellerSection />
      <Series />
      <Sns />
      <Magazine />
      <FooterAccordion />
    </div>
  )
}

export default Home