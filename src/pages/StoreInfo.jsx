import React, { useEffect, useState } from 'react'
import "./scss/storeInfo.scss"
import InfoBody from './StoreInfoComponents/InfoBody'
import InfoHeader from './StoreInfoComponents/InfoHeader'
import { storeInfoData } from '../data/storeInfoData'
import { store_region } from '../data/storeRegionCode'
import StoreKakaoMap from './StoreInfoComponents/StoreKakaoMap'

const StoreInfo = () => {

  const [selectedSearch, setSelectedSearch] = useState("keyword")
  const [selectedRegion, setSelectedRegion] = useState("default")
  const [selectedSubRegion, setSelectedSubRegion] = useState("시/군/구")
  const [keyword, setKeyword] = useState("")
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [kakaoReady, setKakaoReady] = useState(false)

  const newStoreInfo = storeInfoData.map((store) => ({
    ...store,
    latitude: Number(store.latitude),
    longitude: Number(store.longitude),
  }))

  const filteredStoreInfo = newStoreInfo.filter((store) => {
    const matchKeyword =
      selectedSearch !== "keyword" ||
      keyword.trim() === "" ||
      store.store_name.includes(keyword) ||
      store.address.includes(keyword)

    const matchRegion =
      selectedSearch !== "location" ||
      selectedRegion === "default" ||
      store.region_code === selectedRegion

    const matchSubRegion =
      selectedSearch !== "location" ||
      selectedSubRegion === "시/군/구" ||
      store.address.includes(selectedSubRegion)

    return matchKeyword && matchRegion && matchSubRegion
  })

  const selectedStore =
    filteredStoreInfo.find((store) => store.id === selectedStoreId) || null

  useEffect(() => {
    if (
      selectedStoreId &&
      !filteredStoreInfo.some((store) => store.id === selectedStoreId)
    ) {
      setSelectedStoreId(null)
    }
  }, [filteredStoreInfo, selectedStoreId])

  useEffect(() => {
    setSelectedSubRegion("시/군/구")
  }, [selectedRegion])

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setKakaoReady(true)
      return
    }

    const mapScript = document.createElement("script")
    mapScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&libraries=services,clusterer&autoload=false`
    mapScript.onload = () => window.kakao.maps.load(() => {
      setKakaoReady(true)
    })
    document.head.appendChild(mapScript)
  }, [])

  return (
    <div className="store-info-wrap">
      <div className="inner">
        <div className="store-info-title">
          매장안내
        </div>
        <div className="store-info-main">
          <div className="store-control">
            <div className="control-header">
              <InfoHeader
                selectedSearch={selectedSearch}
                setSelectedSearch={setSelectedSearch}
                keyword={keyword}
                setKeyword={setKeyword}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedSubRegion={selectedSubRegion}
                setSelectedSubRegion={setSelectedSubRegion}
                storeRegion={store_region}
              />
            </div>
            <div className="control-body">
              <InfoBody
                stores={filteredStoreInfo}
                selectedStoreId={selectedStoreId}
                setSelectedStoreId={setSelectedStoreId} />
            </div>
          </div>
          <div className="store-map">
            {kakaoReady && (
              <StoreKakaoMap
                stores={filteredStoreInfo}
                selectedStore={selectedStore}
                setSelectedStoreId={setSelectedStoreId} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreInfo