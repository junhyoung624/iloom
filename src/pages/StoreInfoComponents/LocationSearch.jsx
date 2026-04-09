import React, { useState } from 'react';
import DropDown from './DropDown';
import { store_region } from '../../data/storeRegionCode';

export default function LocationSearch() {

    const [selectedArea_1, setSelectedArea_1] = useState("서울");
    const [selectedArea_2, setSelectedArea_2] = useState("");
    const [subRegionArr, setSubRegionArr] = useState([]);
    const sub_area_arr = [];

    const getSelected_1 = (selected) => {
        setSelectedArea_1(selected);
        console.log("selected area 1", selectedArea_1);
        //selectedArea_1의 서브지역 불러오기
        const sub_info = store_region.filter((item) => item.name === selectedArea_1);
        console.log("sub region : ", sub_info);


    }
    const getSelected_2 = () => {

    }
    return (
        <div className="store-location-search">
            <form action="" className="store-search-form">
                <div className="location">
                    {/* dropdown 컴포넌트 넣기 */}
                    <div className="selector area1">
                        {/* selector area1 */}
                        <DropDown data={store_region} selected={getSelected_1} />
                    </div>
                    <div className="selector area2">
                        {/* selector area2 */}
                        <DropDown data={store_region} selected={getSelected_2} />
                    </div>
                </div>
            </form>
        </div>
    );
}
