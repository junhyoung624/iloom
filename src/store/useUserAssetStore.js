import { create } from 'zustand'

export const useUserAssetStore = create((set, get) => ({

    iloomMoney: 2400,

    // 포인트 적립
    addPoint: (amount) => set((state) => ({ iloomPoint: state.iloomPoint + amount })),
    // 포인트 사용
    usePoint: (amount) => set((state) => ({ iloomPoint: Math.max(state.iloomPoint - amount, 0) })),

    // 머니 적립
    addMoney: (amount) => set((state) => ({ iloomMoney: state.iloomMoney + amount })),
    // 머니 사용
    useMoney: (amount) => set((state) => ({ iloomMoney: Math.max(state.iloomMoney - amount, 0) })),
}))