import React, { useMemo, useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import "./scss/charge.scss"
import { Link, useNavigate } from 'react-router-dom'
import ChargeModal from './ChargeModal'
import { useKakaoPostcodePopup } from 'react-daum-postcode'
import { createOrder } from '../firebase/orderService'

export default function Charge() {
    const { cartItems, items, onAddOrder } = useProductStore()
    const { user } = useAuthStore()
    const [paymentMethod, setPaymentMethod] = useState('card')
    const navigate = useNavigate();
    const [guestName, setGuestName] = useState('')
    const [guestPhone, setGuestPhone] = useState('')

    //비회원 우편번호 찾기 컴포넌트 관리
    const [address, setAddress] = useState(''); //주소
    const [extraAddress, setExtraAddress] = useState('')//상세주소
    const [zipCode, setZipCode] = useState(''); //우편번호
    //const [isOpen, setIsOpen] = useState(false); //팝업 오픈 상태

    const SCRIPT_URL =
        "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    const open = useKakaoPostcodePopup(SCRIPT_URL);

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }

            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }

            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        setZipCode(data.zonecode); //5자리 우편번호
        setAddress(fullAddress); //주소
        setIsOpen(false);//팝업닫기
    }

    const handlePopupClick = () => {
        open({ onComplete: handleComplete });
    }

    const handleExtraAddr = (e) => {
        setExtraAddress(e.target.value);
    }

    const orderItems = useMemo(() => {
        return cartItems
            .filter((cart) => cart.checked)
            .map((cart) => {
                const product = items.find(
                    (item) => String(item.id) === String(cart.id)
                )

                if (!product) return null

                const priceNumber = Number(
                    String(product.price).replace(/,/g, '').replace(/원/g, '')
                )

                return {
                    ...product,
                    qty: cart.qty,
                    color: cart.color,
                    checked: cart.checked,
                    priceNumber,
                    totalPrice: priceNumber * cart.qty,
                }
            })
            .filter(Boolean)
    }, [cartItems, items])

    const totalPrice = useMemo(() => {
        return orderItems.reduce((acc, cur) => acc + cur.totalPrice, 0)
    }, [orderItems])

    const formatPrice = (price) => {
        const number = Number(price)
        if (Number.isNaN(number)) return '0원'
        return number.toLocaleString('ko-KR') + '원'
    }

    //결제 여부 재확인 팝업
    const [confirmPay, setConfirmPay] = useState(false);

    //결제하기 버튼 클릭시
    const handlePayment = () => {
        if (!user) {
            alert("로그인 후 이용하세요");
            navigate("/login");
        } else {
            setConfirmPay(true);
        }
    }

    //결제 취소
    const handleClosePopup = () => {
        setConfirmPay(false);
    }

    //결제가 완료
    const handleFinalConfirm = async () => {
        try {
            await createOrder({
                name: user.name,
                phone: user.phone,
                product: orderItems[0],
                option: orderItems[0].color,
                quantity: orderItems[0].qty,
                items: orderItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    option: item.color,
                    quantity: item.qty,
                    price: item.priceNumber
                }))
            })
            alert("결제가 완료되었습니다. 주문 내역을 확인하세요")
            onAddOrder({
                items: orderItems,
                total: totalPrice,
            })
            navigate("/order")
        } catch (err) {
            alert("주문 저장 중 오류가 발생했습니다.")
            console.error(err)
        }
    }



    return (
        <section className="charge-page">
            <div className="inner">
                <div className="charge-title-box">
                    <h2>주문서</h2>
                    <p>배송 / 결제 정보를 정확히 입력해주세요</p>
                </div>

                <div className="charge-section-wrap">
                    {
                        user && (<> <div className="charge-section">
                            <h3 className="section-title">주문자 정보</h3>
                            <div className="info-table">
                                <div className="info-row">
                                    <span className="label">보내는 분</span>
                                    <span className="value">{user?.name || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">휴대폰</span>
                                    <span className="value">{user?.phone || '등록된 번호 없음'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">이메일</span>
                                    <span className="value">{user?.email || '-'}</span>
                                </div>
                            </div>
                        </div>

                            <div className="charge-section">
                                <h3 className="section-title">배송 정보</h3>
                                <div className="info-table">
                                    <div className="info-row">
                                        <span className="label">배송지</span>
                                        <div className="value address-box">
                                            <div className="address-top">
                                                <strong>삼조네</strong>
                                                <span className="badge">기본 배송지</span>
                                            </div>
                                            <p>서울특별시 서초구 삼조숨조로길 33-33(3조건물) 303호</p>
                                            <button type="button" className="mini-btn">변경</button>
                                        </div>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">배송 요청사항</span>
                                        <div className="value request-box">
                                            <div className="request-inline">
                                                <p>도착하시기 전에 연락주시고, 직접 설치해주세요</p>
                                                <span className="divider"></span>
                                                <p>공동현관 비밀번호 (3030#)</p>
                                            </div>
                                            <p>엘리베이터 유무: 있음</p>
                                            <p>{user?.name || '-'}, {user?.phone || '등록된 번호 없음'}</p>
                                            <button type="button" className="mini-btn">수정</button>
                                        </div>
                                    </div>
                                </div>
                            </div></>

                        )
                    }
                    {
                        !user && (
                            <div className="unlogged-user-charge-section">
                                charge section for unlogged user
                                <form className='user-form'>
                                    <div className="unlogged-charge-section">
                                        <h3 className="section-title">주문자 정보</h3>
                                        <div className="info-table">
                                            <div className="info-row">
                                                <span className="label">보내는 분</span>
                                                <input type="text"
                                                    className="unlogged_input"
                                                    onChange={(e) => setGuestName(e.target.value)}
                                                    required />
                                            </div>
                                            <div className="info-row">
                                                <span className="label">휴대폰</span>
                                                <input type="text"
                                                    className="unlogged_input"
                                                    onChange={(e) => setGuestPhone(e.target.value)}
                                                    required />
                                            </div>
                                            <div className="info-row">
                                                <span className="label">이메일</span>
                                                <input type="email"
                                                    className="unlogged_input"
                                                    required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="unlogged-charge-section">
                                        <h3 className="section-title">배송 정보</h3>
                                        <div className="info-table unlogged-addr-area">
                                            <div className="info-row">

                                                <div className="value address-box">
                                                    <div className="search-addr input-zone">
                                                        <p>배송지 조회</p>
                                                        <button onClick={handlePopupClick}>우편번호 찾기</button>

                                                    </div>

                                                    <div className="fixed-zipcode-area input-zone">
                                                        <p>우편번호</p>
                                                        <input type="text"
                                                            value={zipCode}
                                                            placeholder='우편번호'
                                                            className="zipcode-input unlogged_input"
                                                            readOnly
                                                            required />
                                                    </div>
                                                    <div className="fixed-addr-area input-zone">
                                                        <p>주소</p>
                                                        <input type="text"
                                                            value={address}
                                                            placeholder='주소'
                                                            className="addr-input unlogged_input"
                                                            readOnly
                                                            required />
                                                    </div>
                                                    <div className="extra-addr-info input-zone">
                                                        <p>상세 주소 (도로명 주소를 제외한 상세 주소만 입력해주세요)</p>
                                                        <input type="text"
                                                            value={extraAddress}
                                                            className="exta-addr-input unlogged_input"
                                                            onChange={handleExtraAddr}
                                                            required />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="info-row">
                                                <span className="label">배송 요청사항</span>
                                                <div className="value request-box">
                                                    배송 요청사항 선택
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                            </div>
                        )
                    }
                </div>

                <div className="charge-section">
                    <h3 className="section-title">주문 상품</h3>

                    <div className="order-head">
                        <span className="col-info">상품정보</span>
                        <span className="col-price">단가</span>
                        <span className="col-qty">수량</span>
                        <span className="col-total">총금액</span>
                        <span className="col-status">배송형태</span>
                    </div>

                    <div className="order-list">
                        {orderItems.length === 0 ? (
                            <div className="empty-order">결제할 상품이 없습니다.</div>
                        ) : (
                            orderItems.map((item) => (
                                <div
                                    className="order-item"
                                    key={`${item.id}-${item.color || 'default'}`}
                                >
                                    <div className="col-info product-info">
                                        <div className="thumb">
                                            <img
                                                src={item.productImages?.[0] || item.image}
                                                alt={item.name}
                                            />
                                        </div>

                                        <div className="text-box">
                                            <h4>{item.series || '일룸'}</h4>
                                            <p>{item.name}</p>

                                            {item.color && (
                                                <div className="option-line">
                                                    <span>[필수] 색상: {item.color}</span>
                                                    <span className="color-dot"></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-price">
                                        {formatPrice(item.priceNumber)}
                                    </div>

                                    <div className="col-qty">
                                        {item.qty}
                                    </div>

                                    <div className="col-total">
                                        {formatPrice(item.totalPrice)}
                                    </div>

                                    <div className="col-status">
                                        {item.deliveryType || '택배'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <p className="delivery-notice">
                        * 택배 / 시공 상품이 별도 배송될 수 있습니다.
                    </p>

                    <div className="order-total-box">
                        <span>상품 결제 예정 금액</span>
                        <strong>{formatPrice(totalPrice)}</strong>
                    </div>
                </div>

                <div className="charge-section">
                    <h3 className="section-title">결제 수단</h3>

                    <div className="payment-methods">
                        <label className="payment-label">
                            <input
                                type="radio"
                                name="payment"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span>신용카드</span>
                        </label>

                        <label className="payment-label">
                            <input
                                type="radio"
                                name="payment"
                                value="bankbook"
                                checked={paymentMethod === 'bankbook'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span>무통장 입금</span>
                        </label>

                        <label className="payment-label">
                            <input
                                type="radio"
                                name="payment"
                                value="realtime"
                                checked={paymentMethod === 'realtime'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span>실시간 계좌이체</span>
                        </label>

                        <label className="payment-label">
                            <input
                                type="radio"
                                name="payment"
                                value="naverpay"
                                checked={paymentMethod === 'naverpay'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <img src="./images/logo-icon/npay.png" alt="npay" className='npay' />
                        </label>
                    </div>

                    <div className="payment-notice">
                        <p>1. 고객의 단순한 변심으로 인한 교환, 반품 및 환불을 요구할 때 수반되는 배송비는 고객님께서 부담하셔야합니다.</p>
                        <p>2. 상품을 개봉했거나 설치한 후에는 상품의 재판매가 불가능하므로 고객님의 변심에 대한 교환, 반품이 불가능함을 양지해 주시기 바랍니다.</p>
                    </div>

                    <button
                        type="button"
                        className="payment-btn"
                        disabled={orderItems.length === 0}
                        onClick={handlePayment}
                    >
                        {formatPrice(totalPrice)} 결제하기
                    </button>
                </div>
            </div>
            {/* 결제 확인 모달 */}
            {
                confirmPay ? <ChargeModal onClose={handleClosePopup} onConfirm={handleFinalConfirm} /> : ""
            }
        </section>
    )
}