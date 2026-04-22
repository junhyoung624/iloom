import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from './firebase'

export const findEmailByNameAndPhone = async (name, phone) => {
    // 하이픈 제거해서 비교
    const cleanPhone = phone.replace(/-/g, '')

    const q = query(
        collection(db, 'people'),
        where('name', '==', name),
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    // phone 형식 상관없이 비교
    const matched = snapshot.docs.find(doc => {
        const savedPhone = (doc.data().phone || '').replace(/-/g, '')
        return savedPhone === cleanPhone
    })

    return matched ? matched.data().email : null
}