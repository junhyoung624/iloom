import React, { useEffect, useMemo, useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import { useUserAssetStore } from '../store/useUserAssetStore'
import './scss/charge.scss'
import { useLocation, useNavigate } from 'react-router-dom'
import ChargeModal from './ChargeModal'
import { useKakaoPostcodePopup } from 'react-daum-postcode'
import { addOrder } from '../firebase/orderService'
import { storeInfoData } from '../data/storeInfoData'
import { store_region } from '../data/storeRegionCode'
import Select from 'react-select'
import { couponData } from '../data/couponData'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import toast from 'react-hot-toast'

const detectCardIssuer = (number = '') => {
    const n = number.replace(/\s/g, '')

    if (/^4/.test(n)) return 'visa'
    if (/^5[1-5]/.test(n)) return 'mastercard'
    if (/^3[47]/.test(n)) return 'amex'
    if (/^9/.test(n)) return 'local'

    return 'default'
}

const CARD_STYLES = {
    visa: {
        label: 'VISA',
        bg: ['#1a1f71', '#3b57ff'],
        textColor: '#fff',
    },
    mastercard: {
        label: 'Mastercard',
        bg: ['#eb001b', '#f79e1b'],
        textColor: '#fff',
    },
    amex: {
        label: 'AMEX',
        bg: ['#2e77bc', '#67b7dc'],
        textColor: '#fff',
    },
    local: {
        label: '국내카드',
        bg: ['#111', '#555'],
        textColor: '#fff',
    },
    default: {
        label: 'CARD',
        bg: ['#333', '#999'],
        textColor: '#fff',
    },
}

export default function Charge() {
    const { cartItems, items, onAddOrder, createDeliveryDate, onfetchItems } = useProductStore()
    const { user } = useAuthStore()
    const { iloomMoney = 0, iloomPoint = 0 } = useUserAssetStore()

    const navigate = useNavigate()
    const location = useLocation()
    const directBuyItem = location.state?.directBuyItem

    const [paymentMethod, setPaymentMethod] = useState('card')
    const [showMorePayment, setShowMorePayment] = useState(false)

    const [showCardForm, setShowCardForm] = useState(false)
    const [cardForm, setCardForm] = useState({
        name: '',
        number: '',
        month: '',
        year: '',
        cvv: '',
        sameAsShipping: false,
    })
    const [cardErrors, setCardErrors] = useState({})
    const [registeredCards, setRegisteredCards] = useState([])
    const [selectedCardIndex, setSelectedCardIndex] = useState(0)

    const [showPointModal, setShowPointModal] = useState(false)
    const [pointChargeAmount, setPointChargeAmount] = useState(0)

    const [showAddressModal, setShowAddressModal] = useState(false)
    const [addressForm, setAddressForm] = useState({
        name: '삼조네',
        address: '서울특별시 서초구 삼조숨조로길 33-33(3조건물) 303호',
        phone: user?.phone || '',
    })
    const [addressDraft, setAddressDraft] = useState({ ...addressForm })

    const [showRequestModal, setShowRequestModal] = useState(false)
    const [requestForm, setRequestForm] = useState({
        message: '도착하시기 전에 연락주시고, 직접 설치해주세요',
        entrance: '공동현관 비밀번호 (3030#)',
        elevator: '있음',
    })
    const [requestDraft, setRequestDraft] = useState({ ...requestForm })

    const [couponOpen, setCouponOpen] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState(null)

    const [useMoney, setUseMoney] = useState(0)
    const [moneyInput, setMoneyInput] = useState('')
    const [usePoint, setUsePoint] = useState(0)

    const [guestForm, setGuestForm] = useState({
        name: '',
        phone: '',
        email: '',
        zipCode: '',
        address: '',
        extraAddress: '',
        request: '',
        customRequest: '',
        visitRegionCode: '없음',
        visitStoreId: '',
    })

    const [errors, setErrors] = useState({})
    const [isAgree, setIsAgree] = useState(false)
    const [fieldStatus, setFieldStatus] = useState({
        phone: 'idle',
        email: 'idle',
    })

    const [confirmPay, setConfirmPay] = useState(false)

    useEffect(() => {
        onfetchItems()
    }, [])

    const regionOptions = [
        { value: '없음', label: '없음' },
        ...store_region
            .filter((r) => r.code !== 'default')
            .map((r) => ({
                value: r.code,
                label: r.name,
            })),
    ]

    const storeOptions = storeInfoData
        .filter((s) => s.region_code === guestForm.visitRegionCode)
        .map((s) => ({
            value: s.id,
            label: s.store_name,
        }))

    const selectedRegionOption =
        regionOptions.find((opt) => opt.value === guestForm.visitRegionCode) || null

    const selectedStoreOption =
        storeOptions.find((opt) => opt.value === guestForm.visitStoreId) || null

    const delivery_req_options = [
        { value: '', label: '배송 요청사항을 입력해주세요' },
        { value: '부재시 문앞에 놓아주세요.', label: '부재시 문앞에 놓아주세요.' },
        { value: '부재시 경비실에 맡겨 주세요.', label: '부재시 경비실에 맡겨 주세요.' },
        { value: '부재시 전화 또는 문자 주세요.', label: '부재시 전화 또는 문자 주세요.' },
        { value: '배송전에 연락주세요.', label: '배송전에 연락주세요.' },
        { value: '직접입력', label: '직접입력' },
    ]

    const selectedDeliveryReqOption =
        delivery_req_options.find((o) => o.value === guestForm.request) || delivery_req_options[0]

    const SCRIPT_URL = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    const open = useKakaoPostcodePopup(SCRIPT_URL)

    const handleComplete = (data) => {
        let fullAddress = data.address
        let extraAddress = ''

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname
            if (data.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''
        }

        setGuestForm((prev) => ({
            ...prev,
            zipCode: data.zonecode,
            address: fullAddress,
        }))

        setErrors((prev) => ({
            ...prev,
            zipCode: '',
            address: '',
        }))
    }

    const handlePopupClick = () => {
        open({ onComplete: handleComplete })
    }

    const validateLiveField = (name, value, isBlur = false) => {
        const trimmedValue = value.trim()
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        let message = ''
        let status = 'idle'

        if (name === 'email') {
            if (!trimmedValue) {
                message = isBlur ? '** 이메일이 필요합니다.' : ''
                status = isBlur ? 'error' : 'idle'
            } else if (!emailRegex.test(trimmedValue)) {
                message = '** 유효한 이메일 주소를 입력하세요.'
                status = 'error'
            } else {
                status = 'success'
            }
        }

        if (name === 'phone') {
            if (!trimmedValue) {
                message = isBlur ? '** 휴대폰 번호가 필요합니다.' : ''
                status = isBlur ? 'error' : 'idle'
            } else if (!phoneRegex.test(trimmedValue)) {
                message = '** 유효한 휴대폰 번호를 입력하세요.'
                status = 'error'
            } else {
                status = 'success'
            }
        }

        setErrors((prev) => ({
            ...prev,
            [name]: message,
        }))

        setFieldStatus((prev) => ({
            ...prev,
            [name]: status,
        }))
    }

    const handleGuestChange = (e) => {
        const { name, value } = e.target

        setGuestForm((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (name === 'phone' || name === 'email') {
            validateLiveField(name, value, false)
        } else {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
        }
    }

    const validateGuestForm = () => {
        const newErrors = {}
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!guestForm.name.trim()) newErrors.name = '** 이름을 입력해주세요.'

        if (!guestForm.phone.trim()) {
            newErrors.phone = '** 휴대폰 번호를 입력해주세요.'
        } else if (!phoneRegex.test(guestForm.phone.trim())) {
            newErrors.phone = '** 휴대폰 번호 형식이 올바르지 않습니다.'
        }

        if (!guestForm.email.trim()) {
            newErrors.email = '** 이메일을 입력해주세요.'
        } else if (!emailRegex.test(guestForm.email.trim())) {
            newErrors.email = '** 이메일 형식이 올바르지 않습니다.'
        }

        if (!guestForm.zipCode.trim()) newErrors.zipCode = '** 우편번호를 입력해주세요.'
        if (!guestForm.address.trim()) newErrors.address = '** 주소를 입력해주세요.'
        if (!guestForm.extraAddress.trim()) newErrors.extraAddress = '** 상세 주소를 입력해주세요.'

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const orderItems = useMemo(() => {
        if (directBuyItem) {
            const priceNumber = Number(
                String(directBuyItem.price).replace(/,/g, '').replace(/원/g, '')
            )

            return [
                {
                    ...directBuyItem,
                    priceNumber,
                    totalPrice: priceNumber * directBuyItem.qty,
                },
            ]
        }

        return cartItems
            .filter((cart) => cart.checked)
            .map((cart) => {
                const product = items.find((item) => String(item.id) === String(cart.id))
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
    }, [cartItems, items, directBuyItem])

    const totalPrice = useMemo(() => {
        return orderItems.reduce((acc, cur) => acc + cur.totalPrice, 0)
    }, [orderItems])

    const couponDiscount = useMemo(() => {
        if (!selectedCoupon) return 0
        if (totalPrice < selectedCoupon.minPrice) return 0
        if (selectedCoupon.type === 'fixed') return selectedCoupon.discount
        if (selectedCoupon.type === 'percent') {
            return Math.floor(totalPrice * selectedCoupon.discount / 100)
        }
        return 0
    }, [selectedCoupon, totalPrice])

    const finalPrice = useMemo(() => {
        return Math.max(totalPrice - couponDiscount - useMoney - usePoint, 0)
    }, [totalPrice, couponDiscount, useMoney, usePoint])

    const earnPoint = Math.floor(finalPrice * 0.01)

    const formatPrice = (price) => {
        const number = Number(price)
        if (Number.isNaN(number)) return '0원'
        return number.toLocaleString('ko-KR') + '원'
    }

    const handleCouponSelect = (coupon) => {
        if (selectedCoupon?.id === coupon.id) {
            setSelectedCoupon(null)
        } else if (totalPrice >= coupon.minPrice) {
            setSelectedCoupon(coupon)
        }

        setCouponOpen(false)
    }

    const handleMoneyApply = () => {
        const val = Number(moneyInput.replace(/,/g, ''))
        const max = Math.min(iloomMoney, totalPrice - couponDiscount - usePoint)

        setUseMoney(Math.min(val, max))
    }

    const handleMoneyAll = () => {
        const max = Math.min(iloomMoney, totalPrice - couponDiscount - usePoint)

        setUseMoney(max)
        setMoneyInput(max.toLocaleString())
    }

    const createOrderNumber = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const date = String(now.getDate()).padStart(2, '0')
        const random = Math.random().toString(36).slice(2, 8).toUpperCase()

        return `${year}${month}${date}-${random}`
    }

    const handlePayment = () => {
        if (orderItems.length === 0) return

        if (!user && !isAgree) {
            toast('개인정보 수집 및 이용에 동의해주세요')
            return
        }

        if (!user) {
            const isValid = validateGuestForm()

            if (!isValid) {
                toast('필수 정보를 올바르게 입력해주세요.')
                return
            }
        }

        if (paymentMethod === 'iloom' && iloomPoint < finalPrice) {
            toast('보유 포인트가 부족합니다. 포인트를 충전해주세요.')
            return
        }

        setConfirmPay(true)
    }

    const handleClosePopup = () => {
        setConfirmPay(false)
    }

    const handleFinalConfirm = async () => {
        const orderNumber = createOrderNumber()
        const formatGuestPhone = guestForm.phone.replace(/-/g, '')
        const deliveryDate = createDeliveryDate()
        const finalRequest =
            guestForm.request === '직접입력' ? guestForm.customRequest : guestForm.request

        const commonOrderData = {
            orderId: orderNumber,
            orderNumber,
            status: '결제완료',
            paymentMethod,
            deliveryInfo: {
                carrier: '일룸 배송팀',
                trackingNumber: '준비중',
                estimatedDate: deliveryDate,
            },
            items: orderItems.map((item) => ({
                id: item.id,
                name: item.name,
                series: item.series || '',
                color: item.color || '',
                qty: item.qty,
                price: item.priceNumber,
                productImages: item.productImages || [],
            })),
            total: finalPrice,
        }

        const orderData = user
            ? {
                ...commonOrderData,
                isGuest: false,
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                userInfo: {
                    name: user.name || '',
                    phone: user.phone || '',
                    email: user.email || '',
                },
            }
            : {
                ...commonOrderData,
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
            }

        try {
            onAddOrder(orderData, user)
            await addOrder(orderData)

            toast(`결제가 완료되었습니다. 주문번호는 ${orderNumber} 입니다.`)

            user ? navigate('/order') : navigate(`/orderForGuest/${orderNumber}`)
        } catch (err) {
            console.log(err)
            toast('주문 저장 중 오류가 발생했습니다.')
        }
    }

    const handleCardChange = (e) => {
        const { name, value, type, checked } = e.target

        setCardForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))

        setCardErrors((prev) => ({
            ...prev,
            [name]: '',
        }))
    }

    const validateCardForm = () => {
        const errs = {}

        if (!cardForm.name.trim()) {
            errs.name = '카드 소유자 이름을 입력해주세요.'
        }

        if (!/^\d{16}$/.test(cardForm.number.replace(/\s/g, ''))) {
            errs.number = '16자리 카드 번호를 입력해주세요.'
        }

        if (!cardForm.month) {
            errs.month = '월을 선택해주세요.'
        }

        if (!cardForm.year) {
            errs.year = '연도를 선택해주세요.'
        }

        if (!/^\d{3,4}$/.test(cardForm.cvv)) {
            errs.cvv = 'CVV를 입력해주세요.'
        }

        setCardErrors(errs)

        return Object.keys(errs).length === 0
    }

    const handleCardSubmit = () => {
        if (!validateCardForm()) return

        const newCard = {
            name: cardForm.name,
            number: cardForm.number,
            month: cardForm.month,
            year: cardForm.year,
        }

        setRegisteredCards((prev) => [...prev, newCard])
        setSelectedCardIndex(registeredCards.length)

        setShowCardForm(false)

        setCardForm({
            name: '',
            number: '',
            month: '',
            year: '',
            cvv: '',
            sameAsShipping: false,
        })

        toast('카드가 등록되었습니다.')
    }

    const handleOpenAddress = () => {
        setAddressDraft({ ...addressForm })
        setShowAddressModal(true)
    }

    const handleAddressConfirm = () => {
        setAddressForm({ ...addressDraft })
        setShowAddressModal(false)
    }

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

                                            <button
                                                type="button"
                                                className="mini-btn"
                                                onClick={handleOpenAddress}
                                            >
                                                변경
                                            </button>
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

                                            <button
                                                type="button"
                                                className="mini-btn"
                                                onClick={handleOpenRequest}
                                            >
                                                수정
                                            </button>
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
                                            <p className="fwBd underline">
                                                원칙적으로 개인정보 수집 및 이용목적이 달성된 후에 해당 정보를 지체 없이 파기합니다.
                                            </p>
                                            <p className="fwBd underline">
                                                단, 관계법령의 규정에 의하여 필요가 있는 경우 일정기간 동안 개인정보를 보관할 수 있습니다.
                                            </p>
                                            <p>
                                                귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다.
                                                단, 거부하는 경우 상품 구매가 불가능합니다.
                                            </p>
                                            <p>
                                                <br />
                                                그 밖의 사항은 일룸 개인정보처리방침을 준수합니다.
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="agree-checkbox"
                                        onClick={() => setIsAgree((prev) => !prev)}
                                    >
                                        <img
                                            src={
                                                isAgree
                                                    ? './images/logo-icon/order-isChecked-true.png'
                                                    : './images/logo-icon/order-isChecked-false.png'
                                            }
                                            alt="동의 체크"
                                        />
                                        <span>비회원 구매 약관에 동의합니다.</span>
                                    </div>
                                </div>

                                <div className="delivery-info-area">
                                    <div className="title">비회원 주문정보</div>

                                    <form className="user-form">
                                        <div className="unlogged-charge-section unlogged-area-left">
                                            <h3 className="section-title">주문자 정보</h3>

                                            <div className="info-table unlogged-addr-area">
                                                <div className="info-row input-zone">
                                                    <p className="unlogged-requisite-info">주문자명</p>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        onChange={handleGuestChange}
                                                        value={guestForm.name}
                                                        className="unlogged_input"
                                                        required
                                                    />
                                                    {errors.name && (
                                                        <p className="error-text error-text-right">
                                                            {errors.name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="info-row input-zone">
                                                    <p className="unlogged-requisite-info">휴대폰</p>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        onChange={handleGuestChange}
                                                        onBlur={(e) =>
                                                            validateLiveField(e.target.name, e.target.value, true)
                                                        }
                                                        value={guestForm.phone}
                                                        className={`unlogged_input ${fieldStatus.phone}`}
                                                        required
                                                    />
                                                    {errors.phone && (
                                                        <p className="error-text error-text-right">
                                                            {errors.phone}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="info-row input-zone">
                                                    <p className="unlogged-requisite-info">이메일</p>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        onChange={handleGuestChange}
                                                        onBlur={(e) =>
                                                            validateLiveField(e.target.name, e.target.value, true)
                                                        }
                                                        value={guestForm.email}
                                                        className={`unlogged_input ${fieldStatus.email}`}
                                                        required
                                                    />
                                                    {errors.email && (
                                                        <p className="error-text error-text-right">
                                                            {errors.email}
                                                        </p>
                                                    )}
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
                                                                className="store-select"
                                                                options={regionOptions}
                                                                value={selectedRegionOption}
                                                                placeholder="지역 선택"
                                                                onChange={(selected) =>
                                                                    setGuestForm((prev) => ({
                                                                        ...prev,
                                                                        visitRegionCode: selected?.value || '없음',
                                                                        visitStoreId: '',
                                                                    }))
                                                                }
                                                            />

                                                            {guestForm.visitRegionCode !== '없음' && (
                                                                <Select
                                                                    className="store-select"
                                                                    options={storeOptions}
                                                                    value={selectedStoreOption}
                                                                    placeholder="매장 선택"
                                                                    isSearchable
                                                                    onChange={(selected) =>
                                                                        setGuestForm((prev) => ({
                                                                            ...prev,
                                                                            visitStoreId: selected?.value || '',
                                                                        }))
                                                                    }
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
                                                            <p className="search-addr-wrap">
                                                                <span className="unlogged-requisite-info">배송지 조회</span>
                                                                <span>
                                                                    {' '}
                                                                    (* 울릉도 지역은 온라인 주문이 불가하오니, 대리점에 직접 방문해주세요.)
                                                                </span>
                                                            </p>

                                                            <div className="inner">
                                                                <input
                                                                    type="text"
                                                                    value={guestForm.zipCode}
                                                                    placeholder="우편번호"
                                                                    className="zipcode-input unlogged_input"
                                                                    readOnly
                                                                    required
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={handlePopupClick}
                                                                >
                                                                    우편번호 찾기
                                                                </button>
                                                            </div>

                                                            {errors.zipCode && (
                                                                <p className="error-text">{errors.zipCode}</p>
                                                            )}
                                                        </div>

                                                        <div className="fixed-addr-area input-zone">
                                                            <p className="unlogged-requisite-info">주소</p>
                                                            <input
                                                                type="text"
                                                                value={guestForm.address}
                                                                placeholder="주소"
                                                                className="addr-input unlogged_input"
                                                                readOnly
                                                                required
                                                            />
                                                            {errors.address && (
                                                                <p className="error-text">{errors.address}</p>
                                                            )}
                                                        </div>

                                                        <div className="extra-addr-info input-zone">
                                                            <p className="extra-addr-wrap">
                                                                <span className="unlogged-requisite-info">상세 주소</span>
                                                                <span>
                                                                    (도로명 주소를 제외한 상세 주소만 입력해주세요)
                                                                </span>
                                                            </p>
                                                            <input
                                                                type="text"
                                                                name="extraAddress"
                                                                onChange={handleGuestChange}
                                                                value={guestForm.extraAddress}
                                                                className="exta-addr-input unlogged_input"
                                                                required
                                                            />
                                                            {errors.extraAddress && (
                                                                <p className="error-text">{errors.extraAddress}</p>
                                                            )}
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
                                                                    color: state.data.value === '' ? '#aaa' : '#333',
                                                                }),
                                                            }}
                                                            onChange={(selected) =>
                                                                setGuestForm((prev) => ({
                                                                    ...prev,
                                                                    request: selected?.value || '',
                                                                    customRequest: '',
                                                                }))
                                                            }
                                                        />

                                                        {guestForm.request === '직접입력' && (
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

                                    <div className="col-price">{formatPrice(item.priceNumber)}</div>
                                    <div className="col-qty">{item.qty}</div>
                                    <div className="col-total">{formatPrice(item.totalPrice)}</div>
                                    <div className="col-status">{item.deliveryType || '택배'}</div>
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
                    <h3 className="section-title">할인 · 쿠폰</h3>

                    <div className="discount-section">
                        <div className="discount-row">
                            <span className="discount-label">할인쿠폰</span>

                            <div className="discount-content">
                                <div className="coupon-select-area">
                                    <button
                                        type="button"
                                        className="coupon-select-btn"
                                        onClick={() => setCouponOpen((v) => !v)}
                                    >
                                        {selectedCoupon ? (
                                            <span className="coupon-selected-name">
                                                {selectedCoupon.name}
                                            </span>
                                        ) : (
                                            <span className="coupon-placeholder">
                                                쿠폰을 선택해주세요
                                            </span>
                                        )}

                                        <span className="coupon-count-badge">
                                            {couponData.length}장
                                        </span>

                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                transform: couponOpen ? 'rotate(180deg)' : 'none',
                                                transition: '0.2s',
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {selectedCoupon && (
                                        <span className="coupon-discount-amount">
                                            − {formatPrice(couponDiscount)}
                                        </span>
                                    )}
                                </div>

                                {couponOpen && (
                                    <ul className="coupon-dropdown">
                                        <li
                                            className={`coupon-dropdown-item ${!selectedCoupon ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedCoupon(null)
                                                setCouponOpen(false)
                                            }}
                                        >
                                            <div className="coupon-item-info">
                                                <p className="coupon-item-name">쿠폰 사용 안함</p>
                                            </div>
                                        </li>

                                        {couponData.map((coupon) => {
                                            const isApplicable = totalPrice >= Number(coupon.minPrice || 0)

                                            const previewDiscount = (() => {
                                                if (!isApplicable) return 0

                                                if (coupon.type === 'fixed') {
                                                    return Number(coupon.discount || 0)
                                                }

                                                if (coupon.type === 'percent') {
                                                    const calc = Math.floor(totalPrice * Number(coupon.discount || 0) / 100)
                                                    const maxDiscount = Number(coupon.maxDiscount || 0)

                                                    return maxDiscount > 0 ? Math.min(calc, maxDiscount) : calc
                                                }

                                                return 0
                                            })()

                                            const maxDiscountText = coupon.maxDiscount
                                                ? `최대 ${Number(coupon.maxDiscount).toLocaleString()}원`
                                                : null

                                            return (
                                                <li
                                                    key={coupon.id}
                                                    className={`coupon-dropdown-item ${selectedCoupon?.id === coupon.id ? 'active' : ''} ${!isApplicable ? 'disabled' : ''}`}
                                                    onClick={() => handleCouponSelect(coupon)}
                                                >
                                                    <div className="coupon-item-left">
                                                        <span className="coupon-item-discount">
                                                            {coupon.type === 'fixed'
                                                                ? `${Number(coupon.discount || 0).toLocaleString()}원`
                                                                : `${coupon.discount}%`
                                                            }
                                                        </span>

                                                        <div className="coupon-item-info">
                                                            <p className="coupon-item-name">{coupon.name}</p>

                                                            <p className="coupon-item-desc">
                                                                {coupon.desc} · {Number(coupon.minPrice || 0).toLocaleString()}원 이상 구매 시
                                                            </p>

                                                            {coupon.type === 'percent' && (
                                                                <p className="coupon-item-preview">
                                                                    {isApplicable
                                                                        ? maxDiscountText
                                                                            ? `현재 ${previewDiscount.toLocaleString()}원 할인 · ${maxDiscountText}`
                                                                            : `현재 ${previewDiscount.toLocaleString()}원 할인`
                                                                        : maxDiscountText || `${coupon.discount}% 즉시 할인`
                                                                    }
                                                                </p>
                                                            )}

                                                            <p className="coupon-item-expiry">~ {coupon.expiry}</p>
                                                        </div>
                                                    </div>

                                                    {!isApplicable && (
                                                        <span className="coupon-item-unavail">조건 미충족</span>
                                                    )}

                                                    {selectedCoupon?.id === coupon.id && (
                                                        <span className="coupon-item-check">✓</span>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="discount-row">
                            <span className="discount-label">일룸머니</span>

                            <div className="discount-content">
                                <div className="money-row">
                                    <div className="money-input-wrap">
                                        <input
                                            type="text"
                                            className="money-input"
                                            value={moneyInput}
                                            onChange={(e) =>
                                                setMoneyInput(e.target.value.replace(/[^0-9]/g, ''))
                                            }
                                            placeholder="0"
                                        />

                                        <span className="money-unit">원</span>

                                        <button
                                            type="button"
                                            className="money-apply-btn"
                                            onClick={handleMoneyApply}
                                        >
                                            적용
                                        </button>

                                        <button
                                            type="button"
                                            className="money-all-btn"
                                            onClick={handleMoneyAll}
                                        >
                                            전액사용
                                        </button>
                                    </div>

                                    {useMoney > 0 && (
                                        <span className="coupon-discount-amount">
                                            − {formatPrice(useMoney)}
                                        </span>
                                    )}
                                </div>

                                <div className="money-info-row">
                                    <span>보유 일룸머니</span>
                                    <strong>{iloomMoney.toLocaleString()}원</strong>
                                </div>
                            </div>
                        </div>

                        <div className="discount-summary">
                            <div className="discount-summary-row">
                                <span>상품금액</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>

                            {couponDiscount > 0 && (
                                <div className="discount-summary-row minus">
                                    <span>쿠폰 할인</span>
                                    <span>− {formatPrice(couponDiscount)}</span>
                                </div>
                            )}

                            {useMoney > 0 && (
                                <div className="discount-summary-row minus">
                                    <span>일룸머니 사용</span>
                                    <span>− {formatPrice(useMoney)}</span>
                                </div>
                            )}

                            <div className="discount-summary-row total">
                                <span>최종 결제금액</span>
                                <strong className="discount-final-price">
                                    {formatPrice(finalPrice)}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="charge-section">
                    <h3 className="section-title">
                        iloom머니 혜택
                        <span className="point-max-badge">
                            최대 {Math.floor(finalPrice * 0.015).toLocaleString()}P
                        </span>
                    </h3>

                    <div className="point-section">
                        <div className="point-row">
                            <span className="point-row-label">구매적립 </span>

                            <div className="point-row-right">
                                <span className="point-earn">
                                    총 {earnPoint.toLocaleString()}P
                                </span>

                                <div className="point-sub-row">
                                    <span>기본적립</span>
                                    <span>{earnPoint.toLocaleString()}P</span>
                                </div>
                            </div>
                        </div>

                        <div className="point-row">
                            <span className="point-row-label">리뷰적립 </span>

                            <div className="point-row-right">
                                <span className="point-earn">
                                    최대 {Math.floor(finalPrice * 0.005).toLocaleString()}P
                                </span>

                                <div className="point-sub-row">
                                    <span>사진·동영상 리뷰 작성 시</span>
                                    <span className="point-green">
                                        +{Math.floor(finalPrice * 0.005).toLocaleString()}P
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="point-notice">
                            * 동일 상품/한달 리뷰 적립은 각 1회로 제한
                        </p>
                    </div>
                </div>

                <div className="charge-section">
                    <h3 className="section-title">
                        결제 수단
                        <span className="section-title-price">
                            {formatPrice(finalPrice)}
                        </span>
                    </h3>

                    <div className="payment-wrap">
                        <div
                            className={`payment-option-box ${paymentMethod === 'iloom' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('iloom')}
                        >
                            <div className="payment-option-row">
                                <div className="payment-radio">
                                    <div className={`radio-dot ${paymentMethod === 'iloom' ? 'on' : ''}`} />
                                </div>

                                <div className="payment-option-info">
                                    <span className="payment-option-label">
                                        일룸포인트 충전결제
                                    </span>
                                    <span className="payment-option-sub point-green">
                                        보유 {(iloomPoint || 0).toLocaleString()}P
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="point-charge-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowPointModal(true)
                                    }}
                                >
                                    충전하기
                                </button>
                            </div>
                        </div>

                        <div
                            className={`payment-option-box ${paymentMethod === 'card' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <div className="payment-option-row">
                                <div className="payment-radio">
                                    <div className={`radio-dot ${paymentMethod === 'card' ? 'on' : ''}`} />
                                </div>

                                <span className="payment-option-label">
                                    카드 간편결제
                                </span>
                            </div>

                            {paymentMethod === 'card' && (
                                <div
                                    className="card-slider-section"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {registeredCards.length > 0 ? (
                                        <>
                                            <Swiper
                                                slidesPerView={1.7}
                                                spaceBetween={12}
                                                className="credit-card-swiper"
                                                onSlideChange={(swiper) =>
                                                    setSelectedCardIndex(swiper.activeIndex)
                                                }
                                            >
                                                {registeredCards.map((card, idx) => {
                                                    const issuer = detectCardIssuer(card.number)
                                                    const style = CARD_STYLES[issuer]
                                                    const isSelected = selectedCardIndex === idx

                                                    return (
                                                        <SwiperSlide key={`${card.number}-${idx}`}>
                                                            <div
                                                                className={`card-list-item ${isSelected ? 'selected' : ''}`}
                                                                onClick={() => setSelectedCardIndex(idx)}
                                                            >
                                                                <div
                                                                    className="card-list-thumb"
                                                                    style={{
                                                                        background: `linear-gradient(135deg, ${style.bg[0]}, ${style.bg[1]})`,
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            color: style.textColor,
                                                                            fontSize: 10,
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        {style.label}
                                                                    </span>
                                                                    <div className="card-list-thumb-chip" />
                                                                </div>

                                                                <div className="card-list-info">
                                                                    <p className="card-list-name">
                                                                        {style.label}
                                                                    </p>

                                                                    <p className="card-list-number">
                                                                        신용 · {card.number.replace(/\s/g, '').slice(-4)}
                                                                    </p>

                                                                    <select
                                                                        className="card-installment-select"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <option>일시불</option>
                                                                        <option>2개월</option>
                                                                        <option>3개월</option>
                                                                        <option>6개월</option>
                                                                        <option>12개월</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>
                                                    )
                                                })}

                                                <SwiperSlide>
                                                    <button
                                                        type="button"
                                                        className="card-add-btn"
                                                        onClick={() => setShowCardForm(true)}
                                                    >
                                                        <svg
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>

                                                        <span>카드 추가</span>
                                                    </button>
                                                </SwiperSlide>
                                            </Swiper>

                                            <div className="card-benefit-banner">
                                                <span>최대 5% 적립 + 일룸 제휴 혜택</span>

                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="card-register-btn"
                                            onClick={() => setShowCardForm(true)}
                                        >
                                            + 카드 등록
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="payment-more-btn"
                            onClick={() => setShowMorePayment((v) => !v)}
                        >
                            다른 결제수단 보기

                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    transform: showMorePayment ? 'rotate(180deg)' : 'none',
                                    transition: '0.2s',
                                }}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {showMorePayment && (
                            <div className="payment-more-wrap">
                                <div className="simplepay-grid">
                                    {[
                                        {
                                            key: 'naverpay',
                                            name: '네이버페이',
                                            sub: '포인트 최대 2% 적립',
                                            logoSrc: './images/logo-icon/npay.png',
                                            accent: '#03c75a',
                                            textDark: true,
                                        },
                                        {
                                            key: 'kakaopay',
                                            name: '카카오페이',
                                            sub: '카카오머니 즉시결제',
                                            logoSrc: './images/logo-icon/kakaopay.png',
                                            accent: '#fee500',
                                            textDark: true,
                                        },
                                        {
                                            key: 'tosspay',
                                            name: '토스페이',
                                            sub: '간편하게 1초 결제',
                                            logoSrc: './images/logo-icon/tosspay.png',
                                            accent: '#0064ff',
                                            textDark: false,
                                        },
                                    ].map((pay) => {
                                        const isActive = paymentMethod === pay.key
                                        return (
                                            <button
                                                key={pay.key}
                                                type="button"
                                                className={`simplepay-card ${isActive ? 'active' : ''}`}
                                                onClick={() => setPaymentMethod(pay.key)}
                                                style={{ '--accent': pay.accent }}
                                            >
                                                {/* 선택 체크 */}
                                                <div className={`simplepay-radio ${isActive ? 'on' : ''}`}>
                                                    {isActive && (
                                                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* 로고 */}
                                                <div className="simplepay-logo-wrap">
                                                    <img src={pay.logoSrc} alt={pay.name} className="simplepay-logo" />
                                                </div>

                                                {/* 텍스트 */}
                                                <div className="simplepay-text-wrap">
                                                    <p className={`simplepay-name ${pay.textDark ? 'dark' : 'light'}`}>
                                                        {pay.name}
                                                    </p>
                                                    <p className={`simplepay-sub ${pay.textDark ? 'dark' : 'light'}`}>
                                                        {pay.sub}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="payment-notice">
                        <p>
                            1. 고객의 단순한 변심으로 인한 교환, 반품 및 환불을 요구할 때
                            수반되는 배송비는 고객님께서 부담하셔야합니다.
                        </p>
                        <p>
                            2. 상품을 개봉했거나 설치한 후에는 상품의 재판매가 불가능하므로
                            고객님의 변심에 대한 교환, 반품이 불가능함을 양지해 주시기 바랍니다.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="payment-btn"
                        disabled={orderItems.length === 0}
                        onClick={handlePayment}
                    >
                        {formatPrice(finalPrice)} 결제하기
                    </button>
                </div>
            </div>

            {confirmPay && (
                <ChargeModal
                    onClose={handleClosePopup}
                    onConfirm={handleFinalConfirm}
                />
            )}

            {showPointModal && (
                <div
                    className="card-modal-overlay"
                    onClick={() => setShowPointModal(false)}
                >
                    <div
                        className="card-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-modal-header">
                            <h3>일룸포인트 충전</h3>
                            <p className="card-modal-desc">
                                포인트를 충전하여 즉시 사용하세요
                            </p>

                            <button
                                type="button"
                                className="card-modal-close"
                                onClick={() => setShowPointModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="card-modal-body">
                            <div className="point-modal-balance">
                                <span>현재 보유 포인트</span>
                                <strong style={{ color: '#CA1230' }}>
                                    {(iloomPoint || 0).toLocaleString()}P
                                </strong>
                            </div>

                            <div className="card-field">
                                <label>충전 금액 선택</label>

                                <div className="point-charge-grid">
                                    {[5000, 10000, 30000, 50000, 100000].map((amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            className={`point-charge-amount-btn ${pointChargeAmount === amount ? 'active' : ''}`}
                                            onClick={() => setPointChargeAmount(amount)}
                                        >
                                            {amount.toLocaleString()}원
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="card-field">
                                <label>직접 입력</label>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        type="text"
                                        placeholder="충전할 금액 입력"
                                        value={pointChargeAmount ? pointChargeAmount.toLocaleString() : ''}
                                        onChange={(e) => {
                                            const val = Number(e.target.value.replace(/,/g, ''))

                                            if (!Number.isNaN(val)) {
                                                setPointChargeAmount(val)
                                            }
                                        }}
                                        style={{ flex: 1 }}
                                    />

                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: 14,
                                            color: '#555',
                                        }}
                                    >
                                        원
                                    </span>
                                </div>
                            </div>

                            <div className="card-field">
                                <label>충전 결제수단</label>

                                <select
                                    style={{
                                        height: 42,
                                        padding: '0 12px',
                                        border: '1px solid #ddd',
                                        fontSize: 14,
                                        outline: 'none',
                                    }}
                                >
                                    <option>신용카드</option>
                                    <option>계좌이체</option>
                                    <option>네이버페이</option>
                                    <option>카카오페이</option>
                                    <option>토스페이</option>
                                </select>
                            </div>

                            <div className="point-modal-notice">
                                <p>· 충전된 포인트는 즉시 사용 가능합니다</p>
                                <p>· 포인트 유효기간은 충전일로부터 5년입니다</p>
                                <p>· 미사용 포인트는 환불 신청 가능합니다</p>
                            </div>
                        </div>

                        <div className="card-modal-footer">
                            <button
                                type="button"
                                className="card-cancel-btn"
                                onClick={() => setShowPointModal(false)}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                className="card-submit-btn"
                                onClick={() => {
                                    if (!pointChargeAmount || pointChargeAmount < 1000) {
                                        toast('최소 1,000원 이상 충전 가능합니다')
                                        return
                                    }

                                    toast(`${pointChargeAmount.toLocaleString()}P 충전이 완료되었습니다!`)
                                    setShowPointModal(false)
                                    setPointChargeAmount(0)
                                }}
                            >
                                {pointChargeAmount
                                    ? `${pointChargeAmount.toLocaleString()}원 충전하기`
                                    : '충전하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCardForm && (
                <div
                    className="card-modal-overlay"
                    onClick={() => setShowCardForm(false)}
                >
                    <div
                        className="card-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-modal-header">
                            <h3>결제 수단</h3>
                            <p className="card-modal-desc">
                                모든 거래는 안전하게 암호화됩니다
                            </p>

                            <button
                                type="button"
                                className="card-modal-close"
                                onClick={() => setShowCardForm(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="card-modal-body">
                            <div className="card-field">
                                <label>카드 소유자 이름</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={cardForm.name}
                                    onChange={handleCardChange}
                                    placeholder="홍길동"
                                />
                                {cardErrors.name && (
                                    <p className="card-error">{cardErrors.name}</p>
                                )}
                            </div>

                            <div className="card-field">
                                <label>카드 번호</label>
                                <input
                                    type="text"
                                    name="number"
                                    value={cardForm.number}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16)
                                        const formatted = val.replace(/(.{4})/g, '$1 ').trim()

                                        setCardForm((prev) => ({
                                            ...prev,
                                            number: formatted,
                                        }))

                                        setCardErrors((prev) => ({
                                            ...prev,
                                            number: '',
                                        }))
                                    }}
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={19}
                                />
                                {cardErrors.number && (
                                    <p className="card-error">{cardErrors.number}</p>
                                )}
                            </div>

                            <div className="card-field-row">
                                <div className="card-field">
                                    <label>유효기간</label>

                                    <div className="card-expiry">
                                        <select
                                            name="month"
                                            value={cardForm.month}
                                            onChange={handleCardChange}
                                        >
                                            <option value="">MM</option>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option
                                                    key={i + 1}
                                                    value={String(i + 1).padStart(2, '0')}
                                                >
                                                    {String(i + 1).padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            name="year"
                                            value={cardForm.year}
                                            onChange={handleCardChange}
                                        >
                                            <option value="">YYYY</option>
                                            {Array.from({ length: 10 }, (_, i) => (
                                                <option key={i} value={2025 + i}>
                                                    {2025 + i}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {(cardErrors.month || cardErrors.year) && (
                                        <p className="card-error">
                                            유효기간을 선택해주세요.
                                        </p>
                                    )}
                                </div>

                                <div className="card-field">
                                    <label>CVV</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        value={cardForm.cvv}
                                        onChange={handleCardChange}
                                        placeholder="···"
                                        maxLength={4}
                                    />
                                    {cardErrors.cvv && (
                                        <p className="card-error">{cardErrors.cvv}</p>
                                    )}
                                </div>
                            </div>

                            <div className="card-field-separator">청구지 주소</div>
                            <p className="card-field-desc">
                                결제 수단과 연결된 청구지 주소입니다
                            </p>

                            <div className="card-field card-field-check">
                                <input
                                    type="checkbox"
                                    id="sameAsShipping"
                                    name="sameAsShipping"
                                    checked={cardForm.sameAsShipping}
                                    onChange={handleCardChange}
                                />
                                <label htmlFor="sameAsShipping">
                                    배송지 주소와 동일
                                </label>
                            </div>
                        </div>

                        <div className="card-modal-footer">
                            <button
                                type="button"
                                className="card-cancel-btn"
                                onClick={() => setShowCardForm(false)}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                className="card-submit-btn"
                                onClick={handleCardSubmit}
                            >
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddressModal && (
                <div
                    className="card-modal-overlay"
                    onClick={() => setShowAddressModal(false)}
                >
                    <div
                        className="card-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-modal-header">
                            <h3>배송지 변경</h3>
                            <p className="card-modal-desc">
                                받으실 분의 배송 정보를 입력해주세요
                            </p>

                            <button
                                type="button"
                                className="card-modal-close"
                                onClick={() => setShowAddressModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="card-modal-body">
                            <div className="card-field">
                                <label>받으시는 분</label>
                                <input
                                    type="text"
                                    value={addressDraft.name}
                                    onChange={(e) =>
                                        setAddressDraft((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="이름을 입력해주세요"
                                />
                            </div>

                            <div className="card-field">
                                <label>배송지 주소</label>
                                <input
                                    type="text"
                                    value={addressDraft.address}
                                    onChange={(e) =>
                                        setAddressDraft((prev) => ({
                                            ...prev,
                                            address: e.target.value,
                                        }))
                                    }
                                    placeholder="경기 성남시 분당구 정자일로 95"
                                />
                            </div>

                            <div className="card-field">
                                <label>연락처</label>
                                <input
                                    type="text"
                                    value={addressDraft.phone}
                                    onChange={(e) =>
                                        setAddressDraft((prev) => ({
                                            ...prev,
                                            phone: e.target.value,
                                        }))
                                    }
                                    placeholder="010-0000-0000"
                                />
                            </div>
                        </div>

                        <div className="card-modal-footer">
                            <button
                                type="button"
                                className="card-cancel-btn"
                                onClick={() => setShowAddressModal(false)}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                className="card-submit-btn"
                                onClick={handleAddressConfirm}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRequestModal && (
                <div
                    className="card-modal-overlay"
                    onClick={() => setShowRequestModal(false)}
                >
                    <div
                        className="card-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-modal-header">
                            <h3>배송 요청사항 수정</h3>
                            <p className="card-modal-desc">
                                배송 시 요청사항을 입력해주세요
                            </p>

                            <button
                                type="button"
                                className="card-modal-close"
                                onClick={() => setShowRequestModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="card-modal-body">
                            <div className="card-field">
                                <label>배송 메시지</label>
                                <input
                                    type="text"
                                    value={requestDraft.message}
                                    onChange={(e) =>
                                        setRequestDraft((prev) => ({
                                            ...prev,
                                            message: e.target.value,
                                        }))
                                    }
                                    placeholder="배송 요청사항을 입력해주세요"
                                />
                            </div>

                            <div className="card-field">
                                <label>공동현관 출입 방법</label>
                                <input
                                    type="text"
                                    value={requestDraft.entrance}
                                    onChange={(e) =>
                                        setRequestDraft((prev) => ({
                                            ...prev,
                                            entrance: e.target.value,
                                        }))
                                    }
                                    placeholder="공동현관 비밀번호 또는 출입 방법"
                                />
                            </div>

                            <div className="card-field">
                                <label>엘리베이터 유무</label>
                                <select
                                    value={requestDraft.elevator}
                                    onChange={(e) =>
                                        setRequestDraft((prev) => ({
                                            ...prev,
                                            elevator: e.target.value,
                                        }))
                                    }
                                >
                                    <option value="있음">있음</option>
                                    <option value="없음">없음</option>
                                </select>
                            </div>
                        </div>

                        <div className="card-modal-footer">
                            <button
                                type="button"
                                className="card-cancel-btn"
                                onClick={() => setShowRequestModal(false)}
                            >
                                취소
                            </button>

                            <button
                                type="button"
                                className="card-submit-btn"
                                onClick={handleRequestConfirm}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>

            )}
        </section>
    )
}