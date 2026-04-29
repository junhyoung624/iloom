import React, { useState } from 'react'
import MyPageMenu from './MyPageMenu'
import { useProductStore } from '../store/useProductStore'
import "./scss/order.scss";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deliverySteps } from '../data/deliverySteps';
import DeliveryStatusBar from './OrderComponents/DeliveryStatusBar';



const getStepIndex = (status) => {
  const index = deliverySteps.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
};

const Order = () => {
  //const { cartItems, items } = useProductStore();
  const navigate = useNavigate();
  const { orderList, onRequestCancelOrder } = useProductStore();

  //주문상태 토글
  const [openStatusId, setOpenStatusId] = useState(null);

  const handleToggleStatus = (id) => {
    setOpenStatusId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mypage">
      <div className="inner">
        <MyPageMenu />
        <div className="content">
          <div className="page-title">
            <p>주문/배송</p>
          </div>
          <div className="order-content">
            {orderList.length === 0 ? (
              <div className="empty-content-wrap">
                <div className='show-empty-info'>주문/배송 내역이 없습니다</div>
                <div className="show-more-btn" onClick={() => navigate("/")}>더 알아보기</div>
              </div>
            ) : (

              orderList.map((order) => (
                <div className="order-list-wrap">
                  <div className="order-id-wrap">
                    <div className="order-header-left">
                      {order.isGuest && (
                        <span className="guest-badge">비회원 주문</span>
                      )}

                      <div className="order-number-box">
                        <span className="label">주문번호</span>
                        <strong>{order.orderNumber}</strong>
                      </div>
                    </div>

                    <div className="order-header-right">
                      <span className="label">주문시간</span>
                      <p>
                        {order.date}
                        <span className="time">
                          {order.hours}:{order.minutes}:{order.seconds}
                        </span>
                      </p>
                    </div>
                  </div>
                  <ul className="order-list">

                    <div className="order-item-info">
                      {
                        order.items?.map((item, id) => {
                          const statusToggleId = `${order.orderNumber}-${item.id}-${id}`;
                          const isStatusOpen = openStatusId === statusToggleId;

                          return (
                            <li key={`order id - ${item.id}-${id}`}
                              className='order-item'
                              onClick={() => toast("주문 상세로 이동")}>

                              <div className="order-main-info">
                                <div className="order-date">
                                  <p className='order-date-info'>{order.date}</p>
                                  {/* <p className='order-state'>주문 확인됨</p> */}
                                  <p
                                    className={`order-state ${order.cancelStatus === "pending"
                                      ? "cancel-pending"
                                      : order.orderStatus || "before"
                                      }`}
                                  >
                                    {item.cancelStatus === "pending"
                                      ? "취소 대기중"
                                      : deliverySteps[getStepIndex(order.orderStatus || "before")].label}
                                  </p>
                                  <p className='order-item-id'>품번 : {item.id}</p>
                                </div>
                                <div className="order-item-img">
                                  <img src={item.productImages?.[0]} alt="." />
                                </div>
                                <div className="order-item-txt-info">
                                  <p className='series'>{item.series}</p>
                                  <p className="item-name">{item.name}</p>
                                  <p className="item-price">{item.price}원</p>
                                  <p className="item-color">[필수] 색상 : {item.color}</p>
                                </div>
                              </div>
                              <div className="order-sub-info">
                                <div className="top">
                                  <div className="left">
                                    <img src="./images/logo-icon/icon-truck.png" alt="" />
                                    <p>택배배송</p>
                                  </div>
                                  <div className="right">
                                    <p>도착예정일 : {order.deliveryDate}</p>
                                    <div className="btn-group">
                                      {item.cancelStatus !== "pending" && (
                                        <button
                                          type="button"
                                          className={`status-toggle-btn ${isStatusOpen ? "active" : ""}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleStatus(statusToggleId);
                                          }}
                                        >
                                          {isStatusOpen ? "접기" : "배송조회"}
                                        </button>
                                      )}

                                      {(order.orderStatus || "before") === "before" &&
                                        item.cancelStatus !== "pending" && (
                                          <button
                                            type="button"
                                            className="order-cancel-btn"
                                            onClick={(e) => {
                                              e.stopPropagation();

                                              const confirmCancel = window.confirm("주문 취소를 요청하시겠습니까?");
                                              if (!confirmCancel) return;

                                              onRequestCancelOrder(order.orderNumber, item.id);
                                              toast("주문 취소가 접수되었습니다.");
                                            }}
                                          >
                                            주문취소
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                {isStatusOpen && item.cancelStatus !== "pending" && (
                                  <div className="status">
                                    <p className='txt-area'>배송 상태</p>
                                    <div className="show-status-area">
                                      <DeliveryStatusBar status={order.orderStatus || "before"} />
                                    </div>
                                  </div>
                                )}
                                {/* {(order.orderStatus || "before") === "before" && order.cancelStatus !== "pending" && (
                                  <button
                                    type="button"
                                    className="order-cancel-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      const confirmCancel = window.confirm("주문 취소를 요청하시겠습니까?");
                                      if (!confirmCancel) return;

                                      onRequestCancelOrder(order.orderNumber);
                                      toast("주문 취소가 접수되었습니다.");
                                    }}
                                  >
                                    주문 취소
                                  </button>
                                )} */}

                              </div>

                            </li>
                          )
                        })
                      }
                    </div>

                  </ul>


                </div>
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Order