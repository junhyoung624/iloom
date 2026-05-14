import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import SubPageEmptyState from '../components/SubPageEmptyState';
import { getOrderByNumber, getOrderByPhone, updateGuestOrderItemCancel } from '../firebase/orderService';
import { useProductStore } from '../store/useProductStore';
import { formatOrderDate, formatOrderTime, getAutoDeliveryStatus } from '../utils/calcOrderDate';
import './scss/order.scss';
import './scss/orderForGuest.scss';

const tabOptions = [
    { key: 'delivery', label: '주문배송' },
    { key: 'completed', label: '배송완료' },
    { key: 'cancel', label: '주문취소' },
];

const statusLabels = {
    payment: '결제완료',
    ready: '상품준비중',
    scheduled: '배송일정 확정',
    shipping: '배송/설치중',
    done: '배송완료',
};

const cancelLabels = {
    pending: '취소 접수',
    done: '취소 완료',
};

const cancelReasonOptions = [
    '배송 일정 변경',
    '상품을 다시 선택할 예정',
    '주문 정보 오입력',
    '단순 변심',
];

const normalizeText = (value) => String(value || '').trim();
const normalizePhone = (value) => normalizeText(value).replace(/-/g, '');
const getCancelStatus = (item) => item.cancelStatus || 'none';

const getOrderDateText = (order) => {
    return order?.date || formatOrderDate(order?.createdAt) || formatOrderDate(order?.orderedAt) || '';
};

const formatTime = (order) => {
    if (order?.hours !== undefined || order?.minutes !== undefined || order?.seconds !== undefined) {
        const hours = String(order.hours ?? 0).padStart(2, '0');
        const minutes = String(order.minutes ?? 0).padStart(2, '0');
        const seconds = String(order.seconds ?? 0).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    return formatOrderTime(order?.createdAt) || formatOrderTime(order?.orderedAt) || '00:00:00';
};

const formatPrice = (value) => {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return `${numberValue.toLocaleString('ko-KR')}원`;
    if (!value) return '0원';
    return String(value).includes('원') ? value : `${value}원`;
};

const normalizeOrder = (order) => {
    if (!order) return null;

    return {
        ...order,
        orderNumber: order.orderNumber || order.orderId,
        orderId: order.orderId || order.orderNumber,
        guestInfo: order.guestInfo || {
            name: order.name,
            phone: order.phone,
            email: order.email,
        },
        items: order.items || [],
    };
};

const isSameName = (order, name) => {
    if (!name) return true;
    return normalizeText(order.name) === normalizeText(name)
        || normalizeText(order.guestInfo?.name) === normalizeText(name);
};

const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
        const aTime = new Date(a.createdAt || a.orderedAt?.toDate?.() || a.orderedAt || 0).getTime();
        const bTime = new Date(b.createdAt || b.orderedAt?.toDate?.() || b.orderedAt || 0).getTime();
        return bTime - aTime;
    });
};

