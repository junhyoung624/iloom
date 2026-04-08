import React, { useState } from 'react';
import KeywordSearch from './KeywordSearch';
import LocationSearch from './LocationSearch';

export default function InfoHeader() {
    //tab 상태 저장
    //keyword, location
    const [selectedSearch, setSelectedSearch] = useState("keyword");
    console.log(selectedSearch);

    return (
        <div className='store-control-header'>
            <ul className="tab">
                <li onClick={() => setSelectedSearch("keyword")} className={selectedSearch === "keyword" ? "tab_active" : ""}><a href="#">직접검색</a></li>
                <li onClick={() => setSelectedSearch("location")} className={selectedSearch === "location" ? "tab_active" : ""}><a href="#">지역검색</a></li>
            </ul>
            <div className="store-control-search-section">
                {
                    selectedSearch === "keyword" ? <KeywordSearch /> : <LocationSearch />
                }
            </div>



        </div>
    );
}
