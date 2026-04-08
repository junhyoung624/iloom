import React from 'react'
import { Link } from 'react-router-dom'
import "./scss/footer.scss"

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-left">
                    <h2 className="footer-logo">
                        <img src="./images/footer/Logo-303030.png" alt="iloom" />
                    </h2>
                    <p className="footer-slogan">
                        당신의 모든 순간이 일룸과 함께 다정하기를.
                    </p>
                    <div className="footer-sns">
                        <img src="./images/footer/icon-facebook.png" alt="" />
                        <img src="./images/footer/icon-instagram.png" alt="" />
                        <img src="./images/footer/icon-blog.png" alt="" />
                    </div>
                </div>

                <div className="footer-center">
                    <div className="footer-company">
                        <p>
                            서울시 송파구 오금로 311 (오금동45-1) (주)일룸 대표이사 정보은
                        </p>
                        <p>개인정보보호 책임자 : 정보은</p>
                        <p>
                            사업자등록번호 : 215-86-93600 통신판매업신고 : 2009-서울송파-0069호
                            부가통신사업신고 필증 : 021129
                        </p>
                        <p>호스팅 서비스사업자 (주)일룸</p>
                    </div>

                    <div className="footer-links">
                        <Link to="https://www.iloom.com/policy/termsOfUse.do">이용약관</Link>
                        <Link to="https://www.iloom.com/policy/privacy.do">개인정보처리방침</Link>
                        <Link to="https://www.kbei.org/whistle/center/?code=fursysgroup">윤리신고센터</Link>
                    </div>

                    <p className="footer-copy">
                        webmaster@iloom.com Copyright ©2018 iloom Inc. All rights reserved
                    </p>
                </div>

                <div className="footer-right">
                    <div className="footer-certifications">
                        <img src="./images/footer/mark01.png" alt="ISMS 인증" />
                        <img src="./images/footer/mark02.png" alt="개인정보보호 인증" />
                        <img src="./images/footer/mark03.png" alt="Norton Secured" />
                        <img src="./images/footer/mark04.png" alt="SPC Networks" />
                    </div>

                    <div className="footer-inquiry-links">
                        <Link to="">빠른 상담문의</Link>
                        <span>|</span>
                        <Link to="https://cs.iloom.com/">서비스 문의 및 신청</Link>
                    </div>

                    <div className="footer-customer">
                        <strong className="footer-customer-title">고객센터</strong>
                        <strong className="footer-customer-number">1577-5670</strong>
                    </div>

                    <div className="footer-hours">
                        <p>평일&nbsp;&nbsp;9:30 ~ 17:30 (점심시간 12:30 ~ 13:30)</p>
                        <p>토요일&nbsp;&nbsp;9:30 ~ 12:30 (A/S 관련 상담만 진행)</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
