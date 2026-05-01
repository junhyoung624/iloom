import { useEffect, useMemo, useState } from 'react'
import { useProductStore } from '../store/useProductStore'
import { useAuthStore } from '../store/useAuthStore'
import { useUserAssetStore } from '../store/useUserAssetStore'
import './scss/charge.scss'
import { useLocation, useNavigate } from 'react-router-dom'
import { useKakaoPostcodePopup } from 'react-daum-postcode'
import { addOrder } from '../firebase/orderService'
import { storeInfoData } from '../data/storeInfoData'
import { store_region } from '../data/storeRegionCode'
import { couponData } from '../data/couponData'
import NumberFlow from '@number-flow/react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

import ChargeModal from './ChargeModal'
import OrdererInfo from '../components/OrdererInfo'
import DeliveryInfo from '../components/DeliveryInfo'
import GuestAgreement from '../components/GuestAgreement'
import GuestOrderForm from '../components/GuestOrderForm'
import OrderProductList from '../components/OrderProductList'
import CouponSection from '../components/CouponSection'
import MoneySection from '../components/MoneySection'
import PointBenefitSection from '../components/PointBenefitSection'
import PaymentMethodSection from '../components/PaymentMethodSection'
import PaymentSummaryBar from '../components/PaymentSummaryBar'
import CardRegisterModal from '../components/CardRegisterModal'
import AddressModal from '../components/AddressModal'
import RequestModal from '../components/RequestModal'
import PointChargeModal from '../components/PointChargeModal'

