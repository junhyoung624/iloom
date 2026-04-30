import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore'
import { deliverySteps } from '../data/deliverySteps';
import DeliveryStatusBar from './OrderComponents/DeliveryStatusBar';
import SubPageEmptyState from '../components/SubPageEmptyState';
import "./scss/order.scss";

const periodOptions = [
  { label: "1개월", value: 1 },
  { label: "3개월", value: 3 },
  { label: "6개월", value: 6 },
  { label: "전체", value: "all" },
];

const cancelSections = [
  { key: "pending", label: "취소 대기중" },
  { key: "done", label: "취소 완료" },
];

const statusAliases = {
  before: "payment",
  "결제완료": "payment",
  "결제 완료": "payment",
  "배송 전": "payment",
  "상품준비중": "ready",
  "상품 준비 중": "ready",
  "배송중": "shipping",
  "배송 중": "shipping",
  "배송완료": "done",
  "배송 완료": "done",
};

const getOrderStatus = (order) => {
  const status = order.orderStatus || order.state || "payment";
  return statusAliases[status] || status;
};

const getStepIndex = (status) => {
  const index = deliverySteps.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
};

const getStatusLabel = (status) => {
  return deliverySteps[getStepIndex(status)].label;
};

const getCancelLabel = (status) => {
  if (status === "pending") return "취소 대기중";
  if (status === "done") return "취소 완료";
  return "";
};

