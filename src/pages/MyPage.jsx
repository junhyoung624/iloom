import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useLocation } from 'react-router-dom'
import "./scss/mypage.scss"

export default function MyPage() {
    const { user, onUpdate, onSocialLink, onSocialUnlink } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)

    const [form, setForm] = useState({
        birth: user?.birth || "",
        gender: user?.gender || "",
        address: user?.address || "",
        email: user?.email || "",
        phone: user?.phone || "",
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        await onUpdate(form)
        setIsOpen(false)
    }

    const isLinked = (providerId) => {
        return user?.providers?.includes(providerId)
    }

    const location = useLocation()

    return (
        <section className="mypage">
            <div className="inner">
                <aside className="sidebar">
                    <ul>
                        <li><Link to="/order">주문/배송</Link></li>
                        <li><Link to="/wishlist">위시리스트</Link></li>
                        <li className={location.pathname === "/mypage" ? "active" : ""}><Link to="/mypage">회원 정보 수정</Link></li>
                        <li><Link to="/mypage/leave">회원 탈퇴</Link></li>
                    </ul>
                </aside>

                <div className="content">
                    <h2>회원 정보 수정</h2>

                    <div className="info-section">
                        <h3>회원정보</h3>
                        <div className="info-box">
                            <div className="profile">
                                <p>반가워요!</p>
                                <strong>{user?.name}님</strong>
                                <button onClick={() => setIsOpen(true)}>내 정보 변경</button>
                            </div>

                            <div className="info-view">
                                <div className="info-item">
                                    <label>생년월일</label>
                                    <div className="birth-box">
                                        <p>{user?.birthYear || "미입력"}년</p>
                                        <p>{user?.birthMonth || "미입력"}월</p>
                                        <p>{user?.birthDay || "미입력"}일</p>
                                        <div className="gender-box">
                                            <label>
                                                <input type="radio"
                                                    name="view-gender"
                                                    value="남자"
                                                    checked={user?.gender === "남자"}
                                                    onChange={() => { }} />남자
                                            </label>
                                            <label>
                                                <input type="radio"
                                                    name="view-gender"
                                                    value="여자"
                                                    checked={user?.gender === "여자"}
                                                    onChange={() => { }} />여자
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <label>대표 이메일</label>
                                    <p>{user?.email}</p>
                                </div>

                                <div className="info-item">
                                    <label>전화번호</label>
                                    <div className="phone-box">
                                        <p>{user?.phone1 || "미입력"}</p>
                                        <p>{user?.phone2 || "미입력"}</p>
                                        <p>{user?.phone3 || "미입력"}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <label>기본 배송지</label>
                                    <p>{user?.address || "미입력"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sns-section">
                        <h3>SNS 계정 가입 여부</h3>
                        <div className="sns-box">
                            {/* 구글 */}
                            <div className="sns-item">
                                <img src="./images/mypage/google.png" alt="google" />
                                <div>
                                    <p>{isLinked("google.com") ? "구글가입" : "미가입"}</p>
                                    {isLinked("google.com")
                                        ? <button onClick={() => onSocialUnlink("google.com")}>탈퇴하기</button>
                                        : <button onClick={() => onSocialLink("google")}>가입하기</button>
                                    }
                                </div>
                            </div>

                            {/* 카카오 */}
                            <div className="sns-item">
                                <img src="./images/mypage/kakao.png" alt="kakao" />
                                <div>
                                    <p>미가입</p>
                                    <button disabled>가입하기</button>
                                </div>
                            </div>

                            {/* 네이버 */}
                            <div className="sns-item">
                                <img src="./images/mypage/naver.png" alt="naver" />
                                <div>
                                    <p>미가입</p>
                                    <button disabled>가입하기</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="agree-section">
                        <h3>선택동의항목</h3>
                        <div className="agree-box">
                            <div className="agree-content">
                                <label>
                                    <input type="checkbox" />
                                    개인정보 수집 및 동의
                                </label>
                                <p className="marketing">
                                    마케팅 수신동의 (이메일 <input type="checkbox" /> SNS <input type="checkbox" />)
                                </p>
                                <p className="notice">※ 정보수신에 동의하지 않으셔도 정상적인 서비스 이용이 가능합니다.</p>
                            </div>
                            <button className="agree-btn">동의 내용보기</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 팝업 */}
            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>내 정보 변경</h3>

                        <div className="form-item">
                            <label>생년월일</label>
                            <input type="text" name="birth" defaultValue={user?.birth} onChange={handleChange} placeholder="예) 1990-01-01" />
                        </div>

                        <div className="form-item">
                            <label>성별</label>
                            <label><input type="radio" name="gender" value="남자" onChange={handleChange} />남자</label>
                            <label><input type="radio" name="gender" value="여자" onChange={handleChange} />여자</label>
                        </div>

                        <div className="form-item">
                            <label>대표이메일</label>
                            <input type="email" name="email" defaultValue={user?.email} onChange={handleChange} />
                        </div>

                        <div className="form-item">
                            <label>전화번호</label>
                            <input type="text" name="phone" defaultValue={user?.phone} onChange={handleChange} />
                        </div>

                        <div className="form-item">
                            <label>기본 배송지</label>
                            <input type="text" name="address" defaultValue={user?.address} onChange={handleChange} />
                        </div>

                        <div className="modal-btns">
                            <button onClick={() => setIsOpen(false)}>취소</button>
                            <button onClick={handleSave}>저장</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
} 