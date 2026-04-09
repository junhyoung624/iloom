import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div className="login-wrap">
      <h1>회원 로그인</h1>
      <div className="inner">

        <div className="login-left">
          <h2>회원 로그인</h2>
          <form>
            <p>아이디(이메일)</p>
            <input type="emial" placeholder='ID 또는 이메일' />
            <p>비밀번호</p>
            <input type="password" placeholder='비밀번호' />
            <label>
              <input type="checkbox" />아이디 저장
            </label>
            <p style={{ color: "#C9C9C9" }}>* 개인정보를 위해 개인PC에서만 이용해주세요</p>
            

            <button type='submit'>로그인</button>

            <button><Link to="/">아이디/비밀번호 찾기</Link></button>
            <button><Link to="/member">회원가입</Link></button>
          </form>

          <p style={{ textAlign: "center" }}>간편로그인</p>
          <div className="web-login-wrap">
            <button type='button' className='web-login'><img src="./images/logo-icon/google-icon.png" alt="" /></button>
            <button type='button' className='web-login'><img src="./images/logo-icon/kakao-icon.png" alt="" /></button>
            <button type='button' className='web-login'><img src="./images/logo-icon/naver-icon.png" alt="" /></button>
          </div>
        </div>
        <div className="login-right">
          <h2>비회원 주문/배송 조회</h2>
          <form >
            <p>이름</p>
            <input type="text" placeholder='이름을 입력하세요' />

            <div className="radio-wrap">
              <label><input type="radio" name="type" /> 주문번호</label>
              <label><input type="radio" name="type" /> 휴대폰번호</label>
            </div>

            <div className="phone">
              <input
                type="text"
                placeholder="주문 시 입력한 휴대폰번호 (- 없이 입력)"
              />
              <button type="button">휴대폰 인증</button>
            </div>
            <p style={{ color: "#C9C9C9" }}>주문번호를 잊으신 경우, <br />
              일룸 고객센터 1577 -5670로 문의하여 주시기 바랍니다.</p>
            <button type="submit">조회</button>
            <p className='pass'>비밀번호를 잊으셨나요?</p>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Login