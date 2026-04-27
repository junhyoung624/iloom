import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getOrderByOrderId, getOrderByPhone } from '../firebase/orderService';
import { findEmailByNameAndPhone } from '../firebase/userService';

const Login = () => {

  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || "");
  const [pass, setPass] = useState("");
  const [saveId, setSaveId] = useState(() => !!localStorage.getItem('savedEmail'))

  const { onLogin, onGoogleLogin, onKakaoLogin, onNaverLogin } = useAuthStore();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('phone')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestOrderId, setGuestOrderId] = useState('')
  const [orderResult, setOrderResult] = useState(null)
  const [orderError, setOrderError] = useState('')

  const [showOrderModal, setShowOrderModal] = useState(false)

  const [showFindModal, setShowFindModal] = useState(false)
  const [findType, setFindType] = useState('password')
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetError, setResetError] = useState('')

  const [findName, setFindName] = useState('')
  const [findPhone, setFindPhone] = useState('')
  const [foundEmail, setFoundEmail] = useState('')
  const [findError, setFindError] = useState('')

  const handleFindId = async (e) => {
    e.preventDefault()
    setFoundEmail('')
    setFindError('')
    try {
      const email = await findEmailByNameAndPhone(findName, findPhone)
      if (email) {
        setFoundEmail(email)
      } else {
        setFindError('일치하는 회원 정보가 없습니다.')
      }
    } catch (err) {
      setFindError('오류가 발생했습니다.')
    }
  }

  // 비회원주문
  const handleGuestSearch = async (e) => {
    e.preventDefault()
    setOrderError('')
    setOrderResult(null)

    try {
      let result
      if (searchType === 'phone') {
        result = await getOrderByPhone(guestName, guestPhone)
      } else {
        result = await getOrderByOrderId(guestName, guestOrderId)
      }
      if (result.length === 0) {
        setOrderError('일치하는 주문 정보가 없습니다.')
      } else {
        setOrderResult(result)
        setShowOrderModal(true)
      }
    } catch (err) {
      setOrderError('조회 중 오류가 발생했습니다.')
    }
  }

  // 기본 이메일 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saveId) {
      localStorage.setItem('savedEmail', email)
    } else {
      localStorage.removeItem('savedEmail')
    }
    const result = await onLogin(email, pass);
    if (result) navigate("/")
  }

  const handleGoogleLogin = async () => {
    console.log("구글로그인시도");
    const result = await onGoogleLogin();
    if (result) navigate("/")
  }

  const handleKakaoLogin = async () => {
    console.log("카카오 로그인 시도");
    const result = await onKakaoLogin();
    if (result) navigate("/");
  }

  // 네이버 로그인
  const handleNaverLogin = () => {
    onNaverLogin();
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setResetMsg('')
    setResetError('')
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setResetMsg('비밀번호 재설정 이메일을 전송했습니다.')
    } catch (err) {
      setResetError('등록되지 않은 이메일입니다.')
    }
  }

  return (
    <div className="login-wrap">
      <h1>회원 로그인</h1>
      <div className="inner">

        <div className="login-left">
          <h2>회원 로그인</h2>
          <form onSubmit={handleSubmit}>
            <p>아이디(이메일)</p>
            <input type="email" placeholder='ID 또는 이메일'
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <p>비밀번호</p>
            <input type="password" placeholder='비밀번호'
              onChange={(e) => setPass(e.target.value)} />
            <label>
              <input type="checkbox" checked={saveId} onChange={(e) => {
                setSaveId(e.target.checked)
                if (!e.target.checked) localStorage.removeItem('savedEmail')
              }} />아이디 저장
            </label>
            <p style={{ color: "#C9C9C9" }}>* 개인정보를 위해 개인PC에서만 이용해주세요</p>


            <button type='submit'>로그인</button>

            <div className='login-under'>
              <button type="button" className="search-id-pass" onClick={() => {
                setShowFindModal(true)
                setFoundEmail('')
                setFindError('')
                setFindName('')
                setFindPhone('')
                setResetMsg('')
                setResetError('')
              }}>아이디/비밀번호 찾기</button>
              <Link to="/member" className='new-member'>회원가입</Link>
            </div>
          </form>

          <p style={{ textAlign: "center" }}>간편로그인</p>
          <div className="web-login-wrap">
            <button type='button' className='web-login' onClick={handleGoogleLogin}><img src="./images/logo-icon/google-icon.png" alt="" /></button>
            <button type='button' className='web-login' onClick={handleKakaoLogin}><img src="./images/logo-icon/kakao-icon.png" alt="" /></button>
            <button type='button' className='web-login' onClick={handleNaverLogin}><img src="./images/logo-icon/naver-icon.png" alt="" /></button>
          </div>
        </div>
        <div className="login-right">
          <h2>비회원 주문/배송 조회</h2>
          <form onSubmit={handleGuestSearch}>
            <p>이름</p>
            <input type="text" placeholder='이름을 입력하세요'
              onChange={(e) => setGuestName(e.target.value)} />

            <div className="radio-wrap">
              <label><input type="radio" name="type" value="order"
                onChange={() => setSearchType('order')} /> 주문번호</label>
              <label><input type="radio" name="type" value="phone"
                defaultChecked onChange={() => setSearchType('phone')} /> 휴대폰번호</label>
            </div>

            {searchType === 'phone' ? (
              <div className="phone">
                <input type="text" placeholder="주문시 입력한 휴대폰 번호 (- 없이 입력)"
                  onChange={(e) => setGuestPhone(e.target.value)} />
              </div>
            ) : (
              <div className="order">
                <input type="text" placeholder="주문번호를 입력하세요"
                  onChange={(e) => setGuestOrderId(e.target.value)} />
              </div>
            )}
            <p style={{ color: "#C9C9C9" }}>주문번호를 잊으신 경우, <br />
              일룸 고객센터 1577 -5670로 문의하여 주시기 바랍니다.</p>
            {orderError && <p style={{ color: 'red' }}>{orderError}</p>}
            <button type="submit">조회</button>
          </form>

        </div>
      </div >
      {showOrderModal && orderResult && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowOrderModal(false)}>✕</button>
            {orderResult.map((order) => (
              <div className="order-result" key={order.id}>
                <h3>주문정보</h3>
                <div className="order-info-grid">
                  <span>주문번호</span><span>{order.orderId}</span>
                  <span>주문 상태</span><span>{order.status}</span>
                  <span>택배사</span><span>{order.deliveryInfo?.carrier}</span>
                  <span>송장번호</span><span>{order.deliveryInfo?.trackingNumber}</span>
                  <span>배송 예정일</span><span>{order.deliveryInfo?.estimatedDate}</span>
                </div>
                <h3>주문 상품</h3>
                {order.items?.map((item, i) => (
                  <div className="order-item" key={i}>
                    <img src={item.productImages?.[0]} alt={item.name} />
                    <div className="order-info">
                      <span className="item-name">{item.name}</span>
                      <span>{item.color}</span>
                      <span>{item.qty}개</span>
                      <span className="item-price">{item.price.toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {
        showFindModal && (
          <div className="modal-overlay" onClick={() => setShowFindModal(false)}>
            <div className="find-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowFindModal(false)}>✕</button>
              <h2>아이디/비밀번호 찾기</h2>

              <div className="find-tab">
                <button
                  className={findType === 'id' ? 'active' : ''}
                  onClick={() => setFindType('id')}>아이디 찾기</button>
                <button
                  className={findType === 'password' ? 'active' : ''}
                  onClick={() => setFindType('password')}>비밀번호 찾기</button>
              </div>

              {findType === 'id' ? (
                <div className="find-id">
                  <form onSubmit={handleFindId}>
                    <p>이름</p>
                    <input type="text" placeholder="이름을 입력하세요"
                      onChange={(e) => setFindName(e.target.value)} />
                    <p>휴대폰번호</p>
                    <input type="text" placeholder="휴대폰번호 (- 없이 입력)"
                      onChange={(e) => setFindPhone(e.target.value)} />
                    {foundEmail && (
                      <div className="found-email">
                        가입된 이메일: <strong>{foundEmail}</strong>
                      </div>
                    )}
                    {findError && <p style={{ color: 'red' }}>{findError}</p>}
                    <button type="submit">아이디 찾기</button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset}>
                  <p>가입한 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
                  <input
                    type="email"
                    placeholder="가입한 이메일을 입력하세요"
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  {resetMsg && <p style={{ color: 'green' }}>{resetMsg}</p>}
                  {resetError && <p style={{ color: 'red' }}>{resetError}</p>}
                  <button type="submit">재설정 이메일 전송</button>
                </form>
              )}
            </div>
          </div>
        )
      }
    </div >
  )
}

export default Login