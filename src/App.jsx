import { useState } from 'react'
import './App.css'
import './App.scss'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import Member from './components/Member'

// 메인 페이지
function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/member" element={<Member />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
