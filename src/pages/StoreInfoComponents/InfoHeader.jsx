import React, { useState } from 'react';
import KeywordSearch from './KeywordSearch';
import LocationSearch from './LocationSearch';

export default function InfoHeader({
    selectedSearch,
    setSelectedSearch,
    keyword,
    setKeyword,
    selectedRegion,
    setSelectedRegion,
    selectedSubRegion,
    setSelectedSubRegion,
    storeRegion,
}) {
    //tab 상태 저장
    //keyword, location
    const [selectedSearchType, setSelectedSearchType] = useState("keyword");
    console.log(selectedSearchType);

    return (
        <div className='store-control-header'>
            <ul className="tab">
                <li onClick={() => setSelectedSearchType("keyword")} className={selectedSearchType === "keyword" ? "tab_active" : ""}><a href="#">직접검색</a></li>
                <li onClick={() => setSelectedSearchType("location")} className={selectedSearchType === "location" ? "tab_active" : ""}><a href="#">지역검색</a></li>
            </ul>
            <div className="store-control-search-section">
                {
                    selectedSearchType === "keyword" ? (<KeywordSearch keyword={keyword} setKeyword={setKeyword} />)
                        : (
                            <LocationSearch

                                selectedRegion={selectedRegion}
                                setSelectedRegion={setSelectedRegion}
                                selectedSubRegion={selectedSubRegion}
                                setSelectedSubRegion={setSelectedSubRegion}
                                storeRegion={storeRegion} />
                        )
                }
            </div>
        </div>
    );
}
