import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const safe = (v, d = "") => v ?? d;

export default function NaverCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const naverLogin = new window.naver.LoginWithNaverId({
      clientId: "ZEwzuANHWhVsMyEXA722",
      callbackUrl: "http://localhost:3000/naver-callback",
    });

    naverLogin.init();

    naverLogin.getLoginStatus(async (status) => {
      if (status) {
        const profile = naverLogin.user;

        const userData = {
          uid: profile.id,
          email: safe(profile.email),
          name: safe(profile.name, "사용자"),
          nickname: safe(profile.nickname, "사용자"),
          phone: safe(profile.mobile),
          file: safe(profile.profile_image),
          provider: "naver",
        };

        const userRef = doc(db, "users", userData.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, userData);
        }

        setUser(userData);

        alert("네이버 로그인 성공!");
        navigate("/");
      }
    });
  }, []);

  return <div>네이버 로그인 처리중...</div>;
}