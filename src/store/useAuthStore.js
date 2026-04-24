import { createUserWithEmailAndPassword, onAuthStateChanged, linkWithPopup, unlink, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, deleteUser } from "firebase/auth";
import { create } from "zustand";
import { auth, db, googleProvider } from "../firebase/firebase";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const useAuthStore = create((set, get) => ({

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
                        socials: userInfo?.socials || {
                            google: { email: "", linked: false },
                            kakao: { email: "", linked: false },
                            naver: { email: "", linked: false },
                        },
                        providers: u.providerData.map(p => p.providerId)
                    }
                })

                const { useProductStore } = await import('./useProductStore');
                await useProductStore.getState().fetchOrderList({ uid: u.uid });
                await useProductStore.getState().fetchCartItems({ uid: u.uid }); // 장바구니 복원
            } else {
                set({ user: null })
            }
        })
    },

    // 회원가입
    onMember: async ({ uname, email, password, phone }) => {
        try {
            const userMember = await createUserWithEmailAndPassword(auth, email, password)
            const user = userMember.user;

            await updateProfile(user, { displayName: uname });

            const userRef = doc(db, "people", user.uid)
            const userInfo = {
                uid: user.uid,
                name: uname,
                email,
                phone,
            }

            await setDoc(userRef, userInfo);
            await signOut(auth)

            alert("회원가입 성공했습니다")
            return true;
        } catch (err) {
            alert("회원가입 에러" + err.message);
            return false
        }
    },

    // 이메일 로그인
    onLogin: async (email, pass) => {
        try {
            const userLogin = await signInWithEmailAndPassword(auth, email, pass)
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
            return true;
        } catch (err) {
            alert("로그인 실패" + err.message)
        }
    },

    // 로그아웃
    onLogout: async () => {
        await signOut(auth);
        const { useProductStore } = await import('./useProductStore');
        useProductStore.getState().clearCartItems();  // 장바구니 초기화
        useProductStore.getState().clearOrderList();  // 주문 목록 초기화
        useProductStore.getState().clearWishlist();   // 위시리스트 초기화
        set({ user: null })
    },

    // 구글 로그인
    onGoogleLogin: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const googleEmail = user.email;

            const userRef = doc(db, "people", user.uid)
            const userDoc = await getDoc(userRef)

            if (!userDoc.exists()) {
                const userInfo = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    phone: user.phoneNumber,
                    socials: {
                        google: { email: googleEmail, linked: true },
                        kakao: { email: "", linked: false },
                        naver: { email: "", linked: false },
                    }
                };
                await setDoc(userRef, userInfo);
                set({
                    user: {
                        ...userInfo,
                        providers: user.providerData.map(p => p.providerId)
                    }
                });
            } else {
                await updateDoc(userRef, {
                    "socials.google": { email: googleEmail, linked: true }
                });
                set({
                    user: {
                        ...userDoc.data(),
                        socials: {
                            ...userDoc.data().socials,
                            google: { email: googleEmail, linked: true }
                        },
                        providers: user.providerData.map(p => p.providerId)
                    }
                });
            }
            return true;
        } catch (err) {
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

    // 카카오 로그인
    onKakaoLogin: async () => {
        try {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init('15ae98903af08e0b25e2d43e5b601235');
            }

            const authObj = await new Promise((resolve, reject) => {
                window.Kakao.Auth.login({
                    scope: 'profile_nickname, profile_image',
                    success: resolve,
                    fail: reject,
                });
            });

            const res = await window.Kakao.API.request({ url: '/v2/user/me' });

            const uid = res.id.toString();
            const kakaoEmail = res.kakao_account?.email || '';
            const kakaoUser = {
                uid,
                email: res.kakao_account?.email || '',
                name: res.kakao_account.profile?.nickname || '카카오사용자',
                nickname: res.kakao_account.profile?.nickname || '카카오사용자',
                photoURL: res.kakao_account.profile?.profile_image_url || '',
                provider: 'kakao',
            };

            const userRef = doc(db, 'people', uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    ...kakaoUser,
                    socials: {
                        google: { email: "", linked: false },
                        kakao: { email: kakaoEmail, linked: true },
                        naver: { email: "", linked: false },
                    }
                });
            } else {
                await updateDoc(userRef, {
                    "socials.kakao": { email: kakaoEmail, linked: true }
                });
            }

            const currentUser = get().user;
            if (currentUser) {
                const currentUserRef = doc(db, 'people', currentUser.uid);
                await updateDoc(currentUserRef, {
                    "socials.kakao": { email: kakaoEmail, linked: true }
                });
            } else {
                set({ user: { ...kakaoUser, socials: { kakao: { email: kakaoEmail, linked: true } } } })
            }

            alert(`${kakaoUser.nickname}님, 카카오 로그인 성공!`);
            return true;
        } catch (err) {
            console.error('카카오 로그인 중 오류:', err);
            alert(err.message);
        }
    },

    // 네이버 로그인
    onNaverLogin: () => {
        const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
        const callbackUrl = encodeURIComponent(import.meta.env.VITE_NAVER_CALLBACK_URL);
        const state = Math.random().toString(36).substring(2);

        const url = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${clientId}&redirect_uri=${callbackUrl}&state=${state}`;
        window.location.href = url;
    },

    onNaverCallback: async (accessToken) => {
        try {
            const res = await fetch(`/naver-api/v1/nid/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            const profile = data.response;

            const naverUser = {
                uid: 'naver_' + profile.id,
                email: profile.email || '',
                name: profile.name || '네이버사용자',
                nickname: profile.nickname || profile.name || '네이버사용자',
                photoURL: profile.profile_image || '',
                provider: 'naver',
            };

            const userRef = doc(db, 'people', naverUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, naverUser);
            }

            const currentUser = get().user
            if (currentUser) {
                const currentUserRef = doc(db, 'people', currentUser.uid)
                await updateDoc(currentUserRef, {
                    "socials.naver": { email: profile.email || '', linked: true }
                })
                set({
                    user: {
                        ...currentUser,
                        socials: {
                            ...currentUser?.socials,
                            naver: { email: profile.email || '', linked: true }
                        }
                    }
                })
            } else {
                set({ user: naverUser })
            }

            return true
        } catch (err) {
            console.error('네이버 콜백 오류:', err);
            alert(err.message);
        }
    },

    // 소셜 연동
    onSocialLink: async (provider) => {
        try {
            const u = get().user
            if (!u) {
                alert("로그인이 필요합니다")
                return
            }
            const userRef = doc(db, "people", u.uid)
            if (provider === "google") {
                if (!auth.currentUser) {
                    alert("로그인이 필요합니다")
                    return
                }
                await linkWithPopup(auth.currentUser, googleProvider)
                const googleEmail = auth.currentUser.providerData
                    .find(p => p.providerId === "google.com")?.email

                await updateDoc(userRef, {
                    "socials.google": { email: googleEmail, linked: true }
                })
                set({
                    user: {
                        ...get().user,
                        socials: {
                            ...get().user?.socials,
                            google: { email: googleEmail, linked: true }
                        }
                    }
                })
            } else if (provider === "kakao") {
                if (!window.Kakao.isInitialized()) {
                    window.Kakao.init('15ae98903af08e0b25e2d43e5b601235')
                }
                const authObj = await new Promise((resolve, reject) => {
                    window.Kakao.Auth.login({
                        scope: 'profile_nickname',
                        success: resolve,
                        fail: reject,
                    })
                })
                const res = await window.Kakao.API.request({ url: '/v2/user/me' })
                const kakaoEmail = res.kakao_account?.email || ''

                await updateDoc(userRef, {
                    "socials.kakao": { email: kakaoEmail, linked: true }
                })
                set({
                    user: {
                        ...get().user,
                        socials: {
                            ...get().user?.socials,
                            kakao: { email: kakaoEmail, linked: true }
                        }
                    }
                })
            } else if (provider === "naver") {
                const clientId = import.meta.env.VITE_NAVER_CLIENT_ID
                const callbackUrl = encodeURIComponent(import.meta.env.VITE_NAVER_CALLBACK_URL)
                const state = Math.random().toString(36).substring(2)
                window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${clientId}&redirect_uri=${callbackUrl}&state=${state}`
            }
            alert(`${provider} 연동 완료!`)
        } catch (err) {
            alert("연동실패:" + err.message)
        }
    },

    onSocialUnlink: async (provider) => {
        try {
            const u = get().user
            const userRef = doc(db, "people", u.uid)

            if (provider === "google") {
                await unlink(auth.currentUser, "google.com")
            }

            await updateDoc(userRef, {
                [`socials.${provider}`]: { email: "", linked: false }
            })

            set({
                user: {
                    ...get().user,
                    socials: {
                        ...get().user?.socials,
                        [provider]: { email: "", linked: false }
                    }
                }
            })
            alert(`${provider} 연동 해제 완료`)
        } catch (err) {
            alert("탈퇴 실패:" + err.message)
        }
    },

    onKakaoUnlink: () => {
        set({ user: { ...get().user, provider: null } })
    },

    onNaverUnlink: () => {
        set({ user: { ...get().user, provider: null } })
    },

    // 회원탈퇴
    onDeleteAccount: async () => {
        try {
            const u = get().user
            const userRef = doc(db, "people", u.uid)

            await deleteDoc(userRef)

            if (auth.currentUser) {
                await deleteUser(auth.currentUser)
            }

            if (u.provider === "kakao" && window.Kakao?.isInitialized()) {
                await new Promise((resolve) => {
                    window.Kakao.API.request({
                        url: '/v1/user/unlink',
                        success: resolve,
                    })
                })
            }
            set({ user: null })
            return true
        } catch (err) {
            alert("탈퇴 실패:" + err.message)
            return false
        }
    }
}));