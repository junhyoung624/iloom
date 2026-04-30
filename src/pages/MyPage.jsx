import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import "./scss/mypage.scss"
import MyPageMenu from './MyPageMenu'
import { Helmet } from 'react-helmet-async'

export default function MyPage() {
    const navigate = useNavigate()
    const { user, onUpdate, onSocialLink, onSocialUnlink } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isAgreeOpen, setIsAgreeOpen] = useState(false)

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
        try {
            await onUpdate(form)
            setIsOpen(false)
        } catch (err) {

        }
    }

    const isLinked = (provider) => {
        return user?.socials?.[provider]?.linked === true
    }

    const handleUnlink = async (provider) => {
        const linkedCount = ['google', 'kakao', 'naver']
            .filter(p => user?.socials?.[p]?.linked === true).length

        if (linkedCount <= 1) {
            if (window.confirm("마지막 연동 계정입니다. 회원탈퇴 페이지로 이동할까요?")) {
                navigate("/leavepage")
            }
            return
        }
        await onSocialUnlink(provider)
    }

    const location = useLocation()

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setIsAgreeOpen(false)
                setIsOpen(false)
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    return (
        <>
            <section className="mypage">
                <Helmet>
                    <title>마이페이지 | iloom</title>
                    <meta name="description" content="회원 정보 및 주문 내역을 확인하세요." />
                </Helmet>
                <div className="inner">
                    <MyPageMenu />
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
                                            <p>{user?.birth || "미입력"}</p>
                                            <div className="gender-box">
                                                <label>
                                                    <input type="radio" name="view-gender" value="남자" checked={user?.gender === "남자"} onChange={() => {}} />남자
                                                </label>
                                                <label>
                                                    <input type="radio" name="view-gender" value="여자" checked={user?.gender === "여자"} onChange={() => {}} />여자
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
                                            <p>{user?.phone || "미입력"}</p>
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
                                <div className="sns-item">
                                    <img src="./images/mypage/google.png" alt="google" />
                                    <div>
                                        <p>{isLinked("google") ? `${user?.socials?.google?.email} 가입` : "미가입"}</p>
                                        {isLinked("google")
                                            ? <button onClick={() => handleUnlink("google")}>탈퇴하기</button>
                                            : <button onClick={() => onSocialLink("google")}>가입하기</button>
                                        }
                                    </div>
                                </div>
                                <div className="sns-item">
                                    <img src="./images/mypage/kakao.png" alt="kakao" />
                                    <div className="sns-info">
                                        <p>
                                            {isLinked("kakao")
                                                ? user?.socials?.kakao?.email ? `${user.socials.kakao.email} 가입` : "카카오 가입"
                                                : "미가입"}
                                        </p>
                                        {isLinked("kakao")
                                            ? <button onClick={() => handleUnlink("kakao")}>탈퇴하기</button>
                                            : <button onClick={() => onSocialLink("kakao")}>가입하기</button>
                                        }
                                    </div>
                                </div>
                                <div className="sns-item">
                                    <img src="./images/mypage/naver.png" alt="naver" />
                                    <div className="sns-info">
                                        <p>{isLinked("naver") ? `${user?.socials?.naver?.email} 가입` : "미가입"}</p>
                                        {isLinked("naver")
                                            ? <button onClick={() => handleUnlink("naver")}>탈퇴하기</button>
                                            : <button onClick={() => onSocialLink("naver")}>가입하기</button>
                                        }
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
                                <button className="agree-btn" onClick={() => setIsAgreeOpen(true)}>동의 내용보기</button>
                            </div>
                        </div>
                        <button className="agree-btn" onClick={() => setIsAgreeOpen(true)}>동의 내용보기</button>
                    </div>
                </div>
            </section>

            {/* 내 정보 변경 팝업 */}
            {isOpen && createPortal(
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
                </div>,
                document.body
            )}

            {/* 동의내용 팝업 */}
            {isAgreeOpen && createPortal(
                <div className="modal-overlay" onClick={() => setIsAgreeOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>개인정보 수집 및 이용동의</h3>
                        <div className="agree-detail">
                            <table>
                                <thead>
                                    <tr>
                                        <th>수집 항목</th>
                                        <th>수집 목적</th>
                                        <th>보유 기간</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>이름, 이메일, 전화번호</td>
                                        <td>회원 서비스 제공 및 본인 확인</td>
                                        <td>회원 탈퇴 시까지</td>
                                    </tr>
                                    <tr>
                                        <td>구매 내역, 배송지 정보</td>
                                        <td>주문 및 배송 처리</td>
                                        <td>5년</td>
                                    </tr>
                                    <tr>
                                        <td>이메일, 휴대폰 번호</td>
                                        <td>마케팅 정보 발송</td>
                                        <td>동의 철회 시까지</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className="agree-notice">※ 위 동의를 거부할 권리가 있으며, 동의 거부 시에도 기본 서비스 이용이 가능합니다. 단, 마케팅 정보 수신이 제한될 수 있습니다.</p>
                        </div>
                        <div className="modal-btns">
                            <button onClick={() => setIsAgreeOpen(false)}>닫기</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}