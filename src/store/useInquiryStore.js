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
}))