const parseOrderDate = (order) => {
  if (order.createdAt) {
    const createdAtDate = new Date(order.createdAt);
    if (!Number.isNaN(createdAtDate.getTime())) return createdAtDate;
  }

  if (order.date) {
    const normalizedDate = String(order.date)
      .replace(/\s/g, "")
      .replace(/\.$/, "")
      .replace(/\./g, "-")
      .replace(/\//g, "-");
    const date = new Date(normalizedDate);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return new Date(0);
};

const isWithinPeriod = (date, period) => {
  if (period === "all") return true;

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - period);
  startDate.setHours(0, 0, 0, 0);

  return date >= startDate;
};

const formatTime = (order) => {
  const hours = String(order.hours ?? 0).padStart(2, "0");
  const minutes = String(order.minutes ?? 0).padStart(2, "0");
  const seconds = String(order.seconds ?? 0).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const Order = () => {
  const navigate = useNavigate();
  const { orderList, onRequestCancelOrder } = useProductStore();
  const [activeTab, setActiveTab] = useState("delivery");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [openStatusId, setOpenStatusId] = useState(null);

  const ordersWithMeta = useMemo(() => {
    return orderList.map((order) => {
      const orderDate = parseOrderDate(order);
      const orderStatus = getOrderStatus(order);

      return {
        ...order,
        orderDate,
        orderStatus,
        orderTimeText: formatTime(order),
        items: (order.items || []).map((item, index) => ({
          ...item,
          itemIndex: index,
          cancelStatus: item.cancelStatus || "none",
        })),
      };
    });
  }, [orderList]);

  const periodOrders = useMemo(() => {
    return ordersWithMeta.filter((order) => isWithinPeriod(order.orderDate, selectedPeriod));
  }, [ordersWithMeta, selectedPeriod]);

  const getVisibleItems = (order, sectionKey) => {
    return order.items.filter((item) => {
      if (activeTab === "delivery") {
        return order.orderStatus === sectionKey && item.cancelStatus === "none";
      }

      return item.cancelStatus === sectionKey;
    });
  };

  const visibleCount = periodOrders.reduce((count, order) => {
    const itemCount = order.items.filter((item) =>
      activeTab === "delivery"
        ? item.cancelStatus === "none"
        : item.cancelStatus !== "none"
    ).length;

    return count + itemCount;
  }, 0);

  const handleToggleStatus = (id) => {
    setOpenStatusId((prev) => (prev === id ? null : id));
  };

  const handleCancelOrder = async (orderNumber, itemId) => {
    const confirmCancel = window.confirm("주문 취소를 요청하시겠습니까?");
    if (!confirmCancel) return;

    await onRequestCancelOrder(orderNumber, itemId);
    setActiveTab("cancel");
    setOpenStatusId(null);
    alert("주문 취소가 접수되었습니다.");
  };

  const renderProductItem = (order, item) => {
    const statusToggleId = `${order.orderNumber}-${item.id}-${item.itemIndex}`;
    const isStatusOpen = openStatusId === statusToggleId;
    const isCancelable = order.orderStatus === "payment" && item.cancelStatus === "none";

    return (
      <li
        key={statusToggleId}
        className="order-item"
        onClick={() => alert("주문 상세로 이동")}
      >
        <div className="order-main-info">
          <div className="order-date">
            <p className={`order-state ${item.cancelStatus !== "none" ? `cancel-${item.cancelStatus}` : order.orderStatus}`}>
              {item.cancelStatus !== "none"
                ? getCancelLabel(item.cancelStatus)
                : getStatusLabel(order.orderStatus)}
            </p>
            <p className="order-item-id">품번 : {item.id}</p>
          </div>

          <div className="order-item-img">
            <img src={item.productImages?.[0]} alt={item.name} />
          </div>

          <div className="order-item-txt-info">
            <p className="series">{item.series}</p>
            <p className="item-name">{item.name}</p>
            <p className="item-price">{item.price}원</p>
            <p className="item-color">[필수] 색상 : {item.color || "기본"}</p>
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
                {item.cancelStatus === "none" && (
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

                {isCancelable && (
                  <button
                    type="button"
                    className="order-cancel-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelOrder(order.orderNumber, item.id);
                    }}
                  >
                    주문취소
                  </button>
                )}
              </div>
            </div>
          </div>

          {isStatusOpen && item.cancelStatus === "none" && (
            <div className="status">
              <p className="txt-area">배송 상태</p>
              <div className="show-status-area">
                <DeliveryStatusBar status={order.orderStatus} />
              </div>
            </div>
          )}
        </div>
      </li>
    );
  };

  const renderOrderCard = (order, items) => {
    return (
      <article className="order-card" key={`${order.orderNumber}-${activeTab}`}>
        <div className="order-id-wrap">
          <div className="order-header-left">
            {order.isGuest && <span className="guest-badge">비회원 주문</span>}

            <div className="order-number-box">
              <span className="label">주문번호</span>
              <strong>{order.orderNumber}</strong>
            </div>
          </div>

          <div className="order-header-right">
            <span className="label">주문시간</span>
            <p>
              {order.date}
              <span className="time">{order.orderTimeText}</span>
            </p>
          </div>
        </div>

        <ul className="order-list">
          {items.map((item) => renderProductItem(order, item))}
        </ul>
      </article>
    );
  };

  const renderSection = (section) => {
    const sectionOrders = periodOrders
      .map((order) => ({
        order,
        items: getVisibleItems(order, section.key),
      }))
      .filter(({ items }) => items.length > 0);

    if (sectionOrders.length === 0) return null;

    const sectionItemCount = sectionOrders.reduce((count, { items }) => count + items.length, 0);

    return (
      <section className="order-status-section" key={section.key}>
        <div className="order-status-section__head">
          <h3>{section.label}</h3>
          <span>{sectionOrders.length}건 주문 / {sectionItemCount}개 상품</span>
        </div>
        {sectionOrders.map(({ order, items }) => renderOrderCard(order, items))}
      </section>
    );
  };

  return (
    <div className="order-content">
      {orderList.length === 0 ? (
        <SubPageEmptyState
          title="주문내역이 없습니다."
          actionLabel="쇼핑하기"
          imageSrc="/images/logo-icon/order-none.svg"
          onAction={() => navigate("/")}
        />
      ) : (
        <>
          <div className="order-filter-bar">
            <div className="order-filter-group">
              <span className="order-filter-label">주문 구분</span>
              <div className="order-tab-list" role="tablist" aria-label="주문배송 메뉴">
                <button
                  type="button"
                  className={activeTab === "delivery" ? "active" : ""}
                  onClick={() => setActiveTab("delivery")}
                >
                  주문배송
                </button>
                <button
                  type="button"
                  className={activeTab === "cancel" ? "active" : ""}
                  onClick={() => setActiveTab("cancel")}
                >
                  취소/반품 내역
                </button>
              </div>
            </div>

            <div className="order-filter-group">
              <span className="order-filter-label">조회 기간</span>
              <div className="order-period-list" aria-label="조회 기간">
                {periodOptions.map((option) => (
                  <button
                    type="button"
                    key={option.label}
                    className={selectedPeriod === option.value ? "active" : ""}
                    onClick={() => setSelectedPeriod(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="order-summary">
            <strong>{activeTab === "delivery" ? "주문배송" : "취소/반품 내역"}</strong>
            <span>{visibleCount}개 상품</span>
          </div>

          {visibleCount === 0 ? (
            <SubPageEmptyState
              title="조회된 주문내역이 없습니다."
              actionLabel="쇼핑하기"
              imageSrc="/images/logo-icon/order-none.svg"
              onAction={() => navigate("/")}
            />
          ) : (
            <div className="order-list-wrap">
              {activeTab === "delivery"
                ? deliverySteps.map(renderSection)
                : cancelSections.map(renderSection)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Order
