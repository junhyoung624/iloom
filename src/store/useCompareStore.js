import { create } from 'zustand'

const MAX_COMPARE = 3

export const useCompareStore = create((set, get) => ({
    compareList: [],

    onToggleCompare: (item) => {
        const { compareList } = get()
        const exists = compareList.some((c) => c.id === item.id)

        if (exists) {
            set({ compareList: compareList.filter((c) => c.id !== item.id) })
        } else {
            if (compareList.length >= MAX_COMPARE) {
                return false // 최대 개수 초과
            }
            set({ compareList: [...compareList, item] })
        }
        return true
    },

    removeCompareItem: (id) => {
        set({ compareList: get().compareList.filter((c) => c.id !== id) })
    },

    clearCompare: () => set({ compareList: [] }),
}))