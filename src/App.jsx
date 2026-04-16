import { useEffect, useState } from 'react'
import './App.css'
import './App.scss'
import Header from './components/Header'

import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import Member from './components/Member'
import { useProductStore } from './store/useProductStore'
import NewProduct from './pages/NewProduct'
import BestSeller from './pages/BestSeller'
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
import ProductList from './components/ProductList'
import Search from './components/Search'
import OAuth from './pages/OAuth'
import SubPage from './pages/SubPage'
import SearchPage from './pages/SearchPage'
import NaverCallback from './pages/NaverCallback'
import ProductDetail from './pages/ProductDetail'
import WishList from './pages/WishList'

// 메인 페이지
function App() {
  const { onfetchItems, onMakeMenu } = useProductStore();
  const { initAuth } = useAuthStore()

  useEffect(() => {
    onfetchItems();
    onMakeMenu();
    initAuth()
  }, [])
  return (
    <>
      <ScrollTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/search' element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<Member />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/searchpage" element={<SearchPage />} />
        {/* <Route path='/product-list' element={<ProductList />} /> */}


        <Route path="/oauth" element={<OAuth />} />

        <Route path="/new-product" element={<NewProduct />} />
        <Route path="/best-seller" element={<BestSeller />} />
        <Route path="/magazine" element={<Magazine />} />
        <Route path="/magazine/:id" element={<ContentDetailPage />} />
        <Route path="/series" element={<Series />} />
        <Route path="/store-info" element={<StoreInfo />} />
        <Route path="/event" element={<Event />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/company-info" element={<CompanyInfo />} />
        <Route path='/companypage' element={<CompanyPage />} />
        <Route path='/mypage' element={<MyPage />} />
        <Route path='/leavepage' element={<LeavePage />} />
        <Route path='/naver-callback' element={<NaverCallback />} />
        <Route path='/product/:id' element={<ProductDetail />} />
        <Route path='/wishlist' element={<WishList />} />

        <Route path='/:originalCategory' element={<SubPage />} />
        <Route path='/:originalCategory/:category2' element={<SubPage />} />
        <Route path='/:originalCategory/:category2/:category3' element={<SubPage />} />
      </Routes>
      <QuickMenu />
      <Footer />
    </>
  )
}

export default App
