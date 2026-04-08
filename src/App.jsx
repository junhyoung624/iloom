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

// 메인 페이지
function App() {
  const { onfetchItems, onMakeMenu } = useProductStore();

  useEffect(() => {
    onfetchItems();
    onMakeMenu();
  }, [onfetchItems, onMakeMenu])
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<Member />} />

        <Route path="/new-product" element={<NewProduct />} />
        <Route path="/best-seller" element={<BestSeller />} />
        <Route path="/magazine" element={<Magazine />} />
        <Route path="/series" element={<Series />} />
        <Route path="/store-info" element={<StoreInfo />} />
        <Route path="/event" element={<Event />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/company-info" element={<CompanyInfo />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
