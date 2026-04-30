import { create } from 'zustand'

export const useInquiryStore = create((set, get) => ({
    inquiries: [],

    addInquiry: (inquiry) => {
        set((state) => ({
            inquiries: [
                {
                    id: Date.now(),
                    createdAt: new Date().toLocaleString('ko-KR'),
                    status: '답변 대기',
                    ...inquiry,
                },
                ...state.inquiries,
            ],
        }))
    },

    deleteInquiry: (id) =>
        set((state) => ({
            inquiries: state.inquiries.filter((i) => i.id !== id),
        })),

    updateInquiry: (id, newText) =>
        set((state) => ({
            inquiries: state.inquiries.map((i) =>
                i.id === id ? { ...i, text: newText } : i),
        }))
}))