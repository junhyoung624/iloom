import React, { useEffect, useMemo, useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import "./scss/charge.scss"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ChargeModal from './ChargeModal'
import { useKakaoPostcodePopup } from 'react-daum-postcode'
import { addOrder } from '../firebase/orderService'

//매장 선택 데이터
import { storeInfoData } from "../data/storeInfoData";
import { store_region } from "../data/storeRegionCode";
//매장 선택 select
import Select from "react-select";

export default function Charge() {
    const { cartItems, items, onAddOrder, createDeliveryDate, onfetchItems } = useProductStore()
    const { user } = useAuthStore()
    const [paymentMethod, setPaymentMethod] = useState('card')
    const navigate = useNavigate();
    const [guestName, setGuestName] = useState('')
    const [guestPhone, setGuestPhone] = useState('')

    //비회원 개인정보 수집 동의
    const [isAgree, setIsAgree] = useState(false);

    useEffect(() => {
        onfetchItems()
    }, [])

    const [guestForm, setGuestForm] = useState({
        name: "",
        phone: "",
        email: "",
        zipCode: "",
        address: "",
        extraAddress: "",
        request: "",
        customRequest: "",
        //게스트 방문 매장 변수
        visitRegionCode: "없음",
        visitStoreId: "", //매장id
    });



    const [errors, setErrors] = useState({});

    //게스트 방문매장 선택

    const visitedStores = storeInfoData.filter(
        (store) => store.region_code === guestForm.visitRegionCode
    );

    //지역 리스트
    const regionOptions = [
        { value: "없음", label: "없음" },
        ...store_region
            .filter((r) => r.code !== "default")
            .map((r) => ({
                value: r.code,
                label: r.name,
            })),
    ];

    //매장 리스트
    const storeOptions = storeInfoData
        .filter(store => store.region_code === guestForm.visitRegionCode)
        .map(store => ({
            value: store.id,
            label: store.store_name
        }));

    const selectedRegionOption =
        regionOptions.find(opt => opt.value === guestForm.visitRegionCode) || null;

    const selectedStoreOption =
        storeOptions.find(opt => opt.value === guestForm.visitStoreId) || null;

    //배송 요청사항 리스트
    const delivery_req_options = [
        { value: "", label: "배송 요청사항을 입력해주세요" },
        { value: "부재시 문앞에 놓아주세요.", label: "부재시 문앞에 놓아주세요." },
        { value: "부재시 경비실에 맡겨 주세요.", label: "부재시 경비실에 맡겨 주세요." },
        { value: "부재시 전화 또는 문자 주세요.", label: "부재시 전화 또는 문자 주세요." },
        { value: "배송전에 연락주세요.", label: "배송전에 연락주세요." },
        { value: "직접입력", label: "직접입력" },
    ]

    const selectedDeliveryReqOption =
        delivery_req_options.find((option) => option.value === guestForm.request) || delivery_req_options[0];

    const handleGuestChange = (e) => {
        const { name, value } = e.target;
        console.log(e.target.value);
        setGuestForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const SCRIPT_URL = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    const open = useKakaoPostcodePopup(SCRIPT_URL);

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';
        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        setGuestForm((prev) => ({ ...prev, zipCode: data.zonecode, address: fullAddress }));
        setErrors((prev) => ({ ...prev, zipCode: "", address: "" }));
    }

    //결제하기 클릭 시 취소/결제확인 체크하도록
    const handlePopupClick = () => {
        open({ onComplete: handleComplete });
    }

    const validateGuestForm = () => {
        const newErrors = {};
        const name = guestForm.name.trim();
        const phone = guestForm.phone.trim();
        const email = guestForm.email.trim();
        const zipCode = guestForm.zipCode.trim();
        const address = guestForm.address.trim();
        const extraAddress = guestForm.extraAddress.trim();
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name) newErrors.name = "** 이름을 입력해주세요.";
        if (!phone) newErrors.phone = "** 휴대폰 번호를 입력해주세요.";
        else if (!phoneRegex.test(phone)) newErrors.phone = "** 휴대폰 번호 형식이 올바르지 않습니다.";
        if (!email) newErrors.email = "** 이메일을 입력해주세요.";
        else if (!emailRegex.test(email)) newErrors.email = "** 이메일 형식이 올바르지 않습니다.";
        if (!zipCode) newErrors.zipCode = "** 우편번호를 입력해주세요.";
        if (!address) newErrors.address = "** 주소를 입력해주세요.";
        if (!extraAddress) newErrors.extraAddress = "** 상세 주소를 입력해주세요.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const location = useLocation();

    //상세페이지에서 바로 결제 / 장바구니에서 결제 구분
    const directBuyItem = location.state?.directBuyItem;

    const orderItems = useMemo(() => {
        if (directBuyItem) {
            const priceNumber = (
                String(directBuyItem.price).replace(/,/g, '').replace(/원/g, '')
            );
            return [{ ...directBuyItem, priceNumber, totalPrice: priceNumber * directBuyItem.qty }];
        }
        return cartItems
            .filter((cart) => cart.checked)
            .map((cart) => {
                const product = items.find((item) => String(item.id) === String(cart.id))
                if (!product) return null
                const priceNumber = Number(String(product.price).replace(/,/g, '').replace(/원/g, ''))
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
    }, [cartItems, items, directBuyItem])

    const totalPrice = useMemo(() => {
        return orderItems.reduce((acc, cur) => acc + cur.totalPrice, 0)
    }, [orderItems])

    const formatPrice = (price) => {
        const number = Number(price)
        if (Number.isNaN(number)) return '0원'
        return number.toLocaleString('ko-KR') + '원'
    }

    const createOrderNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const date = String(now.getDate()).padStart(2, "0");
        const random = Math.random().toString(36).slice(2, 8).toUpperCase();
        return `${year}${month}${date}-${random}`;
    };

    const [confirmPay, setConfirmPay] = useState(false);

    const handlePayment = () => {
        if (orderItems.length === 0) return;

        //개인정보 수집 동의 체크 여부 확인
        if (!user && !isAgree) {
            alert("개인정보 수집 및 이용에 동의해주세요");
            return;
        }
        if (user) { setConfirmPay(true); return; }
        const isValid = validateGuestForm();
        if (!isValid) { alert("필수 정보를 올바르게 입력해주세요."); return; }
        setConfirmPay(true);
    }

    const handleClosePopup = () => { setConfirmPay(false); }

    const handleFinalConfirm = async () => {
        const orderNumber = createOrderNumber();
        const formatGuestPhone = guestForm.phone.replace(/-/g, "");
        const deliveryDate = createDeliveryDate();
        const finalRequest =
            guestForm.request === "직접입력"
                ? guestForm.customRequest
                : guestForm.request;

        const orderData = user
            ? {
                orderId: orderNumber,
                orderNumber,
                isGuest: false,
                name: user.name,
                phone: user.phone,
                email: user.email,
                userInfo: { name: user.name, phone: user.phone, email: user.email },
                status: "결제완료",
                deliveryInfo: {
                    carrier: "일룸 배송팀",
                    trackingNumber: "준비중",
                    estimatedDate: deliveryDate,
                },
                // items 구조 수정 - Order.jsx에서 필요한 필드 포함
                items: orderItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    series: item.series || "",
                    color: item.color || "",
                    qty: item.qty,
                    price: item.priceNumber,
                    productImages: item.productImages || [],
                })),
                total: totalPrice,
            }
            : {
                orderId: orderNumber,
                orderNumber,
                isGuest: true,
                name: guestForm.name,
                phone: formatGuestPhone,
                email: guestForm.email,
                guestInfo: {
                    name: guestForm.name,
                    phone: formatGuestPhone,
                    email: guestForm.email,
                    zipCode: guestForm.zipCode,
                    address: guestForm.address,
                    extraAddress: guestForm.extraAddress,
                    request: finalRequest,
                },
                status: "결제완료",
                deliveryInfo: {
                    carrier: "일룸 배송팀",
                    trackingNumber: "준비중",
                    estimatedDate: deliveryDate,
                },
                // items 구조 수정
                items: orderItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    series: item.series || "",
                    color: item.color || "",
                    qty: item.qty,
                    price: item.priceNumber,
                    productImages: item.productImages || [],
                })),
                total: totalPrice,
            };

        try {
            onAddOrder(orderData, user); // user 추가
            await addOrder(orderData);
            alert(`결제가 완료되었습니다. 주문번호는 ${orderNumber} 입니다.`);
            user ? navigate("/order") : navigate(`/orderForGuest/${orderNumber}`)
        } catch (err) {
            console.log(err);
            alert("주문 저장 중 오류가 발생했습니다.");
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
                    {user && (
                        <>
                            <div className="charge-section">
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
                                <div className="inner">
                                    <div className="delivery-agreement-area">
                                        <div className="title">비회원 개인정보 수집 및 이용 동의</div>
                                        <div className="discription">
                                            <div className="discription-inner">
                                                <p class="discription_title">개인정보의 수집 및 이용에 대한 안내</p>
                                                <p class="discription_title">수집 항목</p>
                                                <p>주문고객정보 (주문자이름, 이메일, 휴대폰번호)</p>
                                                <p>배송지정보 (수취인이름, 배송지주소, 휴대폰번호, 전화번호)</p>
                                                <p>결제정보 (카드정보, 계좌정보)</p>
                                                <br></br>
                                                <p class="discription_title">수집 목적</p>
                                                <p>주문 확인, 주문상품 결제, 주문상품 배송</p>
                                                <br></br>
                                                <p class="discription_title">이용 기간</p>
                                                <p class="fwBd underline">원칙적으로 개인정보 수집 및 이용목적이 달성된 후에 해당 정보를 지체 없이 파기합니다.</p>
                                                <p class="fwBd underline">단, 관계법령의 규정에 의하여 필요가 있는 경우 일정기간 동안 개인정보를 보관할 수 있습니다.</p>
                                                <p>귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 단, 거부하는 경우 상품 구매가 불가능합니다. </p>
                                                <p>
                                                    <br />
                                                    그 밖의 사항은 일룸 개인정보처리방침을 준수합니다.
                                                </p>
                                            </div>

                                        </div>
                                        <div
                                            className="agree-checkbox"
                                            onClick={() => setIsAgree(prev => !prev)}>
                                            <img src={isAgree ? "./images/logo-icon/order-isChecked-true.png" : "./images/logo-icon/order-isChecked-false.png"} alt="." />
                                            <span>비회원 구매 약관에 동의합니다.</span>
                                        </div>
                                    </div>
                                    <div className="delivery-info-area">
                                        <div className="title">비회원 주문정보</div>
                                        <form className='user-form'>
                                            <div className="unlogged-charge-section unlogged-area-left">
                                                <h3 className="section-title">주문자 정보</h3>
                                                <div className="info-table unlogged-addr-area">
                                                    <div className="info-row input-zone">
                                                        <p className="unlogged-requisite-info">주문자명</p>
                                                        <input type="text"
                                                            name="name"
                                                            onChange={handleGuestChange}
                                                            value={guestForm.name}
                                                            className="unlogged_input"
                                                            required />
                                                        {errors.name && <p className="error-text error-text-right">{errors.name}</p>}
                                                    </div>
                                                    <div className="info-row input-zone">
                                                        <p className="unlogged-requisite-info">휴대폰</p>
                                                        <input type="text"
                                                            name="phone"
                                                            onChange={handleGuestChange}
                                                            value={guestForm.phone}
                                                            className="unlogged_input"
                                                            required />
                                                        {errors.phone && <p className="error-text error-text-right">{errors.phone}</p>}
                                                    </div>
                                                    <div className="info-row input-zone">
                                                        <p className="unlogged-requisite-info">이메일</p>
                                                        <input type="email"
                                                            name="email"
                                                            onChange={handleGuestChange}
                                                            value={guestForm.email}
                                                            className="unlogged_input"
                                                            required />
                                                        {errors.email && <p className="error-text error-text-right">{errors.email}</p>}
                                                    </div>
                                                    <div className="info-row input-zone">
                                                        <p className="choose-store">방문 매장 선택</p>
                                                        <div className="visit-store-box">
                                                            <div className="txt-info">
                                                                <p className="visit-store-sub">
                                                                    º 주문 제품 선택에 도움을 받은 매장이 있다면 선택해주세요.
                                                                </p>
                                                                <p className="visit-store-sub">
                                                                    º 방문 매장이 없다면 “없음”을 선택해주세요.
                                                                </p>
                                                                <p className="visit-store-guide">
                                                                    ※ 해당 질문은 더 나은 고객 서비스를 위한 참고자료로 활용될 예정입니다.
                                                                </p>
                                                            </div>

                                                            <div className="visit-store-select-wrap">
                                                                <Select
                                                                    className='store-select'
                                                                    options={regionOptions}
                                                                    value={selectedRegionOption}
                                                                    placeholder="지역 선택"

                                                                    onChange={(selected) => {
                                                                        setGuestForm(prev => ({
                                                                            ...prev,
                                                                            visitRegionCode: selected?.value || "없음",
                                                                            visitStoreId: ""
                                                                        }));
                                                                    }}
                                                                />
                                                                {guestForm.visitRegionCode !== "없음" && (
                                                                    <Select
                                                                        className='store-select'
                                                                        options={storeOptions}
                                                                        value={selectedStoreOption}
                                                                        placeholder="매장 선택"
                                                                        isSearchable
                                                                        onChange={(selected) => {
                                                                            setGuestForm(prev => ({
                                                                                ...prev,
                                                                                visitStoreId: selected?.value || ""
                                                                            }));
                                                                        }}
                                                                    />
                                                                )}

                                                            </div>


                                                            {/* {guestForm.visitStoreId && (
                                                                <div className="visit-store-detail">
                                                                    {(() => {
                                                                        const selectedStore = visitedStores.find(
                                                                            (store) => store.id === guestForm.visitStoreId
                                                                        );

                                                                        if (!selectedStore) return null;

                                                                        return (
                                                                            <>
                                                                                <p>{selectedStore.store_name}</p>
                                                                                <p>{selectedStore.address}</p>
                                                                                <p>{selectedStore.phone}</p>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )} */}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="unlogged-charge-section unlogged-area-right">
                                                <h3 className="section-title">배송 정보</h3>
                                                <div className="info-table unlogged-addr-area">
                                                    <div className="info-row">

                                                        <div className="value address-box">
                                                            <div className="search-addr input-zone">
                                                                <p className='search-addr-wrap'><span className='unlogged-requisite-info'>배송지 조회</span><span> (* 울릉도 지역은 온라인 주문이 불가하오니, 대리점에 직접 방문해주세요.)</span></p>
                                                                <div className="inner">
                                                                    <input type="text"
                                                                        value={guestForm.zipCode}
                                                                        placeholder='우편번호'
                                                                        className="zipcode-input unlogged_input"
                                                                        readOnly

                                                                        required />
                                                                    <button onClick={handlePopupClick}>우편번호 찾기</button>

                                                                </div>
                                                                {errors.zipCode && <p className="error-text">{errors.zipCode}</p>}

                                                            </div>

                                                            {/* <div className="fixed-zipcode-area input-zone">
                                                                <p className='unlogged-requisite-info'>우편번호</p>
                                                                <input type="text"
                                                                    value={guestForm.zipCode}
                                                                    placeholder='우편번호'
                                                                    className="zipcode-input unlogged_input"
                                                                    readOnly

                                                                    required />
                                                                {errors.zipCode && <p className="error-text">{errors.zipCode}</p>}

                                                            </div> */}
                                                            <div className="fixed-addr-area input-zone">
                                                                <p className='unlogged-requisite-info'>주소</p>
                                                                <input type="text"
                                                                    value={guestForm.address}
                                                                    placeholder='주소'
                                                                    className="addr-input unlogged_input"
                                                                    readOnly
                                                                    required />
                                                                {errors.address && <p className="error-text">{errors.address}</p>}
                                                            </div>
                                                            <div className="extra-addr-info input-zone">
                                                                <p className='extra-addr-wrap'><span className='unlogged-requisite-info'>상세 주소</span> <span>(도로명 주소를 제외한 상세 주소만 입력해주세요)</span></p>
                                                                <input type="text"
                                                                    name='extraAddress'
                                                                    onChange={handleGuestChange}
                                                                    value={guestForm.extraAddress}
                                                                    className="exta-addr-input unlogged_input"
                                                                    required />
                                                                {errors.extraAddress && <p className="error-text">{errors.extraAddress}</p>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="info-row">
                                                        <span className="label">배송 요청사항</span>
                                                        <div className="value request-box">
                                                            {/* 배송 요청사항 선택 */}
                                                            <Select
                                                                className="delivery-requirement-select"
                                                                classNamePrefix="delivery-req"
                                                                options={delivery_req_options}
                                                                value={selectedDeliveryReqOption}
                                                                placeholder="배송 요청사항을 선택해주세요"
                                                                styles={{
                                                                    singleValue: (base, state) => ({
                                                                        ...base,
                                                                        color: state.data.value === "" ? "#aaa" : "#333",
                                                                    }),
                                                                }}
                                                                onChange={(selected) => {
                                                                    setGuestForm((prev) => ({
                                                                        ...prev,
                                                                        request: selected?.value || "",
                                                                        customRequest: "",
                                                                    }));
                                                                }}
                                                            />

                                                            {guestForm.request === "직접입력" && (
                                                                <textarea
                                                                    name="customRequest"
                                                                    value={guestForm.customRequest}
                                                                    onChange={handleGuestChange}
                                                                    className="delivery-request-textarea"
                                                                    placeholder="배송 요청사항을 직접 입력해주세요."
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                </div>
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
                                <div className="order-item" key={`${item.id}-${item.color || 'default'}`}>
                                    <div className="col-info product-info">
                                        <div className="thumb">
                                            <img src={item.productImages?.[0] || item.image} alt={item.name} />
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
                                    <div className="col-price">{formatPrice(item.priceNumber)}</div>
                                    <div className="col-qty">{item.qty}</div>
                                    <div className="col-total">{formatPrice(item.totalPrice)}</div>
                                    <div className="col-status">{item.deliveryType || '택배'}</div>
                                </div>
                            ))
                        )}
                    </div>
                    <p className="delivery-notice">* 택배 / 시공 상품이 별도 배송될 수 있습니다.</p>
                    <div className="order-total-box">
                        <span>상품 결제 예정 금액</span>
                        <strong>{formatPrice(totalPrice)}</strong>
                    </div>
                </div>

                <div className="charge-section">
                    <h3 className="section-title">결제 수단</h3>
                    <div className="payment-methods">
                        <label className="payment-label">
                            <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span>신용카드</span>
                        </label>
                        <label className="payment-label">
                            <input type="radio" name="payment" value="bankbook" checked={paymentMethod === 'bankbook'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span>무통장 입금</span>
                        </label>
                        <label className="payment-label">
                            <input type="radio" name="payment" value="realtime" checked={paymentMethod === 'realtime'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span>실시간 계좌이체</span>
                        </label>
                        <label className="payment-label">
                            <input type="radio" name="payment" value="naverpay" checked={paymentMethod === 'naverpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <img src="./images/logo-icon/npay.png" alt="npay" className='npay' />
                        </label>
                    </div>
                    <div className="payment-notice">
                        <p>1. 고객의 단순한 변심으로 인한 교환, 반품 및 환불을 요구할 때 수반되는 배송비는 고객님께서 부담하셔야합니다.</p>
                        <p>2. 상품을 개봉했거나 설치한 후에는 상품의 재판매가 불가능하므로 고객님의 변심에 대한 교환, 반품이 불가능함을 양지해 주시기 바랍니다.</p>
                    </div>
                    <button type="button" className="payment-btn" disabled={orderItems.length === 0} onClick={handlePayment}>
                        {formatPrice(totalPrice)} 결제하기
                    </button>
                </div>
            </div>
            {confirmPay ? <ChargeModal onClose={handleClosePopup} onConfirm={handleFinalConfirm} /> : ""}
        </section>
    )
}