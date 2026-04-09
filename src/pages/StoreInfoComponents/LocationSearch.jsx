import React from 'react';
import DropDown from './DropDown';
import { store_region } from '../../data/storeRegionCode';

export default function LocationSearch() {
    return (
        <div className="store-location-search">
            <form action="" className="store-search-form">
                <div className="location">
                    {/* dropdown 컴포넌트 넣기 */}
                    <div className="selector area1">
                        selector area1
                        <DropDown data={store_region} />
                    </div>
                    <div className="selector area2">
                        selector area2
                    </div>
                </div>
            </form>
        </div>
    );
}