export default function OrderForGuest() {
    const navigate = useNavigate();
    const { orderList, onRequestCancelOrder } = useProductStore();
    const { orderNum, phone } = useParams();
    const [searchParams] = useSearchParams();
    const searchName = searchParams.get('name') || '';

    const [activeTab, setActiveTab] = useState('delivery');
    const [detailId, setDetailId] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState(cancelReasonOptions[0]);
    const [remoteOrders, setRemoteOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setCancelTarget();
        }
        document.addEventListener("keydown", handleEsc);
        return () => document.addEventListener("keydown", handleEsc);
    }, [setCancelTarget])
    const localOrders = useMemo(() => {
        const orders = orderList
            .map(normalizeOrder)
            .filter(Boolean)
            .filter((order) => {
                if (phone) {
                    const orderPhone = order.phone || order.guestInfo?.phone;
                    return normalizePhone(orderPhone) === normalizePhone(phone) && isSameName(order, searchName);
                }

                return [order.orderId, order.orderNumber].includes(orderNum);
            });

        return sortOrders(orders);
    }, [orderList, orderNum, phone, searchName]);

    useEffect(() => {
        let ignore = false;

        const fetchGuestOrders = async () => {
            setIsLoading(true);
            try {
                const result = phone
                    ? await getOrderByPhone(searchName, phone)
                    : await getOrderByNumber(orderNum);

                if (!ignore) {
                    setRemoteOrders(sortOrders(result.map((order) => normalizeOrder({
                        ...order,
                        firestoreDocId: order.id,
                    })).filter(Boolean)));
                }
            } catch (error) {
                if (!ignore) setRemoteOrders([]);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        };

        fetchGuestOrders();

        return () => {
            ignore = true;
        };
    }, [orderNum, phone, searchName]);

    const guestOrders = remoteOrders.length > 0 ? remoteOrders : localOrders;

    const orderRows = useMemo(() => {
        return guestOrders.flatMap((order) => {
            const orderStatus = getAutoDeliveryStatus(order);
            return (order.items || []).map((item, itemIndex) => ({
                order,
                orderStatus,
                item: {
                    ...item,
                    itemIndex,
                    cancelStatus: getCancelStatus(item),
                },
            }));
        });
    }, [guestOrders]);

    const visibleRows = useMemo(() => {
        if (activeTab === 'completed') {
            return orderRows.filter(({ item, orderStatus }) => item.cancelStatus === 'none' && orderStatus === 'done');
        }

        if (activeTab === 'cancel') {
            return orderRows.filter(({ item }) => item.cancelStatus !== 'none');
        }

        return orderRows.filter(({ item, orderStatus }) => item.cancelStatus === 'none' && orderStatus !== 'done');
    }, [activeTab, orderRows]);

    const tabCounts = useMemo(() => {
        return orderRows.reduce((counts, { item, orderStatus }) => {
            if (item.cancelStatus !== 'none') return { ...counts, cancel: counts.cancel + 1 };
            if (orderStatus === 'done') return { ...counts, completed: counts.completed + 1 };
            return { ...counts, delivery: counts.delivery + 1 };
        }, { delivery: 0, completed: 0, cancel: 0 });
    }, [orderRows]);

    const groupedVisibleRows = useMemo(() => {
        return guestOrders
            .map((order) => ({
                order,
                rows: visibleRows.filter(({ order: rowOrder }) => rowOrder.orderNumber === order.orderNumber),
            }))
            .filter(({ rows }) => rows.length > 0);
    }, [guestOrders, visibleRows]);

    const activeTabLabel = tabOptions.find((tab) => tab.key === activeTab)?.label || '주문배송';

    const openCancelRequest = (order, item) => {
        setCancelTarget({ order, item });
        setCancelReason(cancelReasonOptions[0]);
    };

    const updateRemoteOrderItems = (orderNumber, updatedItems) => {
        setRemoteOrders((orders) => orders.map((order) => (
            order.orderNumber === orderNumber ? normalizeOrder({ ...order, items: updatedItems }) : order
        )));
    };

    const submitCancelRequest = async () => {
        if (!cancelTarget) return;

        const { order, item: targetItem } = cancelTarget;
        const updatedItems = (order.items || []).map((item, index) => (
            index === targetItem.itemIndex
                ? {
                    ...item,
                    cancelStatus: 'pending',
                    cancelReason,
                    cancelRequestedAt: new Date().toISOString(),
                }
                : item
        ));

        await onRequestCancelOrder(order.orderNumber, targetItem.id, cancelReason);

        if (order.firestoreDocId) {
            await updateGuestOrderItemCancel(order.firestoreDocId, updatedItems);
            updateRemoteOrderItems(order.orderNumber, updatedItems);
        }

        setCancelTarget(null);
        setActiveTab('cancel');
        setDetailId(null);
        toast('주문 취소가 접수되었습니다.');
    };

    const renderDetailPanel = (order, orderStatus, item) => {
        const itemKey = `${order.orderNumber}-${item.id}-${item.itemIndex}`;
        if (detailId !== itemKey) return null;

        return (
            <div className="order-detail-panel">
                <div className="order-detail-grid">
                    <div>
                        <span>주문번호</span>
                        <strong>{order.orderNumber}</strong>
                    </div>
                    <div>
                        <span>주문일시</span>
                        <strong>{getOrderDateText(order)} {formatTime(order)}</strong>
                    </div>
                    <div>
                        <span>배송 예정일</span>
                        <strong>{formatOrderDate(order.deliveryDate) || '확인 중'}</strong>
                    </div>
                    <div>
                        <span>주문 금액</span>
                        <strong>{formatPrice(item.totalPrice || item.price)}</strong>
                    </div>
                    <div>
                        <span>진행 상태</span>
                        <strong>
                            {item.cancelStatus === 'none'
                                ? statusLabels[orderStatus] || '주문 확인중'
                                : cancelLabels[item.cancelStatus] || '취소 접수'}
                        </strong>
                    </div>
                    <div>
                        <span>주문자</span>
                        <strong>{order.guestInfo?.name || order.name || '비회원'}</strong>
                    </div>
                </div>

                {item.cancelReason && (
                    <p className="order-detail-notice">취소 사유: {item.cancelReason}</p>
                )}
            </div>
        );
    };

    const renderProductItem = ({ order, orderStatus, item }) => {
        const itemKey = `${order.orderNumber}-${item.id}-${item.itemIndex}`;
        const isDetailOpen = detailId === itemKey;
        const isCancelable = orderStatus === 'payment' && item.cancelStatus === 'none';
        const statusText = item.cancelStatus === 'none'
            ? statusLabels[orderStatus] || '주문 확인중'
            : cancelLabels[item.cancelStatus] || '취소 접수';
        const statusClass = item.cancelStatus === 'none' ? orderStatus : `cancel-${item.cancelStatus}`;

        return (
            <li key={itemKey} className="order-item">
                <div className="order-main-info">
                    <div className="order-date">
                        <p className={`order-state ${statusClass}`}>{statusText}</p>
                        <p className="order-item-id">상품번호: {item.id}</p>
                    </div>

                    <div className="order-item-img">
                        <img src={item.productImages?.[0]} alt={item.name || '주문 상품'} />
                    </div>

                    <div className="order-item-txt-info">
                        <p className="series">{item.series}</p>
                        <p className="item-name">{item.name}</p>
                        <p className="item-price">{formatPrice(item.price)}</p>
                        <p className="item-color">[필수] 색상: {item.color || '기본'}</p>
                    </div>
                </div>

                <div className="order-sub-info">
                    <div className="top">
                        <div className="left">
                            <img src="/images/logo-icon/icon-truck.png" alt="" />
                            <p>{item.deliveryType || '일룸 배송'}</p>
                        </div>

                        <div className="right">
                            <p>배송 예정일: {formatOrderDate(order.deliveryDate) || '확인 중'}</p>
                            <div className="btn-group">
                                <button
                                    type="button"
                                    className={`status-toggle-btn ${isDetailOpen ? 'active' : ''}`}
                                    onClick={() => setDetailId((prev) => (prev === itemKey ? null : itemKey))}
                                >
                                    {isDetailOpen ? '상세 닫기' : '상세보기'}
                                </button>

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

                    {renderDetailPanel(order, orderStatus, item)}
                </div>
            </li>
        );
    };

    const renderOrderCard = ({ order, rows }) => {
        return (
            <article className="order-card" key={order.orderNumber}>
                <div className="order-id-wrap">
                    <div className="order-header-left">
                        <span className="guest-badge">비회원 주문</span>

                        <div className="order-number-box">
                            <span className="label">주문번호</span>
                            <strong>{order.orderNumber}</strong>
                        </div>
                    </div>

                    <div className="order-header-right">
                        <span className="label">주문시간</span>
                        <p>
                            {getOrderDateText(order)}
                            <span className="time">{formatTime(order)}</span>
                        </p>
                    </div>
                </div>

                <ul className="order-list">
                    {rows.map(renderProductItem)}
                </ul>
            </article>
        );
    };

    const getEmptyContent = () => {
        if (activeTab === 'completed') {
            return {
                title: '배송완료된 상품이 없습니다.',
                description: '배송이 완료되면 이곳에서 확인할 수 있습니다.',
            };
        }

        if (activeTab === 'cancel') {
            return {
                title: '주문취소 내역이 없습니다.',
                description: '취소가 접수된 상품이 있으면 이곳에서 확인할 수 있습니다.',
            };
        }

        return {
            title: '진행 중인 주문배송 상품이 없습니다.',
            description: '배송이 완료된 상품은 배송완료 탭에서 확인해 주세요.',
        };
    };

    const emptyContent = getEmptyContent();

    return (
        <div className="order-for-guest-wrap">
            <div className="inner">
                <div className="content">
                    <div className="page-title">
                        <p>비회원 주문/배송</p>
                    </div>

                    <div className="order-content">
                        {isLoading ? (
                            <SubPageEmptyState
                                title="주문 정보를 확인하고 있습니다."
                                description="잠시만 기다려 주세요."
                                imageSrc="/images/logo-icon/order-none.svg"
                            />
                        ) : guestOrders.length === 0 ? (
                            <SubPageEmptyState
                                title="해당 주문을 찾을 수 없습니다."
                                description="로그인 페이지에서 이름과 주문번호 또는 휴대폰번호로 다시 조회해 주세요."
                                actionLabel="비회원 주문조회"
                                imageSrc="/images/logo-icon/order-none.svg"
                                onAction={() => navigate('/login')}
                            />
                        ) : (
                            <>
                                <div className="order-filter-bar order-for-guest-tabs">
                                    <div className="order-filter-group">
                                        <span className="order-filter-label">주문 구분</span>
                                        <div className="order-tab-list" role="tablist" aria-label="비회원 주문배송 메뉴">
                                            {tabOptions.map((tab) => (
                                                <button
                                                    type="button"
                                                    key={tab.key}
                                                    className={activeTab === tab.key ? 'active' : ''}
                                                    onClick={() => {
                                                        setActiveTab(tab.key);
                                                        setDetailId(null);
                                                    }}
                                                >
                                                    {tab.label}
                                                    <span className="guest-tab-count">{tabCounts[tab.key]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="order-summary">
                                    <div className="order-summary__title">
                                        <strong>{activeTabLabel}</strong>
                                        <span>{visibleRows.length}개 상품</span>
                                    </div>
                                </div>

                                {visibleRows.length === 0 ? (
                                    <SubPageEmptyState
                                        title={emptyContent.title}
                                        description={emptyContent.description}
                                        actionLabel="쇼핑하러 가기"
                                        imageSrc="/images/logo-icon/order-none.svg"
                                        onAction={() => navigate('/')}
                                    />
                                ) : (
                                    <div className="order-list-wrap">
                                        <section className="order-status-section">
                                            <div className="order-status-section__head">
                                                <h3>{activeTabLabel}</h3>
                                                <span>{groupedVisibleRows.length}건 주문 / {visibleRows.length}개 상품</span>
                                            </div>

                                            {groupedVisibleRows.map(renderOrderCard)}
                                        </section>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {cancelTarget && (
                <div className="order-modal-backdrop" onClick={() => setCancelTarget(null)}>
                    <div className="order-action-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>주문 취소 요청</h3>
                        <p>취소 사유를 선택하면 주문 취소가 접수됩니다.</p>
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
}