export default function Charge() {
    const { cartItems, items, onAddOrder, createDeliveryDate, onfetchItems } = useProductStore()
    const { user } = useAuthStore()
    const { iloomMoney = 0, iloomPoint = 0 } = useUserAssetStore()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const directBuyItem = location.state?.directBuyItem

    // ── 결제 수단 ──────────────────────────────────────────────
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [showMorePayment, setShowMorePayment] = useState(false)

    // ── 카드 ───────────────────────────────────────────────────
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

    // ── 포인트 충전 모달 ───────────────────────────────────────
    const [showPointModal, setShowPointModal] = useState(false)

    // ── 배송지 모달 ────────────────────────────────────────────
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [addressForm, setAddressForm] = useState({
        name: '삼조네',
        address: '서울특별시 서초구 삼조숨조로길 33-33(3조건물) 303호',
        phone: user?.phone || '',
    })
    const [addressDraft, setAddressDraft] = useState({ ...addressForm })

    // ── 배송 요청사항 모달 ─────────────────────────────────────
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [requestForm, setRequestForm] = useState({
        message: '도착하시기 전에 연락주시고, 직접 설치해주세요',
        entrance: '공동현관 비밀번호 (3030#)',
        elevator: '있음',
    })
    const [requestDraft, setRequestDraft] = useState({ ...requestForm })

    // ── 쿠폰 ───────────────────────────────────────────────────
    const [couponOpen, setCouponOpen] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState(null)

    // ── 일룸머니 ───────────────────────────────────────────────
    const [useMoney, setUseMoney] = useState(0)
    const [moneyInput, setMoneyInput] = useState('')
    const [usePoint, setUsePoint] = useState(0)

    // ── 비회원 폼 ──────────────────────────────────────────────
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
    const [fieldStatus, setFieldStatus] = useState({ phone: 'idle', email: 'idle' })

    // ── 최종 결제 확인 모달 ────────────────────────────────────
    const [confirmPay, setConfirmPay] = useState(false)

    useEffect(() => {
        onfetchItems()
    }, [])

    // ── Select 옵션 ────────────────────────────────────────────
    const regionOptions = [
        { value: '없음', label: '없음' },
        ...store_region
            .filter((r) => r.code !== 'default')
            .map((r) => ({ value: r.code, label: r.name })),
    ]

    const storeOptions = storeInfoData
        .filter((s) => s.region_code === guestForm.visitRegionCode)
        .map((s) => ({ value: s.id, label: s.store_name }))

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

    // ── 카카오 주소 검색 ───────────────────────────────────────
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

        setGuestForm((prev) => ({ ...prev, zipCode: data.zonecode, address: fullAddress }))
        setErrors((prev) => ({ ...prev, zipCode: '', address: '' }))
    }

    // ── 비회원 폼 핸들러 ───────────────────────────────────────
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

        setErrors((prev) => ({ ...prev, [name]: message }))
        setFieldStatus((prev) => ({ ...prev, [name]: status }))
    }

    const handleGuestChange = (e) => {
        const { name, value } = e.target
        setGuestForm((prev) => ({ ...prev, [name]: value }))

        if (name === 'phone' || name === 'email') {
            validateLiveField(name, value, false)
        } else {
            setErrors((prev) => ({ ...prev, [name]: '' }))
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

    // ── 주문 아이템 계산 ───────────────────────────────────────
    const orderItems = useMemo(() => {
        if (directBuyItem) {
            const priceNumber = Number(
                String(directBuyItem.price).replace(/,/g, '').replace(/원/g, '')
            )
            return [{ ...directBuyItem, priceNumber, totalPrice: priceNumber * directBuyItem.qty }]
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

    const totalPrice = useMemo(
        () => orderItems.reduce((acc, cur) => acc + cur.totalPrice, 0),
        [orderItems]
    )

    const couponDiscount = useMemo(() => {
        if (!selectedCoupon) return 0
        if (totalPrice < selectedCoupon.minPrice) return 0
        if (selectedCoupon.type === 'fixed') return selectedCoupon.discount
        if (selectedCoupon.type === 'percent')
            return Math.floor((totalPrice * selectedCoupon.discount) / 100)
        return 0
    }, [selectedCoupon, totalPrice])

    const finalPrice = useMemo(
        () => Math.max(totalPrice - couponDiscount - useMoney - usePoint, 0),
        [totalPrice, couponDiscount, useMoney, usePoint]
    )

    const earnPoint = Math.floor(finalPrice * 0.01)

    const formatPrice = (price) => {
        const number = Number(price)
        if (Number.isNaN(number)) return '0원'
        return number.toLocaleString('ko-KR') + '원'
    }

    // ── 쿠폰 핸들러 ────────────────────────────────────────────
    const handleCouponSelect = (coupon) => {
        if (selectedCoupon?.id === coupon.id) {
            setSelectedCoupon(null)
        } else if (totalPrice >= coupon.minPrice) {
            setSelectedCoupon(coupon)
        }
        setCouponOpen(false)
    }

    // ── 일룸머니 핸들러 ────────────────────────────────────────
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

    // ── 결제 처리 ──────────────────────────────────────────────
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

    const handleFinalConfirm = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)

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
                userInfo: { name: user.name || '', phone: user.phone || '', email: user.email || '' },
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

            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#CA1230', '#111111', '#ffffff', '#d4a574'],
            })

            toast(`결제가 완료되었습니다. 주문번호는 ${orderNumber} 입니다.`)
            user ? navigate('/order') : navigate(`/orderForGuest/${orderNumber}`)
        } catch (err) {
            console.log(err)
            toast('주문 저장 중 오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ── 카드 핸들러 ────────────────────────────────────────────
    const handleCardChange = (e) => {
        const { name, value, type, checked } = e.target
        setCardForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        setCardErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16)
        const formatted = val.replace(/(.{4})/g, '$1 ').trim()
        setCardForm((prev) => ({ ...prev, number: formatted }))
        setCardErrors((prev) => ({ ...prev, number: '' }))
    }

    const validateCardForm = () => {
        const errs = {}
        if (!cardForm.name.trim()) errs.name = '카드 소유자 이름을 입력해주세요.'
        if (!/^\d{16}$/.test(cardForm.number.replace(/\s/g, '')))
            errs.number = '16자리 카드 번호를 입력해주세요.'
        if (!cardForm.month) errs.month = '월을 선택해주세요.'
        if (!cardForm.year) errs.year = '연도를 선택해주세요.'
        if (!/^\d{3,4}$/.test(cardForm.cvv)) errs.cvv = 'CVV를 입력해주세요.'
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
        setCardForm({ name: '', number: '', month: '', year: '', cvv: '', sameAsShipping: false })
        toast('카드가 등록되었습니다.')
    }

    // ── 배송지 / 요청사항 모달 핸들러 ─────────────────────────
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
                            <OrdererInfo user={user} />
                            <DeliveryInfo
                                user={user}
                                addressForm={addressForm}
                                requestForm={requestForm}
                                onOpenAddress={handleOpenAddress}
                                onOpenRequest={handleOpenRequest}
                            />
                        </>
                    )}

                    {!user && (
                        <div className="unlogged-user-charge-section">
                            <div className="inner">
                                <GuestAgreement isAgree={isAgree} setIsAgree={setIsAgree} />
                                <GuestOrderForm
                                    guestForm={guestForm}
                                    errors={errors}
                                    fieldStatus={fieldStatus}
                                    regionOptions={regionOptions}
                                    storeOptions={storeOptions}
                                    selectedRegionOption={selectedRegionOption}
                                    selectedStoreOption={selectedStoreOption}
                                    selectedDeliveryReqOption={selectedDeliveryReqOption}
                                    deliveryReqOptions={delivery_req_options}
                                    onGuestChange={handleGuestChange}
                                    onValidateLiveField={validateLiveField}
                                    onPopupClick={() => open({ onComplete: handleComplete })}
                                    onRegionChange={(selected) =>
                                        setGuestForm((prev) => ({
                                            ...prev,
                                            visitRegionCode: selected?.value || '없음',
                                            visitStoreId: '',
                                        }))
                                    }
                                    onStoreChange={(selected) =>
                                        setGuestForm((prev) => ({
                                            ...prev,
                                            visitStoreId: selected?.value || '',
                                        }))
                                    }
                                    onDeliveryReqChange={(selected) =>
                                        setGuestForm((prev) => ({
                                            ...prev,
                                            request: selected?.value || '',
                                            customRequest: '',
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

                <OrderProductList
                    orderItems={orderItems}
                    totalPrice={totalPrice}
                    formatPrice={formatPrice}
                />

                {/* 할인 · 쿠폰 섹션 */}
                <div className="charge-section">
                    <h3 className="section-title">할인 · 쿠폰</h3>

                    <div className="discount-section">
                        <CouponSection
                            couponData={couponData}
                            selectedCoupon={selectedCoupon}
                            setSelectedCoupon={setSelectedCoupon}
                            couponOpen={couponOpen}
                            setCouponOpen={setCouponOpen}
                            totalPrice={totalPrice}
                            couponDiscount={couponDiscount}
                            handleCouponSelect={handleCouponSelect}
                            formatPrice={formatPrice}
                        />

                        <MoneySection
                            iloomMoney={iloomMoney}
                            moneyInput={moneyInput}
                            setMoneyInput={setMoneyInput}
                            useMoney={useMoney}
                            onMoneyApply={handleMoneyApply}
                            onMoneyAll={handleMoneyAll}
                            formatPrice={formatPrice}
                        />

                        <div className="discount-summary">
                            {/* <div className="discount-summary-row">
                                <span>상품금액</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div> */}

                            {couponDiscount > 0 && (
                                <div className="discount-summary-row minus">
                                    <span>쿠폰 할인</span>
                                    <span>− <NumberFlow value={couponDiscount} suffix="원" /></span>
                                </div>
                            )}

                            {useMoney > 0 && (
                                <div className="discount-summary-row minus">
                                    <span>일룸머니 사용</span>
                                    <span>− <NumberFlow value={useMoney} suffix="원" /></span>
                                </div>
                            )}

                            <div className="discount-summary-row total">
                                <span>최종 결제금액</span>
                                <strong className="discount-final-price">
                                    <NumberFlow value={finalPrice} suffix="원" />
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                <PointBenefitSection finalPrice={finalPrice} earnPoint={earnPoint} />

                <PaymentMethodSection
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    iloomPoint={iloomPoint}
                    showMorePayment={showMorePayment}
                    setShowMorePayment={setShowMorePayment}
                    registeredCards={registeredCards}
                    selectedCardIndex={selectedCardIndex}
                    setSelectedCardIndex={setSelectedCardIndex}
                    onOpenCardForm={() => setShowCardForm(true)}
                    onOpenPointModal={() => setShowPointModal(true)}
                    finalPrice={finalPrice}
                    formatPrice={formatPrice}
                    orderItems={orderItems}
                    onPayment={handlePayment}
                />
            </div>

            <PaymentSummaryBar
                finalPrice={finalPrice}
                orderItems={orderItems}
                onPayment={handlePayment}
            />

            {/* 모달들 */}
            {confirmPay && (
                <ChargeModal
                    onClose={() => setConfirmPay(false)}
                    onConfirm={handleFinalConfirm}
                />
            )}

            {showPointModal && (
                <PointChargeModal
                    iloomPoint={iloomPoint}
                    onClose={() => setShowPointModal(false)}
                />
            )}

            {showCardForm && (
                <CardRegisterModal
                    cardForm={cardForm}
                    cardErrors={cardErrors}
                    onCardChange={handleCardChange}
                    onCardNumberChange={handleCardNumberChange}
                    onClose={() => setShowCardForm(false)}
                    onSubmit={handleCardSubmit}
                />
            )}

            {showAddressModal && (
                <AddressModal
                    addressDraft={addressDraft}
                    setAddressDraft={setAddressDraft}
                    onClose={() => setShowAddressModal(false)}
                    onConfirm={handleAddressConfirm}
                />
            )}

            {showRequestModal && (
                <RequestModal
                    requestDraft={requestDraft}
                    setRequestDraft={setRequestDraft}
                    onClose={() => setShowRequestModal(false)}
                    onConfirm={handleRequestConfirm}
                />
            )}
        </section>
    )
}
