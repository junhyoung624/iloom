import { create } from 'zustand'
import { fetchInquiries, addInquiryFS, updateInquiryFS, deleteInquiryFS } from '../firebase/inquiryService'

export const useInquiryStore = create((set, get) => ({
    inquiries: [],

    loadInquiries: async (user) => {
        if (!user) return set({ inquiries: [] })
        const data = await fetchInquiries(user.uid)
        set({ inquiries: data })
    },

    addInquiry: async (user, inquiry) => {
        if (!user) return
        const id = await addInquiryFS(user.uid, inquiry)
        set((state) => ({
            inquiries: [{
                id,
                uid: user.uid,
                status: '답변 대기',
                createdAt: new Date().toISOString(),
                ...inquiry,
            }, ...state.inquiries]
        }))
    },

    deleteInquiry: async (id) => {
        await deleteInquiryFS(id)
        set((state) => ({
            inquiries: state.inquiries.filter((i) => i.id !== id)
        }))
    },

    updateInquiry: async (id, newText) => {
        await updateInquiryFS(id, newText)
        set((state) => ({
            inquiries: state.inquiries.map((i) =>
                i.id === id ? { ...i, text: newText } : i)
        }))
    },
}))