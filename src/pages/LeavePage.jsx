import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import "./scss/mypage.scss"

import toast from 'react-hot-toast'
import LeaveModal from '../components/LeaveModal'

export default function LeavePage() {
    const { user, onDeleteAccount } = useAuthStore()
    const [isChecked, setIsChecked] = useState(false)

    // 팝업 상태
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

    const navigate = useNavigate()

    /* 탈퇴 버튼 클릭 */
    const handleLeave = () => {
        if (!isChecked) {
            toast("탈퇴 유의사항에 동의해주세요.")
            return
        }
        setIsLeaveModalOpen(true)
    }

    /* 실제 탈퇴 실행 */
    const confirmLeave = async () => {
        const result = await onDeleteAccount()
        if (result) {
            toast("탈퇴가 완료되었습니다.")
            navigate("/")
        }
    }

    return (
        <section className="mypage">
            <div className="inner">
                <MyPageMenu />

                <div className="content">
                    <div className="leave-title">
                        <h2>회원탈퇴</h2>
                    </div>

                    <div className="leave-section">
                        <div className="leave-box">
                            <h3>탈퇴 전 꼭 확인해주세요 </h3>
                            <ul className="leave-list">
                                <li>탈퇴 시 모든 개인정보 및 서비스 이용 기록이 삭제됩니다.</li>
                                <li>보유하신 적립금 및 쿠폰은 즉시 소멸되며 복구되지 않습니다.</li>
                                <li>진행 중인 주문이 있을 경우 탈퇴가 제한될 수 있습니다.</li>
                                <li>탈퇴 후 동일 이메일로 재가입 시 기존 정보는 복구되지 않습니다.</li>
                                <li>탈퇴 처리 후 개인정보는 관련 법령에 따라 일정 기간 보관될 수 있습니다.</li>
                            </ul>
                        </div>

                        <div className="leave-confirm">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => setIsChecked(e.target.checked)}
                                />
                                유의사항을 모두 확인하였으며, 회원 탈퇴에 동의합니다.
                            </label>
                        </div>

                        <div className="leave-btns">
                            <button
                                className="cancel-btn"
                                onClick={() => navigate("/mypage")}
                            >
                                취소
                            </button>
                            <button
                                className="leave-btn"
                                onClick={handleLeave}
                            >
                                회원 탈퇴
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 */}
            {isLeaveModalOpen && (
                <LeaveModal
                    onClose={() => setIsLeaveModalOpen(false)}
                    onConfirm={confirmLeave}
                />
            )}
        </section>
    )
}