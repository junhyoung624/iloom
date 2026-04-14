import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import "./scss/mypage.scss"

export default function LeavePage() {
    const { user, onLogout } = useAuthStore()
    const [isChecked, setIsChecked] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const handleLeave = async () => {
        if (!isChecked) {
            alert("탈퇴 유의사항에 동의해주세요.")
            return
        }
        if (window.confirm("정말 탈퇴하시겠습니까?")) {
            await onLogout()
            alert("탈퇴가 완료되었습니다.")
            navigate("/")
        }
    }

    return (
        <section className="mypage">
            <div className="inner">
                <aisde className="sidebar">
                    <ul>
                        <li><Link to="/order">주문/배송</Link></li>
                        <li><Link tp="/wishlist">위시리스트</Link></li>
                        <li className={location.pathname === "/mypage" ? "active" : ""}>
                            <Link to="/mypage">회원정보 수정</Link>
                        </li>
                        <li className={location.pathname === "/leavepage" ? "active" : ""}><Link to="/leavepage">회원 탈퇴</Link></li>
                    </ul>
                </aisde>

                <div className="content">
                    <h2>회원탈퇴</h2>

                    <div className="leave-section">
                        <div className="leave-box">
                            <h3>탈퇴 전 꼭 확인해주세요 ❗</h3>
                            <ul className="leave-list">
                                <li>탈퇴 시 모든 개인정보 및 서비스 이용 기록이 삭제됩니다.</li>
                                <li>보유하신 적립금 및 쿠폰은 즉시 소멸되며 복구되지 않습니다.</li>
                                <li>진행 중인 주문이 있을 경우 탈퇴가 제한될 수 있습니다.</li>
                                <li>탈퇴 후 동일 이메일로 제가입 시 기존 정보는 복구되지 않습니다.</li>
                                <li>탙퇴 처리 후 개인정보는 관련 법령에 따라 일정 기간 보관될 수 있습니다.</li>
                            </ul>
                        </div>

                        <div className="leave-confirm">
                            <label>
                                <input type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => setIsChecked(e.target.checked)} />
                                유의사항을 모두 확인하였으며, 회원 탈퇴에 동의합니다.
                            </label>
                        </div>

                        <div className="leave-btns">
                            <button className="cancel-btn" onClick={() => navigate("/mypage")}>취소</button>
                            <button className="leave-btn" onClick={handleLeave}>회원 탈퇴</button>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}
