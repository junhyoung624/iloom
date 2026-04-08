import React from 'react'
import "./scss/storeInfo.scss"
import InfoBody from './StoreInfoComponents/InfoBody'
import InfoHeader from './StoreInfoComponents/InfoHeader'
const StoreInfo = () => {
  return (
    <div className="store-info-wrap">
      <div className="store-info-title">
        매장안내
      </div>
      <div className="store-info-main">
        <div className="store-control">
          <InfoHeader />
          <InfoBody />
        </div>
        <div className="store-map">
          map section
        </div>
      </div>

    </div>

  )
}

export default StoreInfo