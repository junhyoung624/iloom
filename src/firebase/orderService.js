import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'

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
        where('name', '==', name),
        where('phone', '==', phone)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// 주문번호
export const getOrderByOrderId = async (name, orderId) => {
    const q = query(
        collection(db, 'orders'),
        where('name', '==', name),
        where('orderId', '==', orderId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}