import React from 'react';
import "./scss/order.scss";
import "./scss/orderForGuest.scss";
import { useProductStore } from '../store/useProductStore';



export default function OrderForGuest() {

    const { orderList } = useProductStore();
    return (
        <div className='order-for-guest-wrap'>

            <div className="inner">

                <div className="content">
                    <div className="page-title">
                        <p>비회원 주문/배송</p>
                    </div>
                    <div className="order-content">

                        {
                            orderList.map((order) => (
                                <div className="order-list-wrap">
                                    <p>비회원 주문</p>
                                    <div className="order-id-wrap">

                                        <p>주문번호 : {order.orderNumber}</p>
                                        <p>주문시간 : {order.date} / {order.hours} : {order.minutes} : {order.seconds}</p>
                                    </div>
                                    <ul className="order-list">

                                        <div className="order-item-info">
                                            {
                                                order.items?.map((item, id) => (
                                                    <li key={`order id - ${item.id}-${id}`}
                                                        className='order-item'
                                                        onClick={() => alert("주문 상세로 이동")}>

                                                        <div className="order-main-info">
                                                            <div className="order-date">
                                                                <p className='order-date-info'>{order.date}</p>
                                                                <p className='order-state'>주문 확인됨</p>
                                                                <p className='order-item-id'>품번 : {item.id}</p>
                                                            </div>
                                                            <div className="order-item-img">
                                                                <img src={item.productImages[0]} alt="." />
                                                            </div>
                                                            <div className="order-item-txt-info">
                                                                <p className='series'>{item.series}</p>
                                                                <p className="item-name">{item.name}</p>
                                                                <p className="item-price">{item.price}원</p>
                                                                <p className="item-color">[필수] 색상 : {item.color}</p>
                                                            </div>
                                                        </div>
                                                        <div className="order-sub-info">
                                                            <div className="left">
                                                                <img src="../images/logo-icon/icon-truck.png" alt="" />
                                                                <p>택배배송</p>
                                                            </div>
                                                            <div className="right">
                                                                <p>도착예정일 : {order.deliveryDate}</p>
                                                                <img src="../images/logo-icon/order-right-arrow.png" alt="."
                                                                    className='move-btn'
                                                                    onClick={() => alert("주문 상세로 이동")} />
                                                            </div>
                                                        </div>

                                                    </li>
                                                ))
                                            }
                                        </div>

                                    </ul>


                                </div>
                            ))
                        }

                    </div>
                </div>
            </div>
        </div>
    );
}
