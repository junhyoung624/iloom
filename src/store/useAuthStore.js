import { createUserWithEmailAndPassword, onAuthStateChanged, linkWithPopup, unlink, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, deleteUser } from "firebase/auth";
import { create } from "zustand";
import { auth, db, googleProvider } from "../firebase/firebase";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

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
                await useProductStore.getState().fetchCartItems({ uid: u.uid });

            } else {
                const socialUid = localStorage.getItem("social_uid");
                const socialProvider = localStorage.getItem("social_provider");

                if (socialUid) {
                    try {
                        const userRef = doc(db, "people", socialUid);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            const userInfo = userSnap.data();
                            set({ user: { ...userInfo, provider: socialProvider } });

                            const { useProductStore } = await import('./useProductStore');
                            await useProductStore.getState().fetchOrderList({ uid: socialUid });
                            await useProductStore.getState().fetchCartItems({ uid: socialUid });
                        } else {
                            localStorage.removeItem("social_uid");
                            localStorage.removeItem("social_provider");
                            set({ user: null });
                        }
                    } catch (err) {
                        console.error("소셜 로그인 복원 실패:", err);
                        set({ user: null });
                    }
                } else {
                    set({ user: null })
                }
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

            toast("회원가입 성공했습니다")
            return true;
        } catch (err) {
            toast("회원가입 에러" + err.message);
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

            const { useProductStore } = await import('./useProductStore');
            await useProductStore.getState().fetchOrderList({ uid: u.uid });
            await useProductStore.getState().fetchCartItems({ uid: u.uid });
            return true;
        } catch (err) {
            toast("로그인 실패" + err.message)
        }
    },

    // 로그아웃
    onLogout: async () => {
        await signOut(auth);
        localStorage.removeItem("social_uid");
        localStorage.removeItem("social_provider");
        const { useProductStore } = await import('./useProductStore');
        const { useCustomWishStore } = await import('./useCustomWishStore');
        useProductStore.getState().clearCartItems();
        useProductStore.getState().clearOrderList();
        useProductStore.getState().clearWishlist();
        useCustomWishStore.getState().clearWishFolders();
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

            const { useProductStore } = await import('./useProductStore');
            await useProductStore.getState().fetchOrderList({ uid: user.uid });
            await useProductStore.getState().fetchCartItems({ uid: user.uid });
            return true;
        } catch (err) {
            toast(err.message);
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
                window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY);
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
                localStorage.setItem("social_uid", uid);
                localStorage.setItem("social_provider", "kakao");
                set({ user: { ...kakaoUser, socials: { kakao: { email: kakaoEmail, linked: true } } } })
            }

            const productOwnerUid = get().user?.uid || uid;
            const { useProductStore } = await import('./useProductStore');
            await useProductStore.getState().fetchOrderList({ uid: productOwnerUid });
            await useProductStore.getState().fetchCartItems({ uid: productOwnerUid });

            toast(`${kakaoUser.nickname}님, 카카오 로그인 성공!`);
            return true;
        } catch (err) {
            console.error('카카오 로그인 중 오류:', err);
            toast(err.message);
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
                localStorage.setItem("social_uid", naverUser.uid);
                localStorage.setItem("social_provider", "naver");
                set({ user: naverUser })
            }

            const productOwnerUid = get().user?.uid || naverUser.uid;
            const { useProductStore } = await import('./useProductStore');
            await useProductStore.getState().fetchOrderList({ uid: productOwnerUid });
            await useProductStore.getState().fetchCartItems({ uid: productOwnerUid });

            return true
        } catch (err) {
            console.error('네이버 콜백 오류:', err);
            toast(err.message);
        }
    },

    // 소셜 연동
    onSocialLink: async (provider) => {
        try {
            const u = get().user
            if (!u) {
                toast("로그인이 필요합니다")
                return
            }
            const userRef = doc(db, "people", u.uid)
            if (provider === "google") {
                if (auth.currentUser) {
                    // 이메일/구글 로그인 유저 → 기존 방식 유지
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
                } else {
                    // 카카오/네이버 로그인 유저 → 팝업만 띄워서 이메일 저장
                    const result = await signInWithPopup(auth, googleProvider)
                    const googleEmail = result.user.email

                    await signOut(auth)

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
                }
            } else if (provider === "kakao") {
                if (!window.Kakao.isInitialized()) {
                    window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY)
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
            toast(`${provider} 연동 완료!`)
        } catch (err) {
            toast("연동실패:" + err.message)
        }
    },

    onSocialUnlink: async (provider) => {
        try {
            const u = get().user
            const userRef = doc(db, "people", u.uid)

            if (provider === "google") {
                if (auth.currentUser) {
                    // 이메일/구글 로그인 유저 → Firebase unlink
                    await unlink(auth.currentUser, "google.com")
                }
                // 카카오/네이버 로그인 유저 → Firebase Auth 세션 없으니 그냥 Firestore만 업데이트
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
            toast(`${provider} 연동 해제 완료`)
        } catch (err) {
            toast("탈퇴 실패:" + err.message)
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

            try {
                if (auth.currentUser) {
                    await deleteUser(auth.currentUser)
                }
            } catch (deleteErr) {
                console.error("Firebase 유저 삭제 실패:", deleteErr)
            }

            localStorage.removeItem("social_uid")
            localStorage.removeItem("social_provider")
            const { useCustomWishStore } = await import('./useCustomWishStore');
            useCustomWishStore.getState().clearWishFolders();

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
            toast("탈퇴 실패:" + err.message)
            return false
        }
    }
}));
