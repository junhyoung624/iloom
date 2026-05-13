import { create } from 'zustand'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

const syncPointToFirebase = async (uid, point) => {
    if (!uid) return
    try {
        const ref = doc(db, 'people', uid)
        await updateDoc(ref, { iloomPoint: point })
    } catch (e) {
        console.warn('point sync failed', e)
    }
}

export const useUserAssetStore = create((set, get) => ({

    iloomPoint: 1000,  // 기본값 1000P (일룸 포인트 = 일룸 머니 통합)

    // 포인트 직접 세팅 (로그인 시 Firebase에서 로드)
    setPoint: (amount) => set({ iloomPoint: amount }),

    // 포인트 적립 + Firebase 동기화
    addPoint: (amount, uid) => {
        const next = get().iloomPoint + amount
        set({ iloomPoint: next })
        syncPointToFirebase(uid, next)
    },

    // 포인트 사용 + Firebase 동기화
    usePoint: (amount, uid) => {
        const next = Math.max(get().iloomPoint - amount, 0)
        set({ iloomPoint: next })
        syncPointToFirebase(uid, next)
    },
}))