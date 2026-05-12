import React, { useEffect } from 'react';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_KEY;

const REGION_VIEW_OPTIONS = {
    A02012: { center: [36.63, 127.18], level: 9 },
};

//강원, 전라, 경상 -> 탭 변경시 첫 번째 매장 지역으로 이동
const FIRST_STORE_VIEW_REGIONS = ["A02011", "A02013", "A02014"];
const DEFAULT_KOREA_VIEW = { center: [36.25, 127.9], level: 12 };

const loadKakaoMapScript = () => {
    return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(resolve);
            return;
        }

        const existingScript = document.querySelector("#kakao-map-script");

        if (existingScript) {
            existingScript.addEventListener("load", () => {
                window.kakao.maps.load(resolve);
            });
            return;
        }

        const script = document.createElement("script");
        script.id = "kakao-map-script";
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services,clusterer`;
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(resolve);
        };

        script.onerror = reject;

        document.head.appendChild(script);
    });
};

export default function StoreKakaoMap({
    stores = [],
    selectedStore,
    selectedRegion = "default",
    setSelectedStoreId,
}) {
    useEffect(() => {
        let resizeObserver = null;
        let resizeTimer = null;
        let handleResize = null;
        let isMounted = true;
        let clusterer = null;
        let markers = [];

        loadKakaoMapScript().then(() => {
            if (!isMounted) return;

            const container = document.getElementById("map");
            if (!container) return;
            container.innerHTML = "";

            const map = new window.kakao.maps.Map(container, {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                level: 5,
            });

            const bounds = new window.kakao.maps.LatLngBounds();
            clusterer = new window.kakao.maps.MarkerClusterer({
                map,
                averageCenter: true,
                minLevel: 8,
            });

            const markerImage = new window.kakao.maps.MarkerImage(
                "./images/storeInfo/map-pin.svg",
                new window.kakao.maps.Size(30, 30),
                { offset: new window.kakao.maps.Point(15, 30) }
            );

            let openedInfoWindow = null;

            markers = stores
                .filter((store) => store.latitude && store.longitude)
                .map((store) => {
                    const position = new window.kakao.maps.LatLng(
                        Number(store.latitude),
                        Number(store.longitude)
                    );

                    const marker = new window.kakao.maps.Marker({
                        position,
                        image: markerImage,
                        zIndex: 10,
                    });

                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: `
                            <div style="
                                box-sizing:border-box;
                                width:260px;
                                min-height:92px;
                                padding:12px 14px 13px;
                                color:#222;
                                font-size:13px;
                                line-height:1.45;
                                word-break:keep-all;
                                overflow-wrap:anywhere;
                            ">
                                <strong style="
                                    display:block;
                                    margin-bottom:6px;
                                    color:#111;
                                    font-size:14px;
                                    line-height:1.3;
                                    font-weight:700;
                                ">${store.store_name}</strong>
                                <div style="
                                    color:#555;
                                    line-height:1.45;
                                ">${store.address || ""}</div>
                                <div style="
                                    margin-top:7px;
                                    color:#111;
                                    line-height:1.35;
                                    white-space:normal;
                                ">${store.phone || ""}</div>
                            </div>
                        `,
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
                });

            const fitBoundsWithMaxLevel = () => {
                if (markers.length === 0) {
                    map.setCenter(new window.kakao.maps.LatLng(...DEFAULT_KOREA_VIEW.center));
                    map.setLevel(DEFAULT_KOREA_VIEW.level);
                    return;
                }

                map.setBounds(bounds);

                if (selectedRegion !== "default" && map.getLevel() > 8) {
                    map.setLevel(8);
                }
            };

            const moveToRegionView = () => {
                const regionView = REGION_VIEW_OPTIONS[selectedRegion];

                if (FIRST_STORE_VIEW_REGIONS.includes(selectedRegion)) {
                    const firstStore = stores.find((store) => store.latitude && store.longitude);

                    if (firstStore) {
                        map.setCenter(new window.kakao.maps.LatLng(
                            Number(firstStore.latitude),
                            Number(firstStore.longitude)
                        ));
                        map.setLevel(5);
                        return;
                    }
                }

                if (!regionView) {
                    fitBoundsWithMaxLevel();
                    return;
                }

                map.setCenter(new window.kakao.maps.LatLng(...regionView.center));
                map.setLevel(regionView.level);
            };

            clusterer.addMarkers(markers);

            if (selectedStore) {
                const movePosition = new window.kakao.maps.LatLng(
                    Number(selectedStore.latitude),
                    Number(selectedStore.longitude)
                );

                map.setCenter(movePosition);
                map.setLevel(3);
            } else if (selectedRegion === "default") {
                map.setCenter(new window.kakao.maps.LatLng(...DEFAULT_KOREA_VIEW.center));
                map.setLevel(DEFAULT_KOREA_VIEW.level);
            } else {
                moveToRegionView();
            }

            handleResize = () => {
                window.clearTimeout(resizeTimer);
                resizeTimer = window.setTimeout(() => {
                    if (!isMounted) return;

                    const center = selectedStore
                        ? new window.kakao.maps.LatLng(
                            Number(selectedStore.latitude),
                            Number(selectedStore.longitude)
                        )
                        : map.getCenter();

                    map.relayout();
                    map.setCenter(center);
                }, 80);
            };

            window.addEventListener("resize", handleResize);

            if (window.ResizeObserver) {
                resizeObserver = new window.ResizeObserver(handleResize);
                resizeObserver.observe(container);
            }
        }).catch((error) => {
            console.error("Failed to load Kakao map script", error);
        });

        return () => {
            isMounted = false;
            window.clearTimeout(resizeTimer);
            if (clusterer) {
                clusterer.clear();
            }
            markers.forEach((marker) => marker.setMap(null));

            if (handleResize) {
                window.removeEventListener("resize", handleResize);
            }

            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, [stores, selectedStore, selectedRegion, setSelectedStoreId]);

    return (
        <div id='map' style={{ width: "100%", height: "100%", background: "#f5f5f5" }}>

        </div>
    );
}
