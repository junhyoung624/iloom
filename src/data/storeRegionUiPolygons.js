const makeOvalPath = (centerLat, centerLng, radiusLat, radiusLng, points = 36) => (
    Array.from({ length: points }, (_, index) => {
        const angle = (Math.PI * 2 * index) / points;
        return [
            centerLat + Math.sin(angle) * radiusLat,
            centerLng + Math.cos(angle) * radiusLng,
        ];
    })
);

const makeTiltedOvalPath = (centerLat, centerLng, radiusLat, radiusLng, tilt = 0, points = 36) => {
    const sin = Math.sin(tilt);
    const cos = Math.cos(tilt);

    return Array.from({ length: points }, (_, index) => {
        const angle = (Math.PI * 2 * index) / points;
        const latOffset = Math.sin(angle) * radiusLat;
        const lngOffset = Math.cos(angle) * radiusLng;

        return [
            centerLat + latOffset * cos - lngOffset * sin,
            centerLng + latOffset * sin + lngOffset * cos,
        ];
    });
};

export const storeRegionUiPolygons = [
    {
        code: "A02001",
        name: "서울",
        path: makeOvalPath(37.56, 126.98, 0.18, 0.24, 32),
    },
    {
        code: "A02010",
        name: "경기",
        path: makeTiltedOvalPath(37.42, 127.15, 0.62, 0.72, -0.15, 42),
    },
    {
        code: "A02002",
        name: "인천",
        path: makeOvalPath(37.46, 126.64, 0.26, 0.22, 30),
    },
    {
        code: "A02011",
        name: "강원",
        path: makeTiltedOvalPath(37.62, 128.05, 0.56, 0.84, 0.12, 42),
    },
    {
        code: "A02012",
        name: "충청",
        path: makeTiltedOvalPath(36.55, 127.18, 0.52, 0.64, -0.12, 40),
    },
    {
        code: "A02013",
        name: "전라",
        path: makeTiltedOvalPath(35.33, 127.03, 0.76, 0.52, 0.05, 42),
    },
    {
        code: "A02014",
        name: "경상",
        path: makeTiltedOvalPath(35.72, 128.55, 0.82, 0.62, -0.08, 44),
    },
    {
        code: "A02008",
        name: "부산",
        path: makeOvalPath(35.18, 129.08, 0.21, 0.26, 30),
    },
    {
        code: "A02006",
        name: "대구",
        path: makeOvalPath(35.87, 128.6, 0.22, 0.27, 30),
    },
    {
        code: "A02003",
        name: "대전",
        path: makeOvalPath(36.35, 127.38, 0.18, 0.23, 30),
    },
    {
        code: "A02005",
        name: "광주",
        path: makeOvalPath(35.16, 126.85, 0.17, 0.22, 30),
    },
    {
        code: "A02007",
        name: "울산",
        path: makeOvalPath(35.54, 129.31, 0.19, 0.24, 30),
    },
    {
        code: "A02004",
        name: "세종",
        path: makeOvalPath(36.48, 127.29, 0.13, 0.16, 28),
    },
    {
        code: "A02009",
        name: "제주",
        path: makeTiltedOvalPath(33.39, 126.55, 0.23, 0.47, -0.05, 36),
    },
];
