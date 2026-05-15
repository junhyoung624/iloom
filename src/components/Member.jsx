import React, { useState } from 'react'
import "./scss/login.scss"
import { useAuthStore } from '../store/useAuthStore'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/

const Member = () => {
  const [formData, setFormData] = useState({
    uname: "",
    email: "",
    password: "",
    phone: ""
  })
  const [errors, setErrors] = useState({})
  const [fieldStatus, setFieldStatus] = useState({
    email: 'idle',
    phone: 'idle'
  })

  const { onMember } = useAuthStore()
  const navigate = useNavigate()

  const validateLiveField = (name, value, isBlur = false) => {
    const trimmedValue = value.trim()
    let message = ''
    let status = 'idle'

    if (name === 'email') {
      if (!trimmedValue) {
        message = isBlur ? '이메일이 필요합니다.' : ''
        status = isBlur ? 'error' : 'idle'
      } else if (!emailRegex.test(trimmedValue)) {
        message = '유효한 이메일 주소를 입력하세요.'
        status = 'error'
      } else {
        status = 'success'
      }
    }

    if (name === 'phone') {
      if (!trimmedValue) {
        message = isBlur ? '휴대폰 번호가 필요합니다.' : ''
        status = isBlur ? 'error' : 'idle'
      } else if (!phoneRegex.test(trimmedValue)) {
        message = '유효한 휴대폰 번호를 입력하세요.'
        status = 'error'
      } else {
        status = 'success'
      }
    }

    setErrors((prev) => ({ ...prev, [name]: message }))
    setFieldStatus((prev) => ({ ...prev, [name]: status }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.uname.trim()) newErrors.uname = '이름을 입력해주세요.'
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = '이메일 형식이 올바르지 않습니다.'
    }
    if (!formData.password.trim()) newErrors.password = '비밀번호를 입력해주세요.'
    if (!formData.phone.trim()) {
      newErrors.phone = '휴대폰 번호를 입력해주세요.'
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = '휴대폰 번호 형식이 올바르지 않습니다.'
    }

    setErrors(newErrors)
    setFieldStatus({
      email: newErrors.email ? 'error' : 'success',
      phone: newErrors.phone ? 'error' : 'success'
    })

    if (Object.keys(newErrors).length > 0) {
      const hasEmptyRequired = ['uname', 'email', 'password', 'phone'].some(
        (field) => !formData[field].trim()
      )
      toast(hasEmptyRequired ? '필수 정보를 모두 입력해주세요.' : '입력 형식을 확인해주세요.')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const success = await onMember({
      ...formData,
      email: formData.email.trim(),
      phone: formData.phone.replace(/-/g, '').trim()
    })

    if (success) navigate("/login")
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === 'email' || name === 'phone') {
      validateLiveField(name, value, false)
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const renderError = (message) => (
    <span className="member-error-text">
      <img src="/images/logo-icon/format-alert.png" alt="" />
      {message}
    </span>
  )

  return (
    <>
      <div className="sub-page">
        <ul className="breadcrumb-list" style={{ paddingTop: "120px" }}>
          <li>
            <Link to="/"><img src="/images/logo-icon/home-icon.png" alt="" /></Link>
          </li>
          <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
          <li>
            <Link to="/login?">로그인</Link>
          </li>
          <li><img src="/images/logo-icon/arrow-right.png" alt="" /></li>
          <li>
            <Link to="/member">회원가입</Link>
          </li>
        </ul>
      </div>

      <div className='member-wrap'>
        <div className="inner">
          <h2>회원가입</h2>
          <form onSubmit={handleSubmit}>
            <p>사용자 이름</p>
            <input
              type="text"
              placeholder='이름을 입력하세요'
              name="uname"
              value={formData.uname}
              onChange={handleChange}
            />
            {errors.uname && renderError(errors.uname)}

            <p>아이디(이메일)</p>
            <input
              type="email"
              placeholder='이메일을 입력하세요'
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={(e) => validateLiveField(e.target.name, e.target.value, true)}
              className={fieldStatus.email}
            />
            {errors.email && renderError(errors.email)}

            <p>비밀번호</p>
            <input
              type="password"
              placeholder='비밀번호를 입력하세요'
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && renderError(errors.password)}

            <p>휴대폰번호</p>
            <input
              type="text"
              placeholder='전화번호를 입력하세요'
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={(e) => validateLiveField(e.target.name, e.target.value, true)}
              className={fieldStatus.phone}
            />
            {errors.phone && renderError(errors.phone)}

            <input type="submit" value="가입하기" />
          </form>
        </div>
      </div>
    </>
  )
}

export default Member
