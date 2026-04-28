import { useEffect, useState } from 'react'
import './App.css'
import './App.scss'
import Header from './components/Header'

import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoadingScreen from './components/LoadingScreen'
import Home from './components/Home'
import Login from './components/Login'
import Member from './components/Member'
import { useProductStore } from './store/useProductStore'
import Magazine from './pages/Magazine'
import Series from './pages/Series'
import StoreInfo from './pages/StoreInfo'
import Event from './pages/Event'
import Notice from './pages/Notice'
import CompanyInfo from './pages/CompanyInfo'
import Footer from './components/Footer'
import ContentDetailPage from './pages/ContentDetailPage'
import ScrollTop from './components/ScrollTop'
import Cart from './pages/Cart'
import CompanyPage from './pages/CompanyPage'
import QuickMenu from './components/QuickMenu'
import Order from './pages/Order'
import MyPage from './pages/MyPage'
import { useAuthStore } from './store/useAuthStore'
import LeavePage from './pages/LeavePage'
import Search from './components/Search'
import OAuth from './pages/OAuth'
import SubPage from './pages/SubPage'
import SearchPage from './pages/SearchPage'
import NaverCallback from './pages/NaverCallback'
import ProductDetail from './pages/ProductDetail'
import WishList from './pages/WishList'
import SeriesDetail from './pages/SerierDetail'
import NewBestPage from './pages/NewBestPage'
import Charge from './pages/Charge'
import FurniturePage from './components/FurniturePage'
import { addTestOrder } from './firebase/orderService'
import OrderForGuest from './pages/OrderForGuest'
import DockTab from './components/DockTab'
import StickyBanner from './components/StickyBanner'
import InquiryPage from './pages/InquiryPage'
import { useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const { onfetchItems, onMakeMenu, fetchWishlist, clearWishlist } = useProductStore() // ← fetchWishlist, clearWishlist 추가
  const { initAuth, user } = useAuthStore()
  const location = useLocation()
  const [bannerVisible, setBannerVisible] = useState(true)
  useEffect(() => {
    onfetchItems()
    onMakeMenu()
    initAuth()
  }, [])

  useEffect(() => {
    addTestOrder()
  }, [])

  // ← 추가
  useEffect(() => {
    if (user) {
      fetchWishlist(user)
    } else {
      clearWishlist()
    }
  }, [user])

  const handleFinish = () => {
    setIsLoading(false)
    window.__appLoaded = true
  }

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--banner-height',
      bannerVisible ? '40px' : '0px'
    )
  }, [bannerVisible])

  return (
    <>
      {isLoading && <LoadingScreen onFinish={handleFinish} />}

      <ScrollTop />
      <StickyBanner onClose={() => setBannerVisible(false)} />
      <Header />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/member" element={<PageTransition><Member /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
          <Route path="/charge" element={<PageTransition><Charge /></PageTransition>} />
          <Route path="/order" element={<PageTransition><Order /></PageTransition>} />
          <Route path="/orderForGuest/:orderNum" element={<PageTransition><OrderForGuest /></PageTransition>} />
          <Route path="/searchpage" element={<PageTransition><SearchPage /></PageTransition>} />

          <Route path="/oauth" element={<PageTransition><OAuth /></PageTransition>} />

          <Route path="/magazine" element={<PageTransition><Magazine /></PageTransition>} />
          <Route path="/magazine/:id" element={<PageTransition><ContentDetailPage /></PageTransition>} />
          <Route path="/series" element={<PageTransition><Series /></PageTransition>} />
          <Route path="/series/:slug" element={<PageTransition><SeriesDetail /></PageTransition>} />
          <Route path="/store-info" element={<PageTransition><StoreInfo /></PageTransition>} />
          <Route path="/event" element={<PageTransition><Event /></PageTransition>} />
          <Route path="/notice" element={<PageTransition><Notice /></PageTransition>} />
          <Route path="/company-info" element={<PageTransition><CompanyInfo /></PageTransition>} />
          <Route path="/companypage" element={<PageTransition><CompanyPage /></PageTransition>} />
          <Route path="/mypage" element={<PageTransition><MyPage /></PageTransition>} />
          <Route path="/inquiry" element={<PageTransition><InquiryPage /></PageTransition>} />
          <Route path="/leavepage" element={<PageTransition><LeavePage /></PageTransition>} />
          <Route path="/naver-callback" element={<PageTransition><NaverCallback /></PageTransition>} />
          <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="/wishlist" element={<PageTransition><WishList /></PageTransition>} />

          <Route path="/furniturepage" element={<PageTransition><FurniturePage /></PageTransition>} />
          <Route path="/new" element={<PageTransition><NewBestPage /></PageTransition>} />
          <Route path="/BestSeller" element={<PageTransition><NewBestPage /></PageTransition>} />

          <Route path="/:originalCategory" element={<PageTransition><SubPage /></PageTransition>} />
          <Route path="/:originalCategory/:category2" element={<PageTransition><SubPage /></PageTransition>} />
          <Route path="/:originalCategory/:category2/:category3" element={<PageTransition><SubPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <QuickMenu />
      <DockTab />
      <Footer />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 1800,
          style: {
            borderRadius: '999px',
            background: '#111',
            color: '#fff',
            padding: '12px 18px',
            fontSize: '14px',
            fontWeight: 600,
          },
        }}
      />
    </>
  )
}

export default App