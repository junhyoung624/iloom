import React from 'react';
import "../scss/infobody.scss";
import StoreListItem from './StoreListItem';

export default function InfoBody({ stores, selectedStoreId, setSelectedStoreId }) {
    if (stores.length === 0) {
        return <div className='store-list-empty'>검색 결과가 없습니다.</div>
    }
    return (
        <div className='store-list'>
            {stores.map((store) => (
                <div
                    className={`store-item ${selectedStoreId === store.id ? "is-active" : ""}`}
                    onClick={() => setSelectedStoreId(store.id)}>

                    {/* <div className="store-item-top">
                        {store.store_type}
                    </div>
                    <div className="store-item-main">
                        <p>{store.store_name}</p>
                        <p>{store.store_address}</p>
                        <p>{store.phone}</p>
                    </div> */}
                    <StoreListItem
                        storeType={store.store_type}
                        storeName={store.store_name}
                        storeAddress={store.address}
                        storePhoneNumber={store.phone}
                    />
                </div>
            ))}
        </div>
    );
}
