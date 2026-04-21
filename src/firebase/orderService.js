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