import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { create } from "zustand";
import { auth, db, googleProvider } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
export const useAuthStore = create((set, get) => ({

    // 로그인
    user: null,

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
                }
            })
        }
        catch (err) {
            alert("로그인 실패" + err.message)
        }
    },


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

                set({ user: userInfo })
            }
            else {
                set({ user: userDoc.data() })
            }
        }
        catch (err) {
            alert(err.message);

        }
    },


    onLogout: async () => {
        await signOut(auth);
        set({ user: null })
    }
}));