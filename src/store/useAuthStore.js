import { create } from "zustand";

export const useAuthStore = create((set, get) => ({

    // 로그인
    user: null,

    // 회원가입
    onMember: async ({uName, email, password, phone}) => {

    }
}));