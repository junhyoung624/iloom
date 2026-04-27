import React from 'react'

export default function TabDelivery() {
    return (
        <div className="tab-delivery">
            <div className="delivery-section">
                <h3>01.배송비</h3>
                <ul>
                    <li>- 전국 무료 배송 및 설치를 진행하고 있습니다.</li>
                    <li>- 제주도는 제주 지역 배송비 부담 시, 온라인 주문도 가능합니다.</li>
                    <li>- 단, 제주도를 제외한 울릉도 등 도서/산간 지역의 경우 택배상품만 온라인 주문이 가능합니다.</li>
                </ul>
            </div>

            <div className="delivery-section">
                <h3>※ 제주 지역 배송비 관련</h3>
                <ul>
                    <li>1) 배송비 안내</li>
                    <li>제주 지역 배송비는 소비자가(정가)의 약 4%입니다.</li>
                    <li>정확한 금액은 주문 이후 결제안내 알림톡을 통해 확인가능합니다.</li>
                    <li>2) 배송비 입금</li>
                    <li>주문 이후 발송되는 결제 안내 알림톡을 통해 결제 가능합니다.</li>
                </ul>
            </div>

            <div className="delivery-section">
                <h3>02.설치배송 상품 배송안내</h3>
                <ul>
                    <li>일룸은 전문시공기사가 배송과 동시에 설치까지 해드립니다.</li>
                    <li>배송은 주문 확인 후 영업일 기준 7~10일 (주말, 공휴일 제외) 정도 소요합니다.</li>
                </ul>
                <div className="delivery-process">
                    <div className="process-step"><span>주문 당일</span><p>배송예정일 확정 알림톡 발송</p></div>
                    <div className="process-arrow">▶</div>
                    <div className="process-step"><span>배송 전 3일까지</span><p>배송일 변경 가능</p></div>
                    <div className="process-arrow">▶</div>
                    <div className="process-step"><span>배송 전일 오후</span><p>배송 확정 알림톡 발송</p></div>
                    <div className="process-arrow">▶</div>
                    <div className="process-step"><span>배송 당일</span><p>설치완료 후 수령확인 서명진행</p></div>
                </div>
            </div>

            <div className="delivery-section">
                <h3>03. 택배배송 상품 배송안내</h3>
                <ul>
                    <li>택배 상품은 일반택배로 배송되며 주문 당일 배송예정일 알림톡이 발송됩니다.</li>
                    <li>택배 송장번호는 배송예정일 전일 배송/조회, 알림톡, AI챗봇 주문조회를 통해 확인할 수 있습니다.</li>
                </ul>
            </div>

            <div className="delivery-section">
                <h3>04. 배송일 변경</h3>
                <ul>
                    <li>배송예정일로부터 영업일 기준 3일전에 변경 요청바랍니다.</li>
                    <li>희망 배송일 신청은 AI챗봇으로만 가능합니다.</li>
                </ul>
            </div>

            <div className="delivery-section">
                <h3>주문취소 및 반품 기준</h3>
                <table className="return-table">
                    <tbody>
                        <tr>
                            <td>주문 후 ~ 배송 전일</td>
                            <td>무상 주문 취소 가능</td>
                        </tr>
                        <tr>
                            <td>배송 당일 ~ 배송 후 7일 이내</td>
                            <td>구매 품목별 반품비 부과</td>
                        </tr>
                        <tr>
                            <td>7일 이후</td>
                            <td>반품 불가</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="delivery-section">
                <h3>환불 안내</h3>
                <ul>
                    <li>취소일 또는 반환 받은 날로부터 영업일 3일 이내 환불 처리됩니다.</li>
                    <li>신용카드 결제의 경우 익월 카드사에서 환급 처리됩니다.</li>
                    <li>무통장입금의 경우 주문 취소 또는 제품 회수 후 입금 계좌 확인 시 3일 이내 환불됩니다.</li>
                </ul>
            </div>

            <div className="delivery-section customer-center">
                <h3>고객센터</h3>
                <p>일룸 고객센터: <strong>1588-6792</strong></p>
                <p>운영시간: 평일 09:00 ~ 18:00 (주말/공휴일 휴무)</p>
            </div>
        </div>
    )
}