import React from 'react'
import MyPageMenu from './MyPageMenu'

const Order = () => {
  return (
    <div className="mypage">
      <div className="inner">
        <MyPageMenu />
        <div className="content">
          <div className="page-title">
            <p>주문/배송</p>
          </div>
          <div className="order-content">
            content
          </div>
        </div>
      </div>
    </div>
  )
}

export default Order