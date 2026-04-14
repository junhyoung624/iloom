import React, { useEffect, useState } from 'react'
import "./scss/storeInfo.scss"
import InfoBody from './StoreInfoComponents/InfoBody'
import InfoHeader from './StoreInfoComponents/InfoHeader'
import { storeInfoData } from '../data/storeInfoData'
import { store_region } from '../data/storeRegionCode'

//store info 안에
//모든 상태 보관
//필터링된 매장 계산
//infoheader, infobody, kakaomap에 props전달
const StoreInfo = () => {

  const [selectedSearch, setSelectedSearch] = useState("keyword");
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedSubRegion, setSelectedSubRegion] = useState("시/군/구");
  const [keyword, setKeyword] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const newStoreInfo = storeInfoData.map((store) => ({
    ...store,
    latitude: Number(store.latitude),
    longitude: Number(store.longitude),
  }));

  const filteredStoreInfo = newStoreInfo.filter((store) => {
    const matchKeyword =
      selectedSearch !== "keyword" ||
      keyword.trim() === "" ||
      store.store_name.includes(keyword) ||
      store.address.includes(keyword);

    const matchRegion =
      selectedSearch !== "location" ||
      selectedRegion === "default" ||
      store.region_code === selectedRegion;

    const matchSubRegion =
      selectedSearch !== "location" ||
      selectedSubRegion === "시/군/구" ||
      store.address.includes(selectedSubRegion);

    return matchKeyword && matchRegion && matchSubRegion;
  });

  const selectedStore =
    filteredStoreInfo.find((store) => store.id === selectedStoreId) || null;


  useEffect(() => {
    if (
      selectedStoreId &&
      !filteredStoreInfo.some((store) => store.id === selectedStoreId)
    ) {
      setSelectedStoreId(null);
    }
  }, [filteredStoreInfo, selectedStoreId]);

  useEffect(() => {
    setSelectedSubRegion("시/군/구");
  }, [selectedRegion]);
  return (
    <div className="store-info-wrap">
      <div className="store-info-title">
        매장안내
      </div>
      <div className="store-info-main">
        <div className="store-control">
          {/* Info header : 검색 입력값 변경 이벤트 전달 */}
          <InfoHeader selectedSearch={selectedSearch}
            setSelectedSearch={setSelectedSearch}
            keyword={keyword}
            setKeyword={setKeyword}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedSubRegion={selectedSubRegion}
            setSelectedSubRegion={setSelectedSubRegion}
            storeRegion={store_region}
          />
          {/* Info body : 왼쪽 매장 리스트 렌더링, 클릭한 매장 선택 */}
          <InfoBody
            stores={filteredStoreInfo}
            selectedStoreId={selectedStoreId}
            setSelectedStoreId={setSelectedStoreId} />
        </div>
        <div className="store-map">
          map section
          {/* 필터링된 매장 마커 표시 */}
          {/* 마커 클릭시 선택된 매장으로 이동 */}
        </div>
      </div>

    </div>

  )
}

export default StoreInfo