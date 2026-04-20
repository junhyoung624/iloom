import React, { useEffect } from 'react';

export default function StoreKakaoMap({ stores = [], selectedStore, setSelectedStoreId }) {
    console.log("store kakao map in");

    useEffect(() => {

        if (!window.kakao) return;

        window.kakao.maps.load(() => {
            console.log("window kakao in");
            const container = document.getElementById("map");
            console.log("map container", container);

            if (!container) return;

            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                level: 8,
            };

            //맵 사이즈
            const map = new window.kakao.maps.Map(container, options);
            // if (!map) return;
            // console.log("map created", map);

            // const handleResize = () => {
            //     const center = map.getCenter();
            //     map.relayout();
            //     map.setCenter(center);
            // }

            // window.addEventListener("resize", handleResize);


            const bounds = new window.kakao.maps.LatLngBounds();

            //마커 클릭 이벤트 관리
            let openedInfoWindow = null;
            let openedMarkerId = null;

            stores.forEach((store) => {
                if (!store.latitude || !store.longitude) return;

                const position = new window.kakao.maps.LatLng(
                    Number(store.latitude),
                    Number(store.longitude)
                );

                const marker = new window.kakao.maps.Marker({
                    position,
                });

                marker.setMap(map);

                const content = `
                    <div style="padding:10px; min-width:240px; font-size:13px; line-height:1.5;">
                        <strong style="display:block; margin-bottom:4px;">${store.store_name}</strong>
                        <div style="margin-top:4px;">${store.phone}</div>
                    </div>
                `;
                const infowindow = new window.kakao.maps.InfoWindow({
                    content: content,
                    removable: true,
                });

                window.kakao.maps.event.addListener(marker, "click", () => {
                    //같은 마커 다시 클릭 -> 토글로 닫기
                    // if (openedMarkerId == store.id && openedInfoWindow) {
                    //     openedInfoWindow.close();
                    //     openedInfoWindow = null;
                    //     openedMarkerId = null;
                    //     setSelectedStoreId(null);
                    //     return;
                    // }
                    //다른 마커 클릭 -> 이전 거 닫기
                    if (openedInfoWindow) {
                        openedInfoWindow.close();
                    }
                    //새로 열기

                    infowindow.open(map, marker);
                    openedInfoWindow = infowindow;
                    //openedMarkerId = store.id;
                    setSelectedStoreId(store.id);
                });

                bounds.extend(position);
            });

            if (stores.length > 0) {
                map.setBounds(bounds);
            }

            // 선택된 매장 있으면 이동
            if (selectedStore) {
                const movePosition = new window.kakao.maps.LatLng(
                    Number(selectedStore.latitude),
                    Number(selectedStore.longitude)
                );

                map.setCenter(movePosition);
                map.setLevel(3);
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
