import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProductStore } from '../store/useProductStore';
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
  { key: "pending", label: "취소 접수" },
  { key: "done", label: "취소 완료" },
];

const cancelReasonOptions = [
  "배송 일정 변경",
  "상품을 다시 선택할 예정",
  "주문 정보 오입력",
  "단순 변심",
];

const statusAliases = {
  before: "payment",
  "결제완료": "payment",
  "결제 완료": "payment",
  "상품준비중": "ready",
  "상품 준비중": "ready",
  "배송일확정": "scheduled",
  "배송일 확정": "scheduled",
  "배송중": "shipping",
  "배송 중": "shipping",
  "배송/설치중": "shipping",
  "배송완료": "done",
  "배송 완료": "done",
  "설치완료": "done",
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
  if (status === "pending") return "취소 접수";
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

const formatPrice = (value) => {
  if (typeof value === "number") return `${value.toLocaleString()}원`;
  if (!value) return "0원";
  return String(value).includes("원") ? value : `${value}원`;
};

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
};

const Order = () => {
  const navigate = useNavigate();
  const {
    orderList,
    onRequestCancelOrder,
    onRequestDeliveryDateChange,
  } = useProductStore();
  const [activeTab, setActiveTab] = useState("delivery");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [dateChangeTarget, setDateChangeTarget] = useState(null);
  const [requestedDate, setRequestedDate] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState(cancelReasonOptions[0]);

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

  const visibleCount = periodOrders.reduce((count, order) => {
    const itemCount = order.items.filter((item) =>
      activeTab === "delivery"
        ? item.cancelStatus === "none"
        : item.cancelStatus !== "none"
    ).length;

    return count + itemCount;
  }, 0);

  const getVisibleItems = (order, sectionKey) => {
    return order.items.filter((item) => {
      if (activeTab === "delivery") {
        return order.orderStatus === sectionKey && item.cancelStatus === "none";
      }

      return item.cancelStatus === sectionKey;
    });
  };

  const handleToggleStatus = (id) => {
    setOpenStatusId((prev) => (prev === id ? null : id));
  };

  const openDateChange = (order) => {
    setDateChangeTarget(order);
    setRequestedDate("");
  };

  const submitDateChange = async () => {
    if (!dateChangeTarget || !requestedDate) {
      toast("변경을 원하는 배송일을 선택해주세요.");
      return;
    }

    await onRequestDeliveryDateChange(dateChangeTarget.orderNumber, requestedDate);
    setDateChangeTarget(null);
    toast("배송일 변경 요청이 접수되었습니다.");
  };

  const openCancelRequest = (order, item) => {
    setCancelTarget({ order, item });
    setCancelReason(cancelReasonOptions[0]);
  };

  const submitCancelRequest = async () => {
    if (!cancelTarget) return;

    await onRequestCancelOrder(
      cancelTarget.order.orderNumber,
      cancelTarget.item.id,
      cancelReason
    );
    setCancelTarget(null);
    setActiveTab("cancel");
    setOpenStatusId(null);
    toast("주문 취소가 접수되었습니다.");
  };

  const renderDetailPanel = (order, item) => {
    const detailKey = `${order.orderNumber}-${item.id}-${item.itemIndex}`;
    if (detailId !== detailKey) return null;

    return (
      <div className="order-detail-panel">
        <div className="order-detail-grid">
          <div>
            <span>주문번호</span>
            <strong>{order.orderNumber}</strong>
          </div>
          <div>
            <span>주문일시</span>
            <strong>{order.date} {order.orderTimeText}</strong>
          </div>
          <div>
            <span>배송 예정일</span>
            <strong>{order.deliveryDate || "확인 중"}</strong>
          </div>
          <div>
            <span>주문 금액</span>
            <strong>{formatPrice(order.price || order.total || item.price)}</strong>
          </div>
          <div>
            <span>배송 상태</span>
            <strong>{getStatusLabel(order.orderStatus)}</strong>
          </div>
          <div>
            <span>취소/반품</span>
            <strong>{item.cancelStatus === "none" ? "요청 가능 여부 확인" : getCancelLabel(item.cancelStatus)}</strong>
          </div>
        </div>

        {order.requestedDeliveryDate && (
          <p className="order-detail-notice">
            배송일 변경 요청일: {order.requestedDeliveryDate}
          </p>
        )}

        {item.cancelReason && (
          <p className="order-detail-notice">
            취소 사유: {item.cancelReason}
          </p>
        )}
      </div>
    );
  };

  const renderProductItem = (order, item) => {
    const itemKey = `${order.orderNumber}-${item.id}-${item.itemIndex}`;
    const statusToggleId = `${itemKey}-status`;
    const isStatusOpen = openStatusId === statusToggleId;
    const isDetailOpen = detailId === itemKey;
    const isCancelable = order.orderStatus === "payment" && item.cancelStatus === "none";
    const canRequestDateChange = ["payment", "ready", "scheduled"].includes(order.orderStatus)
      && item.cancelStatus === "none";

    return (
      <li key={itemKey} className="order-item">
        <div className="order-main-info">
          <div className="order-date">
            <p className={`order-state ${item.cancelStatus !== "none" ? `cancel-${item.cancelStatus}` : order.orderStatus}`}>
              {item.cancelStatus !== "none"
                ? getCancelLabel(item.cancelStatus)
                : getStatusLabel(order.orderStatus)}
            </p>
            <p className="order-item-id">상품번호: {item.id}</p>
          </div>

          <div className="order-item-img">
            <img src={item.productImages?.[0]} alt={item.name || "주문 상품"} />
          </div>

          <div className="order-item-txt-info">
            <p className="series">{item.series}</p>
            <p className="item-name">{item.name}</p>
            <p className="item-price">{formatPrice(item.price)}</p>
            <p className="item-color">[필수] 색상: {item.color || "기본"}</p>
          </div>
        </div>

        <div className="order-sub-info">
          <div className="top">
            <div className="left">
              <img src="/images/logo-icon/icon-truck.png" alt="" />
              <p>{item.deliveryType || "일룸 배송"}</p>
            </div>

            <div className="right">
              <p>
                배송 예정일: {order.deliveryDate || "확인 중"}
                {order.deliveryChangeStatus === "requested" && (
                  <span className="request-badge">변경 요청중</span>
                )}
              </p>
              <div className="btn-group">
                {item.cancelStatus === "none" && (
                  <button
                    type="button"
                    className={`status-toggle-btn ${isStatusOpen ? "active" : ""}`}
                    onClick={() => handleToggleStatus(statusToggleId)}
                  >
                    {isStatusOpen ? "배송상태 닫기" : "배송조회"}
                  </button>
                )}

                <button
                  type="button"
                  className={`status-toggle-btn ${isDetailOpen ? "active" : ""}`}
                  onClick={() => setDetailId((prev) => (prev === itemKey ? null : itemKey))}
                >
                  {isDetailOpen ? "상세 닫기" : "상세보기"}
                </button>

                {canRequestDateChange && (
                  <button
                    type="button"
                    className="order-cancel-btn"
                    onClick={() => openDateChange(order)}
                  >
                    배송일 변경
                  </button>
                )}

                {isCancelable && (
                  <button
                    type="button"
                    className="order-cancel-btn"
                    onClick={() => openCancelRequest(order, item)}
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

          {renderDetailPanel(order, item)}
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
          description="마음에 드는 상품을 담고 주문을 시작해보세요."
          actionLabel="쇼핑하러 가기"
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
              description="조회 기간을 변경하거나 쇼핑을 계속해보세요."
              actionLabel="쇼핑하러 가기"
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

      {dateChangeTarget && (
        <div className="order-modal-backdrop" onClick={() => setDateChangeTarget(null)}>
          <div className="order-action-modal" onClick={(e) => e.stopPropagation()}>
            <h3>배송일 변경 요청</h3>
            <p>배송 예정일 3일 전까지 변경 요청이 가능합니다.</p>
            <label htmlFor="requestedDeliveryDate">변경 희망일</label>
            <input
              id="requestedDeliveryDate"
              type="date"
              min={getTodayInputValue()}
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
            />
            <div className="order-action-modal__actions">
              <button type="button" onClick={() => setDateChangeTarget(null)}>닫기</button>
              <button type="button" className="primary" onClick={submitDateChange}>요청하기</button>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="order-modal-backdrop" onClick={() => setCancelTarget(null)}>
          <div className="order-action-modal" onClick={(e) => e.stopPropagation()}>
            <h3>주문 취소 요청</h3>
            <p>취소 사유를 선택하면 고객센터 확인 후 처리됩니다.</p>
            <div className="cancel-reason-list">
              {cancelReasonOptions.map((reason) => (
                <label key={reason}>
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                  />
                  {reason}
                </label>
              ))}
            </div>
            <div className="order-action-modal__actions">
              <button type="button" onClick={() => setCancelTarget(null)}>닫기</button>
              <button type="button" className="primary" onClick={submitCancelRequest}>취소 접수</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
