import { createUserWithEmailAndPassword, onAuthStateChanged, linkWithPopup, unlink, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { create } from "zustand";
import { auth, db, googleProvider } from "../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { useNavigate } from "react-router-dom";
export const useAuthStore = create((set, get) => ({

    // 로그인
    user: null,

    // 로그인 상태유지
    initAuth: () => {
        onAuthStateChanged(auth, async (u) => {
            if (u) {
                const userRef = doc(db, "people", u.uid)
                const userSnap = await getDoc(userRef)
                const userInfo = userSnap.data()

                set({
                    user: {
                        uid: u.uid,
                        email: u.email,
                        name: userInfo?.name,
                        phone: userInfo?.phone,
                        birth: userInfo?.birth,
                        gender: userInfo?.gender,
                        address: userInfo?.address,
                        providers: u.providerData.map(p => p.providerId)
                    }
                })
            } else {
                set({ user: null })
            }
        })
    },

    // 회원가입
    onMember: async ({ uname, email, password, phone }) => {
        try {
            const userMember = await createUserWithEmailAndPassword(auth, email, password)
            console.log(userMember);
            const user = userMember.user;

            await updateProfile(user, {
                displayName: uname
            });

            // fireStore 저장
            const userRef = doc(db, "people", user.uid)

            const userInfo = {
                uid: user.uid,
                name: uname,
                email,
                phone,
            }

            await setDoc(userRef, userInfo);
            alert("회원가입 성공했습니다")

            return true;

        }
        catch (err) {
            alert("회원가입 에러" + err.message);
            return false
        }
    },


    // 이메일 로그인 
    onLogin: async (email, pass) => {
        try {
            const userLogin = await signInWithEmailAndPassword(auth, email, pass)
            // set({ user: userLogin.user })
            const u = userLogin.user;

            const userRef = doc(db, "people", u.uid)
            const userSnap = await getDoc(userRef)
            const userInfo = userSnap.data()

            set({
                user: {
                    uid: u.uid,
                    email: u.email,
                    name: userInfo.name,
                    phone: userInfo.phone,
                    providers: u.providerData.map(p => p.providerId)
                }
            })
        }
        catch (err) {
            alert("로그인 실패" + err.message)
        }
    },

    // 로그아웃
    onLogout: async () => {
        await signOut(auth);
        set({ user: null })
    },

    // 구글로그인
    onGoogleLogin: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("구글 로그인", result);
            const user = result.user;

            // firebase 저장
            const userRef = doc(db, "people", user.uid)
            // 이미 회원인지 체크
            const userDoc = await getDoc(userRef)
            // 회원이 아니면 새로운 정보로 회원가입하기
            if (!userDoc.exists()) {
                const userInfo = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    phone: user.phoneNumber
                }
                await setDoc(userRef, userInfo)
                set({
                    user: {
                        ...userInfo,
                        providers: user.providerData.map(p => p.providerId)
                    }
                })
            }
            else {
                set({
                    user: {
                        ...userDoc.data(),
                        googleEmail: user.email,
                        providers: user.providerData.map(p => p.providerId)
                    }
                })
            }
        }
        catch (err) {
            alert(err.message);

        }
    },

    // 업데이트
    onUpdate: async ({ birth, gender, address, email, phone }) => {
        const u = get().user
        const userRef = doc(db, "people", u.uid)

        await updateDoc(userRef, { birth, gender, address, email, phone })

        set({
            user: { ...get().user, birth, gender, address, email, phone }
        })
    },

    // 구글 가입, 탈퇴
    onSocialLink: async () => {
        try {
            await linkWithPopup(auth.currentUser, googleProvider)
            alert("구글 가입 완료")
            set({
                user: {
                    ...get().user,
                    providers: auth.currentUser.providerData.map(p => p.providerId)
                }
            })
        } catch (err) {
            alert("가입 실패 :" + err.message)
        }
    },

    onSocialUnlink: async (providerId) => {
        try {
            await unlink(auth.currentUser, providerId)
            alert("탈퇴 완료!")
            set({
                user: {
                    ...get().user,
                    providers: auth.currentUser.providerData.map(p => p.providerId)
                }
            })
        } catch (err) {
            alert("탈퇴 실패:" + err.message)
        }
    }
}));