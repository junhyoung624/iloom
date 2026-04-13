// firebase앱을 초기화하는 함수
import {initializeApp} from "firebase/app"

// getAuth 인증 시스템 생성
// GoogleAuthProvider 구글 로그인 기능 제공
import {getAuth, GoogleAuthProvider} from "firebase/auth";

// 데이터베이스 -> json형태로 저장
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENTER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new  GoogleAuthProvider();

// 데이터 베이스 연결
export const db = getFirestore(app);


