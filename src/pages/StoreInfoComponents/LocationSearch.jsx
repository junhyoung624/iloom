import React, { useState } from 'react';
import DropDown from './DropDown';
import { store_region } from '../../data/storeRegionCode';


export default function LocationSearch(
    selectedRegion,
    setSelectedRegion,
    selectedSubRegion,
    setSelectedSubRegion,
    storeRegion,) {

    const first_option_arr = store_region.map((item) => ({
        value: item.code,
        label: item.name,
        sub_region: item.sub_region,
    }));

    const selectedArea1 =
        first_option_arr.find((item) => item.value === selectedRegion) ||
        first_option_arr[0];

    // const [selectedArea_1, setSelectedArea_1] = useState(first_option_arr[0]);
    // const [selectedArea_2, setSelectedArea_2] = useState(null);

    const second_option_arr =
        selectedArea1?.sub_region?.map((item) => ({
            value: item,
            label: item
        })) || [];


    const selectedArea2 =
        second_option_arr.find((item) => item.value === selectedSubRegion) || null;


    const getSelected_1 = (selected) => {
        setSelectedRegion(selected.value);
        setSelectedSubRegion("시/군/구");


    }
    const getSelected_2 = (selected) => {
        setSelectedSubRegion(selected.value);
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
                            value={selectedArea1}
                            placeholder="시/도" />
                    </div>
                    <div className="selector area2">
                        {/* selector area2 */}
                        <DropDown
                            data={second_option_arr}
                            selected={getSelected_2}
                            value={selectedArea2}
                            placeholder="시/군/구" />
                    </div>
                </div>
            </form>
        </div>
    );
}
