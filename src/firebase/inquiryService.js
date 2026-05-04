import { db } from './firebase'
import {
    collection, addDoc, getDocs, updateDoc, deleteDoc,
    doc, query, where, orderBy
} from 'firebase/firestore'

const COL = 'inquiries'

export const fetchInquiries = async (uid) => {
    const q = query(
        collection(db, COL),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addInquiryFS = async (uid, inquiry) => {
    const doc_ = await addDoc(collection(db, COL), {
        uid,
        ...inquiry,
        status: '답변 대기',
        createdAt: new Date().toISOString(),
    })
    return doc_.id
}

export const updateInquiryFS = async (id, newText) => {
    await updateDoc(doc(db, COL, id), { text: newText })
}

export const deleteInquiryFS = async (id) => {
    await deleteDoc(doc(db, COL, id))
}