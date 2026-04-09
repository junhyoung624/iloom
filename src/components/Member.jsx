import React, { useState } from 'react'
import "./scss/login.scss"

const Member = () => {
  const [formData, setFormData] = useState({
    
  })
  return (
    <div className='member-wrap'>
      <div className="inner">
        <h2>회원가입</h2>
        <form>
          <p>사용자 이름</p>
          <input type="text" placeholder='이름을 입력하세요'/>
          <p>아이디(이메일)</p>
          <input type="email" placeholder='이메일을 입력하세요'/>
          <p>비밀번호</p>
          <input type="password" placeholder='비밀번호를 입력하세요'/>
          <p>휴대폰번호</p>
          <input type="text" placeholder='전화번호를 입력하세요'/>

          <input type="submit" value="가입하기" />
        </form>
      </div>
    </div>
  )
}

export default Member