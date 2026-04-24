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
    const navigate = useNavigate()
    const [showCardForm, setShowCardForm] = useState(false)
    const [cardForm, setCardForm] = useState({ name: "", number: "", month: "", year: "", cvv: "", sameAsShipping: false })
    const [cardErrors, setCardErrors] = useState({})

    // 배송지 팝업
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [addressForm, setAddressForm] = useState({
        name: "삼조네",
        address: "서울특별시 서초구 삼조숨조로길 33-33(3조건물) 303호",
        phone: user?.phone || "",
    })
    const [addressDraft, setAddressDraft] = useState({ ...addressForm })

    // 배송 요청사항 팝업
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [requestForm, setRequestForm] = useState({
        message: "도착하시기 전에 연락주시고, 직접 설치해주세요",
        entrance: "공동현관 비밀번호 (3030#)",
        elevator: "있음",
    })
    const [requestDraft, setRequestDraft] = useState({ ...requestForm })

    // ✅ 중복 제거: useEffect 하나로 통합
    useEffect(() => { onfetchItems() }, [])

    // ✅ 중복 제거: guestForm 두 번째 선언(필드 더 많은 것)으로 통합
    const [guestForm, setGuestForm] = useState({
        name: "",
        phone: "",
        email: "",
        zipCode: "",
        address: "",
        extraAddress: "",
        request: "",
        customRequest: "",
        visitRegionCode: "없음",
        visitStoreId: "",
    })
    const [errors, setErrors] = useState({})

    //비회원 개인정보 수집 동의
    const [isAgree, setIsAgree] = useState(false);

    //비회원 이메일, 전화번호 상태 검사
    const [fieldStatus, setFieldStatus] = useState({
        phone: "idle",
        email: "idle",
    });

    //게스트 방문매장 선택 - 지역 리스트
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
        setGuestForm((prev) => ({ ...prev, [name]: value }));
        if (name === "phone" || name === "email") {
            validateLiveField(name, value, false);
        } else {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const SCRIPT_URL = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    const open = useKakaoPostcodePopup(SCRIPT_URL)

    const handleComplete = (data) => {
        let fullAddress = data.address
        let extraAddress = ''
        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName)
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '')
        }
        setGuestForm((prev) => ({ ...prev, zipCode: data.zonecode, address: fullAddress }))
        setErrors((prev) => ({ ...prev, zipCode: "", address: "" }))
    }

    const handlePopupClick = () => {
        open({ onComplete: handleComplete });
    }

    //비회원 주문자 정보 입력 검사
    const validateGuestForm = () => {
        const newErrors = {}
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!guestForm.name.trim()) newErrors.name = "** 이름을 입력해주세요."
        if (!guestForm.phone.trim()) newErrors.phone = "** 휴대폰 번호를 입력해주세요."
        else if (!phoneRegex.test(guestForm.phone.trim())) newErrors.phone = "** 휴대폰 번호 형식이 올바르지 않습니다."
        if (!guestForm.email.trim()) newErrors.email = "** 이메일을 입력해주세요."
        else if (!emailRegex.test(guestForm.email.trim())) newErrors.email = "** 이메일 형식이 올바르지 않습니다."
        if (!guestForm.zipCode.trim()) newErrors.zipCode = "** 우편번호를 입력해주세요."
        if (!guestForm.address.trim()) newErrors.address = "** 주소를 입력해주세요."
        if (!guestForm.extraAddress.trim()) newErrors.extraAddress = "** 상세 주소를 입력해주세요."
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    //비회원 전화번호, 이메일 실시간 검사
    const validateLiveField = (name, value, isBlur = false) => {
        const trimmedValue = value.trim();
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let message = "";
        let status = "idle";

        if (name === "email") {
            if (!trimmedValue) {
                message = isBlur ? "** 이메일이 필요합니다." : "";
                status = isBlur ? "error" : "idle";
            } else if (!emailRegex.test(trimmedValue)) {
                message = "** 유효한 이메일 주소를 입력하세요.";
                status = "error";
            } else {
                message = "";
                status = "success";
            }
        }

        if (name === "phone") {
            if (!trimmedValue) {
                message = isBlur ? "** 휴대폰 번호가 필요합니다." : "";
                status = isBlur ? "error" : "idle";
            } else if (!phoneRegex.test(trimmedValue)) {
                message = "** 유효한 휴대폰 번호를 입력하세요.";
                status = "error";
            } else {
                message = "";
                status = "success";
            }
        }

        setErrors((prev) => ({ ...prev, [name]: message }));
        setFieldStatus((prev) => ({ ...prev, [name]: status }));
    };

    const location = useLocation();

    //상세페이지에서 바로 결제 / 장바구니에서 결제 구분
    const directBuyItem = location.state?.directBuyItem;

    const orderItems = useMemo(() => {
        if (directBuyItem) {
            const priceNumber = Number(String(directBuyItem.price).replace(/,/g, '').replace(/원/g, ''))
            return [{ ...directBuyItem, priceNumber, totalPrice: priceNumber * directBuyItem.qty }]
        }
        return cartItems.filter((cart) => cart.checked).map((cart) => {
            const product = items.find((item) => String(item.id) === String(cart.id))
            if (!product) return null
            const priceNumber = Number(String(product.price).replace(/,/g, '').replace(/원/g, ''))
            return { ...product, qty: cart.qty, color: cart.color, checked: cart.checked, priceNumber, totalPrice: priceNumber * cart.qty }
        }).filter(Boolean)
    }, [cartItems, items, directBuyItem])

    const totalPrice = useMemo(() => orderItems.reduce((acc, cur) => acc + cur.totalPrice, 0), [orderItems])

    const formatPrice = (price) => {
        const number = Number(price)
        if (Number.isNaN(number)) return '0원'
        return number.toLocaleString('ko-KR') + '원'
    }

    const createOrderNumber = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, "0")
        const date = String(now.getDate()).padStart(2, "0")
        const random = Math.random().toString(36).slice(2, 8).toUpperCase()
        return `${year}${month}${date}-${random}`
    }

    const [confirmPay, setConfirmPay] = useState(false)
    const handlePayment = () => {
        if (orderItems.length === 0) return;
        if (!user && !isAgree) {
            alert("개인정보 수집 및 이용에 동의해주세요");
            return;
        }
        if (user) { setConfirmPay(true); return; }
        const isValid = validateGuestForm();
        if (!isValid) { alert("필수 정보를 올바르게 입력해주세요."); return; }
        setConfirmPay(true);
    }
    const handleClosePopup = () => { setConfirmPay(false) }

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
                orderId: orderNumber, orderNumber, isGuest: false,
                name: user.name, phone: user.phone, email: user.email,
                userInfo: { name: user.name, phone: user.phone, email: user.email },
                status: "결제완료",
                deliveryInfo: { carrier: "일룸 배송팀", trackingNumber: "준비중", estimatedDate: deliveryDate },
                items: orderItems.map((item) => ({ id: item.id, name: item.name, series: item.series || "", color: item.color || "", qty: item.qty, price: item.priceNumber, productImages: item.productImages || [] })),
                total: totalPrice,
            }
            : {
                orderId: orderNumber, orderNumber, isGuest: true,
                name: guestForm.name, phone: formatGuestPhone, email: guestForm.email,
                guestInfo: { name: guestForm.name, phone: formatGuestPhone, email: guestForm.email, zipCode: guestForm.zipCode, address: guestForm.address, extraAddress: guestForm.extraAddress, request: finalRequest },
                status: "결제완료",
                deliveryInfo: { carrier: "일룸 배송팀", trackingNumber: "준비중", estimatedDate: deliveryDate },
                items: orderItems.map((item) => ({ id: item.id, name: item.name, series: item.series || "", color: item.color || "", qty: item.qty, price: item.priceNumber, productImages: item.productImages || [] })),
                total: totalPrice,
            }
        try {
            onAddOrder(orderData, user);
            await addOrder(orderData);
            alert(`결제가 완료되었습니다. 주문번호는 ${orderNumber} 입니다.`);
            user ? navigate("/order") : navigate(`/orderForGuest/${orderNumber}`)
        } catch (err) {
            console.log(err)
            alert("주문 저장 중 오류가 발생했습니다.")
        }
    }

    // 카드
    const handleCardChange = (e) => {
        const { name, value, type, checked } = e.target
        setCardForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
        setCardErrors((prev) => ({ ...prev, [name]: "" }))
    }
    const validateCardForm = () => {
        const errs = {}
        if (!cardForm.name.trim()) errs.name = "카드 소유자 이름을 입력해주세요."
        if (!/^\d{16}$/.test(cardForm.number.replace(/\s/g, ""))) errs.number = "16자리 카드 번호를 입력해주세요."
        if (!cardForm.month) errs.month = "월을 선택해주세요."
        if (!cardForm.year) errs.year = "연도를 선택해주세요."
        if (!/^\d{3,4}$/.test(cardForm.cvv)) errs.cvv = "CVV를 입력해주세요."
        setCardErrors(errs)
        return Object.keys(errs).length === 0
    }
    const handleCardSubmit = () => {
        if (validateCardForm()) { setShowCardForm(false); alert("카드가 등록되었습니다.") }
    }

    // 배송지 변경
    const handleOpenAddress = () => {
        setAddressDraft({ ...addressForm })
        setShowAddressModal(true)
    }
    const handleAddressConfirm = () => {
        setAddressForm({ ...addressDraft })
        setShowAddressModal(false)
    }

    // 배송 요청사항 수정
    const handleOpenRequest = () => {
        setRequestDraft({ ...requestForm })
        setShowRequestModal(true)
    }
    const handleRequestConfirm = () => {
        setRequestForm({ ...requestDraft })
        setShowRequestModal(false)
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
                                                <strong>{addressForm.name}</strong>
                                                <span className="badge">기본 배송지</span>
                                            </div>
                                            <p>{addressForm.address}</p>
                                            <button type="button" className="mini-btn" onClick={handleOpenAddress}>변경</button>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">배송 요청사항</span>
                                        <div className="value request-box">
                                            <div className="request-inline">
                                                <p>{requestForm.message}</p>
                                                <span className="divider"></span>
                                                <p>{requestForm.entrance}</p>
                                            </div>
                                            <p>엘리베이터 유무: {requestForm.elevator}</p>
                                            <p>{user?.name || '-'}, {user?.phone || '등록된 번호 없음'}</p>
                                            <button type="button" className="mini-btn" onClick={handleOpenRequest}>수정</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {!user && (
                        <div className="unlogged-user-charge-section">
                            <div className="inner">
                                <div className="delivery-agreement-area">
                                    <div className="title">비회원 개인정보 수집 및 이용 동의</div>
                                    <div className="discription">
                                        <div className="discription-inner">
                                            <p className="discription_title">개인정보의 수집 및 이용에 대한 안내</p>
                                            <p className="discription_title">수집 항목</p>
                                            <p>주문고객정보 (주문자이름, 이메일, 휴대폰번호)</p>
                                            <p>배송지정보 (수취인이름, 배송지주소, 휴대폰번호, 전화번호)</p>
                                            <p>결제정보 (카드정보, 계좌정보)</p>
                                            <br />
                                            <p className="discription_title">수집 목적</p>
                                            <p>주문 확인, 주문상품 결제, 주문상품 배송</p>
                                            <br />
                                            <p className="discription_title">이용 기간</p>
                                            <p className="fwBd underline">원칙적으로 개인정보 수집 및 이용목적이 달성된 후에 해당 정보를 지체 없이 파기합니다.</p>
                                            <p className="fwBd underline">단, 관계법령의 규정에 의하여 필요가 있는 경우 일정기간 동안 개인정보를 보관할 수 있습니다.</p>
                                            <p>귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 단, 거부하는 경우 상품 구매가 불가능합니다.</p>
                                            <p><br />그 밖의 사항은 일룸 개인정보처리방침을 준수합니다.</p>
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
                                                    {errors.name && <div><p className="error-text error-text-right">{errors.name}</p></div>}
                                                </div>
                                                <div className="info-row input-zone">
                                                    <p className="unlogged-requisite-info">휴대폰</p>
                                                    <input type="text"
                                                        name="phone"
                                                        onChange={handleGuestChange}
                                                        onBlur={(e) => validateLiveField(e.target.name, e.target.value, true)}
                                                        value={guestForm.phone}
                                                        className={`unlogged_input ${fieldStatus.phone}`}
                                                        required />
                                                    {errors.phone && <p className="error-text error-text-right">{errors.phone}</p>}
                                                </div>
                                                <div className="info-row input-zone">
                                                    <p className="unlogged-requisite-info">이메일</p>
                                                    <input type="email"
                                                        name="email"
                                                        onChange={handleGuestChange}
                                                        onBlur={(e) => validateLiveField(e.target.name, e.target.value, true)}
                                                        value={guestForm.email}
                                                        className={`unlogged_input ${fieldStatus.email}`}
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
                                                                º 방문 매장이 없다면 "없음"을 선택해주세요.
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
                                                            <p className='search-addr-wrap'>
                                                                <span className='unlogged-requisite-info'>배송지 조회</span>
                                                                <span> (* 울릉도 지역은 온라인 주문이 불가하오니, 대리점에 직접 방문해주세요.)</span>
                                                            </p>
                                                            <div className="inner">
                                                                <input type="text"
                                                                    value={guestForm.zipCode}
                                                                    placeholder='우편번호'
                                                                    className="zipcode-input unlogged_input"
                                                                    readOnly
                                                                    required />
                                                                <button type="button" onClick={handlePopupClick}>우편번호 찾기</button>
                                                            </div>
                                                            {errors.zipCode && <p className="error-text">{errors.zipCode}</p>}
                                                        </div>
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
                                                            <p className='extra-addr-wrap'>
                                                                <span className='unlogged-requisite-info'>상세 주소</span>
                                                                <span>(도로명 주소를 제외한 상세 주소만 입력해주세요)</span>
                                                            </p>
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
                    )}
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
                        {paymentMethod === 'card' && (
                            <button type="button" className="card-register-btn" onClick={() => setShowCardForm(true)}>
                                + 카드 등록
                            </button>
                        )}
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

            {confirmPay && <ChargeModal onClose={handleClosePopup} onConfirm={handleFinalConfirm} />}

            {/* 카드 등록 모달 */}
            {showCardForm && (
                <div className="card-modal-overlay" onClick={() => setShowCardForm(false)}>
                    <div className="card-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="card-modal-header">
                            <h3>결제 수단</h3>
                            <p className="card-modal-desc">모든 거래는 안전하게 암호화됩니다</p>
                            <button className="card-modal-close" onClick={() => setShowCardForm(false)}>✕</button>
                        </div>
                        <div className="card-modal-body">
                            <div className="card-field">
                                <label>카드 소유자 이름</label>
                                <input type="text" name="name" value={cardForm.name} onChange={handleCardChange} placeholder="홍길동" />
                                {cardErrors.name && <p className="card-error">{cardErrors.name}</p>}
                            </div>
                            <div className="card-field">
                                <label>카드 번호</label>
                                <input
                                    type="text" name="number" value={cardForm.number}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 16)
                                        const formatted = val.replace(/(.{4})/g, "$1 ").trim()
                                        setCardForm((prev) => ({ ...prev, number: formatted }))
                                        setCardErrors((prev) => ({ ...prev, number: "" }))
                                    }}
                                    placeholder="0000 0000 0000 0000" maxLength={19}
                                />
                                {cardErrors.number && <p className="card-error">{cardErrors.number}</p>}
                            </div>
                            <div className="card-field-row">
                                <div className="card-field">
                                    <label>유효기간</label>
                                    <div className="card-expiry">
                                        <select name="month" value={cardForm.month} onChange={handleCardChange}>
                                            <option value="">MM</option>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{String(i + 1).padStart(2, "0")}</option>
                                            ))}
                                        </select>
                                        <select name="year" value={cardForm.year} onChange={handleCardChange}>
                                            <option value="">YYYY</option>
                                            {Array.from({ length: 10 }, (_, i) => (
                                                <option key={i} value={2025 + i}>{2025 + i}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {(cardErrors.month || cardErrors.year) && <p className="card-error">유효기간을 선택해주세요.</p>}
                                </div>
                                <div className="card-field">
                                    <label>CVV</label>
                                    <input type="password" name="cvv" value={cardForm.cvv} onChange={handleCardChange} placeholder="···" maxLength={4} />
                                    {cardErrors.cvv && <p className="card-error">{cardErrors.cvv}</p>}
                                </div>
                            </div>
                            <div className="card-field-separator">청구지 주소</div>
                            <p className="card-field-desc">결제 수단과 연결된 청구지 주소입니다</p>
                            <div className="card-field card-field-check">
                                <input type="checkbox" id="sameAsShipping" name="sameAsShipping" checked={cardForm.sameAsShipping} onChange={handleCardChange} />
                                <label htmlFor="sameAsShipping">배송지 주소와 동일</label>
                            </div>
                        </div>
                        <div className="card-modal-footer">
                            <button className="card-cancel-btn" onClick={() => setShowCardForm(false)}>취소</button>
                            <button className="card-submit-btn" onClick={handleCardSubmit}>등록</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 배송지 변경 모달 */}
            {showAddressModal && (
                <div className="card-modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="card-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="card-modal-header">
                            <h3>배송지 변경</h3>
                            <p className="card-modal-desc">받으실 분의 배송 정보를 입력해주세요</p>
                            <button className="card-modal-close" onClick={() => setShowAddressModal(false)}>✕</button>
                        </div>
                        <div className="card-modal-body">
                            <div className="card-field">
                                <label>받으시는 분</label>
                                <input
                                    type="text"
                                    value={addressDraft.name}
                                    onChange={(e) => setAddressDraft((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="이름을 입력해주세요"
                                />
                            </div>
                            <div className="card-field">
                                <label>배송지 주소</label>
                                <input
                                    type="text"
                                    value={addressDraft.address}
                                    onChange={(e) => setAddressDraft((prev) => ({ ...prev, address: e.target.value }))}
                                    placeholder="경기 성남시 분당구 정자일로 95"
                                />
                            </div>
                            <div className="card-field">
                                <label>연락처</label>
                                <input
                                    type="text"
                                    value={addressDraft.phone}
                                    onChange={(e) => setAddressDraft((prev) => ({ ...prev, phone: e.target.value }))}
                                    placeholder="010-0000-0000"
                                />
                            </div>
                        </div>
                        <div className="card-modal-footer">
                            <button className="card-cancel-btn" onClick={() => setShowAddressModal(false)}>취소</button>
                            <button className="card-submit-btn" onClick={handleAddressConfirm}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 배송 요청사항 수정 모달 */}
            {showRequestModal && (
                <div className="card-modal-overlay" onClick={() => setShowRequestModal(false)}>
                    <div className="card-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="card-modal-header">
                            <h3>배송 요청사항 수정</h3>
                            <p className="card-modal-desc">배송 시 요청사항을 입력해주세요</p>
                            <button className="card-modal-close" onClick={() => setShowRequestModal(false)}>✕</button>
                        </div>
                        <div className="card-modal-body">
                            <div className="card-field">
                                <label>배송 메시지</label>
                                <input
                                    type="text"
                                    value={requestDraft.message}
                                    onChange={(e) => setRequestDraft((prev) => ({ ...prev, message: e.target.value }))}
                                    placeholder="배송 요청사항을 입력해주세요"
                                />
                            </div>
                            <div className="card-field">
                                <label>공동현관 출입 방법</label>
                                <input
                                    type="text"
                                    value={requestDraft.entrance}
                                    onChange={(e) => setRequestDraft((prev) => ({ ...prev, entrance: e.target.value }))}
                                    placeholder="공동현관 비밀번호 또는 출입 방법"
                                />
                            </div>
                            <div className="card-field">
                                <label>엘리베이터 유무</label>
                                <select
                                    value={requestDraft.elevator}
                                    onChange={(e) => setRequestDraft((prev) => ({ ...prev, elevator: e.target.value }))}
                                >
                                    <option value="있음">있음</option>
                                    <option value="없음">없음</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-modal-footer">
                            <button className="card-cancel-btn" onClick={() => setShowRequestModal(false)}>취소</button>
                            <button className="card-submit-btn" onClick={handleRequestConfirm}>저장</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}