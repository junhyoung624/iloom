import React, { useEffect } from 'react';

export default function StoreKakaoMap({ stores = [], selectedStore, setSelectedStoreId }) {


    useEffect(() => {

        if (!window.kakao) return;

        window.kakao.maps.load(() => {

            const container = document.getElementById("map");


            if (!container) return;

            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                level: 8,
            };

            //맵 사이즈
            const map = new window.kakao.maps.Map(container, options);
            // if (!map) return;


            // const handleResize = () => {
            //     const center = map.getCenter();
            //     map.relayout();
            //     map.setCenter(center);
            // }

            // window.addEventListener("resize", handleResize);


            const bounds = new window.kakao.maps.LatLngBounds();


            //마커 클러스터
            const clusterer = new window.kakao.maps.MarkerClusterer({
                map: map,
                averageCenter: true,
                minLevel: 5,
            })

            var imageSrc = './images/storeInfo/map-pin.svg', // 마커이미지의 주소입니다    
                imageSize = new kakao.maps.Size(30, 30), // 마커이미지의 크기입니다
                imageOption = { offset: new kakao.maps.Point(27, 69) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

            // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

            //마커 클릭 이벤트 관리
            let openedInfoWindow = null;
            let openedMarkerId = null;

            const markers = stores.filter((store) => store.latitude && store.longitude)
                .map((store) => {

                    const position = new window.kakao.maps.LatLng(
                        Number(store.latitude),
                        Number(store.longitude)
                    );

                    const marker = new window.kakao.maps.Marker({
                        position,
                        image: markerImage
                    });

                    const content = `
                        <div style="padding:10px; min-width:240px; font-size:13px; line-height:1.5;">
                            <strong style="display:block; margin-bottom:4px;">${store.store_name}</strong>
                            <div style="margin-top:4px;">${store.phone}</div>
                        </div>
                    `;

                    const infowindow = new window.kakao.maps.InfoWindow({
                        content,
                        removable: true,
                    });

                    window.kakao.maps.event.addListener(marker, "click", () => {
                        if (openedInfoWindow) {
                            openedInfoWindow.close();
                        }
                        infowindow.open(map, marker);
                        openedInfoWindow = infowindow;
                        setSelectedStoreId(store.id);

                    });
                    bounds.extend(position);
                    return marker;
                    // return new window.kakao.maps.Marker({
                    //     position: new window.kakao.maps.LatLng(
                    //         store.latitude,
                    //         store.longitude,
                    //     ),
                    //     image: markerImage,
                    // })
                });

            clusterer.addMarkers(markers);
            if (selectedStore) {
                const movePosition = new window.kakao.maps.LatLng(
                    Number(selectedStore.latitude),
                    Number(selectedStore.longitude)
                );

                map.setCenter(movePosition);
                map.setLevel(3);
            } else if (markers.length > 0) {
                map.setBounds(bounds);
            }





            // if (stores.length > 0) {
            //     map.setBounds(bounds);
            // }

            // 선택된 매장 있으면 이동
            if (selectedStore) {
                const movePosition = new window.kakao.maps.LatLng(
                    Number(selectedStore.latitude),
                    Number(selectedStore.longitude)
                );

                map.setCenter(movePosition);
                map.setLevel(3);
            } else if (markers.length > 0) {
                map.setBounds(bounds);
            }
        });
        // return () => {
        //     window.removeEventListener("resize", handleResize);
        // };
        //}, [stores]);
    }, [stores, selectedStore, setSelectedStoreId]);


    return (
        <div id='map' style={{ width: "100%", height: "100%", background: "#f5f5f5" }}>

        </div>
    );
}
