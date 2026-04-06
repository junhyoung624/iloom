import React from 'react'

const UserMenu = ({userClose}) => {
  return (
    <div>
        <h2>User User User</h2>
        <p className='close-btn' onClick={userClose}><img src="./images/logo-icon/close-btn-black.png" alt="" /></p>
    </div>
  )
}

export default UserMenu