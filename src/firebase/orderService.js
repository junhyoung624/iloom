import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc } from 'firebase/firestore'

const normalizeText = (value) => String(value || '').trim()
const normalizePhone = (value) => normalizeText(value).replace(/-/g, '')

const toOrderData = (snapshot) => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

const uniqueOrders = (orders) => {
    const seen = new Set()
    return orders.filter((order) => {
        const key = order.id || order.orderId || order.orderNumber
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

const isSameGuestName = (order, name) => {
    const targetName = normalizeText(name)
    return normalizeText(order.name) === targetName || normalizeText(order.guestInfo?.name) === targetName
}

// 테스트용 주문
export const addOrder = async (orderData) => {
    const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        orderedAt: serverTimestamp()
    })
    return docRef.id
}

export const addTestOrder = async () => {
    await addDoc(collection(db, 'orders'), {
        orderId: 'ORD-20240421-001',
        name: '홍길동',
        phone: '01012345678',
        status: '배송중',
        deliveryInfo: {
            carrier: 'CJ대한통운',
            trackingNumber: '1234567890',
            estimatedDate: '2025-04-25'
        },
        items: [
            { name: '핀 원목 의자', option: '화이트', quantity: 2, price: 349000, image: './images/best-seller/product-01.png' }
        ],
        orderedAt: serverTimestamp()
    })

}

// 휴대폰 조회
export const getOrderByPhone = async (name, phone) => {
    const q = query(
        collection(db, 'orders'),
        where('phone', '==', normalizePhone(phone))
    )
    const snapshot = await getDocs(q)
    return toOrderData(snapshot).filter((order) => isSameGuestName(order, name))
}

// 주문번호
export const getOrderByOrderId = async (name, orderId) => {
    const orderNumber = normalizeText(orderId)
    const orderIdQuery = query(
        collection(db, 'orders'),
        where('orderId', '==', orderNumber)
    )
    const orderNumberQuery = query(
        collection(db, 'orders'),
        where('orderNumber', '==', orderNumber)
    )
    const [orderIdSnapshot, orderNumberSnapshot] = await Promise.all([
        getDocs(orderIdQuery),
        getDocs(orderNumberQuery),
    ])

    return uniqueOrders([
        ...toOrderData(orderIdSnapshot),
        ...toOrderData(orderNumberSnapshot),
    ]).filter((order) => isSameGuestName(order, name))
}

export const getOrderByNumber = async (orderNumber) => {
    const normalizedOrderNumber = normalizeText(orderNumber)
    const orderIdQuery = query(
        collection(db, 'orders'),
        where('orderId', '==', normalizedOrderNumber)
    )
    const orderNumberQuery = query(
        collection(db, 'orders'),
        where('orderNumber', '==', normalizedOrderNumber)
    )
    const [orderIdSnapshot, orderNumberSnapshot] = await Promise.all([
        getDocs(orderIdQuery),
        getDocs(orderNumberQuery),
    ])

    return uniqueOrders([
        ...toOrderData(orderIdSnapshot),
        ...toOrderData(orderNumberSnapshot),
    ])
}

export const updateGuestOrderItemCancel = async (docId, items) => {
    await updateDoc(doc(db, 'orders', docId), { items })
}
