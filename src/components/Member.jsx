import React, { useState } from 'react'
import "./scss/login.scss"
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Member = () => {
  const [formData, setFormData] = useState({
    uname: "",
    email: "",
    password: "",
    phone: ""
  });

  // 회원가입

  const {onMember} = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onMember(formData);
    
    {success ? navigate("/login") : ""}
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value})
  }

  return (
    <div className='member-wrap'>
      <div className="inner">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <p>사용자 이름</p>
          <input type="text" placeholder='이름을 입력하세요'
          name="uname" onChange={handleChange}/>
          <p>아이디(이메일)</p>
          <input type="email" placeholder='이메일을 입력하세요'
          name="email"  onChange={handleChange}/>
          <p>비밀번호</p>
          <input type="password" placeholder='비밀번호를 입력하세요'
          name="password" onChange={handleChange}/>
          <p>휴대폰번호</p>
          <input type="text" placeholder='전화번호를 입력하세요'
          name="phone" onChange={handleChange}/>

          <input type="submit" value="가입하기" />
        </form>
      </div>
    </div>
  )
}

export default Member