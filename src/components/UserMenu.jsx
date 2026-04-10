import React from 'react'
import { useAuthStore } from '../store/useAuthStore'

const UserMenu = ({ userClose }) => {
  const { user } = useAuthStore();
  return (

    <div>
      <h2>{user?.name}</h2>
      <p className='close-btn' onClick={userClose}><img src="./images/logo-icon/close-btn-black.png" alt="" /></p>
    </div>
  )
}

export default UserMenu