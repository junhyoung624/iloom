import React from 'react';
import "../scss/StoreListItem.scss";

export default function StoreListItem({ storeType, storeName, storeAddress, storePhoneNumber }) {
    return (

        <div className='store-list-item-wrap'>
            <div className="store-item-top">
                {storeType === "프리미엄샵" ? "PremiumShop" : "BrandShop"}
            </div>
            <div className="store-item-main">
                <div className="store-main-info">
                    <p>{storeName}</p>
                </div>
                <div className="store-sub-info">
                    <div className="addr">
                        <p><img src="./images/storeInfo/location.png" alt="." /></p>
                        <p>{storeAddress}</p>
                    </div>
                    <div className="phone">
                        <p><img src="./images/storeInfo/phone.png" alt="." /></p>
                        <p>{storePhoneNumber}</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
