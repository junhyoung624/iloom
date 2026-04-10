import React, { useState } from 'react';
import DropDown from './DropDown';
import { store_region } from '../../data/storeRegionCode';


export default function LocationSearch() {

    const first_option_arr = store_region.map((item) => ({
        value: item.code,
        label: item.name,
        sub_region: item.sub_region,
    }));

    const [selectedArea_1, setSelectedArea_1] = useState(first_option_arr[0]);
    const [selectedArea_2, setSelectedArea_2] = useState(null);

    const second_option_arr =
        selectedArea_1?.sub_region?.map((item) => ({
            value: item,
            label: item
        })) || [];


    const getSelected_1 = (selected) => {
        setSelectedArea_1(selected);
        console.log("selected area 1", selectedArea_1);
        setSelectedArea_2(null);


    }
    const getSelected_2 = (selected) => {
        setSelectedArea_2(selected);
    }
    return (
        <div className="store-location-search">
            <form action="" className="store-search-form">
                <div className="location">
                    {/* dropdown 컴포넌트 넣기 */}
                    <div className="selector area1">
                        {/* selector area1 */}
                        <DropDown
                            data={first_option_arr}
                            selected={getSelected_1}
                            value={selectedArea_1}
                            placeholder="시/도" />
                    </div>
                    <div className="selector area2">
                        {/* selector area2 */}
                        <DropDown
                            data={second_option_arr}
                            selected={getSelected_2}
                            value={selectedArea_2}
                            placeholder="시/군/구" />
                    </div>
                </div>
            </form>
        </div>
    );
}
