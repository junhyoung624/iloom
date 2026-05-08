import React, { useEffect } from 'react';
import { storeRegionUiPolygons } from '../../data/storeRegionUiPolygons';

const REGION_VIEW_OPTIONS = {
    A02012: { center: [36.63, 127.18], level: 9 },
};

//강원, 전라, 경상 -> 탭 변경시 첫 번째 매장 지역으로 이동
const FIRST_STORE_VIEW_REGIONS = ["A02011", "A02013", "A02014"];
const DEFAULT_KOREA_VIEW = { center: [36.25, 127.9], level: 12 };

const polygonStyle = (isActive = false) => ({
    strokeWeight: isActive ? 3 : 2,
    strokeColor: isActive ? "#111111" : "#555555",
    strokeOpacity: isActive ? 0.95 : 0.7,
    fillColor: isActive ? "#111111" : "#ffffff",
    fillOpacity: isActive ? 0.08 : 0.01,
});

export default function StoreKakaoMap({
    stores = [],
    selectedStore,
    selectedRegion = "default",
    setSelectedStoreId,
    onRegionSelect,
}) {
    useEffect(() => {
        let resizeObserver = null;
        let resizeTimer = null;
        let handleResize = null;
        let isMounted = true;
        const boundaryPolygons = [];

        if (!window.kakao) return;

        window.kakao.maps.load(() => {
            if (!isMounted) return;

            const container = document.getElementById("map");
            if (!container) return;

            const map = new window.kakao.maps.Map(container, {
                center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                level: 5,
            });

            const bounds = new window.kakao.maps.LatLngBounds();
            const clusterer = new window.kakao.maps.MarkerClusterer({
                map,
                averageCenter: true,
                minLevel: 8,
            });

            const markerImage = new window.kakao.maps.MarkerImage(
                './images/storeInfo/map-pin.svg',
                new window.kakao.maps.Size(30, 30),
                { offset: new window.kakao.maps.Point(27, 69) }
            );

            let openedInfoWindow = null;

            const markers = stores
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
                            <div style="padding:10px; min-width:240px; font-size:13px; line-height:1.5;">
                                <strong style="display:block; margin-bottom:4px;">${store.store_name}</strong>
                                <div style="margin-top:4px;">${store.phone}</div>
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
            const visibleRegionCodes = new Set(stores.map((store) => store.region_code));

            const fitBoundsWithMaxLevel = () => {
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

            const drawProvinceBoundaries = () => {
                if (selectedRegion !== "default") return;

                storeRegionUiPolygons
                    .filter((region) => visibleRegionCodes.has(region.code))
                    .forEach((region) => {
                        const polygon = new window.kakao.maps.Polygon({
                            map,
                            path: region.path.map(([lat, lng]) => new window.kakao.maps.LatLng(lat, lng)),
                            zIndex: 1,
                            ...polygonStyle(false),
                        });

                        window.kakao.maps.event.addListener(polygon, "mouseover", () => {
                            polygon.setOptions({
                                strokeWeight: 3,
                                strokeOpacity: 1,
                                strokeColor: "#111111",
                                fillColor: "#111111",
                                fillOpacity: 0.05,
                            });
                        });

                        window.kakao.maps.event.addListener(polygon, "mouseout", () => {
                            polygon.setOptions(polygonStyle(false));
                        });

                        window.kakao.maps.event.addListener(polygon, "click", () => {
                            onRegionSelect?.(region.code);
                        });

                        boundaryPolygons.push(polygon);
                    });
            };

            drawProvinceBoundaries();
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
            } else if (markers.length > 0) {
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
        });

        return () => {
            isMounted = false;
            window.clearTimeout(resizeTimer);
            boundaryPolygons.forEach((polygon) => polygon.setMap(null));

            if (handleResize) {
                window.removeEventListener("resize", handleResize);
            }

            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, [stores, selectedStore, selectedRegion, setSelectedStoreId, onRegionSelect]);

    return (
        <div id='map' style={{ width: "100%", height: "100%", background: "#f5f5f5" }}>

        </div>
    );
}
