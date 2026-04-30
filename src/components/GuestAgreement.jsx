export default function GuestAgreement({ isAgree, setIsAgree }) {
    return (
        <div className="delivery-agreement-area">
            <div className="title">비회원 개인정보 수집 및 이용 동의</div>

            <div className="discription">
                <div className="discription-inner">
                    <p className="discription_title">개인정보의 수집 및 이용에 대한 안내</p>
                    <p className="discription_title">수집 항목</p>
                    <p>주문고객정보 (주문자이름, 이메일, 휴대폰번호)</p>
                    <p>배송지정보 (수취인이름, 배송지주소, 휴대폰번호, 전화번호)</p>
                    <p>결제정보 (카드정보, 계좌정보)</p>
                    <br />
                    <p className="discription_title">수집 목적</p>
                    <p>주문 확인, 주문상품 결제, 주문상품 배송</p>
                    <br />
                    <p className="discription_title">이용 기간</p>
                    <p className="fwBd underline">
                        원칙적으로 개인정보 수집 및 이용목적이 달성된 후에 해당 정보를 지체 없이 파기합니다.
                    </p>
                    <p className="fwBd underline">
                        단, 관계법령의 규정에 의하여 필요가 있는 경우 일정기간 동안 개인정보를 보관할 수 있습니다.
                    </p>
                    <p>
                        귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다.
                        단, 거부하는 경우 상품 구매가 불가능합니다.
                    </p>
                    <p>
                        <br />
                        그 밖의 사항은 일룸 개인정보처리방침을 준수합니다.
                    </p>
                </div>
            </div>

            <div className="agree-checkbox" onClick={() => setIsAgree((prev) => !prev)}>
                <img
                    src={
                        isAgree
                            ? './images/logo-icon/order-isChecked-true.png'
                            : './images/logo-icon/order-isChecked-false.png'
                    }
                    alt="동의 체크"
                />
                <span>비회원 구매 약관에 동의합니다.</span>
            </div>
        </div>
    )
}
