const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => res.send("server ok"));

// ─── 상품 데이터 로드 ───────────────────────────────────────────────────────
function loadProductData() {
    const candidates = [
        path.join(__dirname, "productData.js"),
        path.join(__dirname, "src", "data", "productData.js"),
        path.join(__dirname, "..", "src", "data", "productData.js"),
    ];
    for (const filePath of candidates) {
        if (fs.existsSync(filePath)) {
            console.log("📦 productData 로드:", filePath);
            let content = fs.readFileSync(filePath, "utf8");
            content = content
                .replace(/export\s+const\s+productData\s*=\s*/, "")
                .replace(/,(\s*[\]\}])/g, "$1")
                .replace(/;\s*$/, "")
                .trim();
            return JSON.parse(content);
        }
    }
    throw new Error("productData.js를 찾을 수 없습니다.");
}

const productData = loadProductData();
console.log(`✅ 상품 ${productData.length}개 로드 완료`);

// ─── 카테고리 키워드 맵 ─────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
    // 대분류
    거실: { originalCategory: "거실" },
    침실: { originalCategory: "침실" },
    학생방: { originalCategory: "학생방" },
    학생: { originalCategory: "학생방" },
    키즈: { originalCategory: "키즈룸" },
    키즈룸: { originalCategory: "키즈룸" },
    아이방: { originalCategory: "키즈룸" },
    어린이방: { originalCategory: "키즈룸" },
    서재: { originalCategory: "서재" },
    주방: { originalCategory: "주방" },
    옷장: { originalCategory: "옷장" },
    드레스룸: { originalCategory: "옷장", category2: "드레스룸" },
    매트리스: { originalCategory: "매트리스" },
    조명: { originalCategory: "조명" },

    // 소파 세부
    소파: { originalCategory: "거실", category2: "소파" },
    패브릭소파: { originalCategory: "거실", category2: "소파", category3: "패브릭소파" },
    가죽소파: { originalCategory: "거실", category2: "소파", category3: "가죽소파" },
    코너소파: { originalCategory: "거실", category2: "소파", category3: "코너소파•카우치" },
    카우치: { originalCategory: "거실", category2: "소파", category3: "코너소파•카우치" },
    리클라이너: { originalCategory: "거실", category2: "소파", category3: "리클라이너소파" },
    "1인소파": { originalCategory: "거실", category2: "소파", category3: "1인소파" },
    소파테이블: { originalCategory: "거실", category2: "소파", category3: "소파테이블" },

    // 침대 세부
    침대: [
        "침실 > 침대 > 일반침대",
        "침실 > 침대 > 수납침대",
        "침실 > 침대 > 모션베드",
        "학생방 > 침대",
        "키즈룸 > 침대",
    ],
    일반침대: { originalCategory: "침실", category2: "침대", category3: "일반침대" },
    수납침대: [
        "침실 > 침대 > 수납침대",
        "학생방 > 침대 > 수납침대",
    ],
    모션베드: { originalCategory: "침실", category2: "침대", category3: "모션베드" },
    패밀리침대: { originalCategory: "침실", category2: "침대", category3: "패밀리침대" },

    // 책상 세부
    책상: ["학생방 > 책상", "서재 > 책상", "키즈룸 > 책상"],
    모션책상: { originalCategory: "학생방", category2: "책상", category3: "모션데스크" },
    모션데스크: { originalCategory: "학생방", category2: "책상", category3: "모션데스크" },
    높이조절책상: { originalCategory: "학생방", category2: "책상", category3: "모션데스크" },

    // 식탁 세부
    식탁: { originalCategory: "주방", category2: "식탁" },
    "2인식탁": { originalCategory: "주방", category2: "식탁", category3: "2인용식탁" },
    "4인식탁": { originalCategory: "주방", category2: "식탁", category3: "4인용식탁" },
    "6인식탁": { originalCategory: "주방", category2: "식탁", category3: "6인용식탁" },
    식탁의자: { originalCategory: "주방", category2: "식탁의자" },
    다이닝: { originalCategory: "주방" },

    // 수납
    수납장: ["거실 > 수납장", "침실 > 수납장", "학생방 > 수납장", "키즈룸 > 수납장"],
    서랍장: ["침실 > 수납장 > 서랍장", "서재 > 서랍장"],
    책장: ["학생방 > 책장", "서재 > 책장"],
    거실장: { originalCategory: "거실", category2: "거실장" },
    장식장: { originalCategory: "거실", category2: "수납장", category3: "장식장" },
    화장대: { originalCategory: "침실", category2: "화장대" },
};

// ─── 재질 키워드 맵 ─────────────────────────────────────────────────────────
const MATERIAL_KEYWORDS = {
    패브릭: "패브릭",
    가죽: "가죽",
    인조가죽: "인조가죽",
    원목: "원목",
    세라믹: "세라믹",
    유리: "유리",
    부클: "부클",
    스틸: "스틸",
};

// ─── 가격 패턴 ──────────────────────────────────────────────────────────────
const PRICE_PATTERNS = [
    { regex: /(\d+)\s*만원?\s*(이하|미만|까지)/, type: "max" },
    { regex: /(\d+)\s*만원?\s*(이상|넘|초과|부터)/, type: "min" },
    { regex: /(\d+)\s*[-~]\s*(\d+)\s*만원?/, type: "range" },
    { regex: /저렴|싼|가성비/, type: "cheap" },
    { regex: /고급|프리미엄|최고급/, type: "premium" },
];

// ─── 쿼리 분석 ──────────────────────────────────────────────────────────────
function parseQuery(message) {
    const intent = {
        categories: [],
        materials: [],
        priceMin: null,
        priceMax: null,
        isBestSeller: false,
        isNew: false,
        isMdPick: false,
        series: null,
        persons: null,
    };

    const msg = message.toLowerCase();

    // 카테고리
    for (const [keyword, filter] of Object.entries(CATEGORY_KEYWORDS)) {
        if (msg.includes(keyword)) {
            intent.categories.push({ keyword, filter });
        }
    }

    // 재질
    for (const [keyword, value] of Object.entries(MATERIAL_KEYWORDS)) {
        if (msg.includes(keyword)) {
            intent.materials.push(value);
        }
    }

    // 가격
    for (const pattern of PRICE_PATTERNS) {
        const match = message.match(pattern.regex);
        if (match) {
            if (pattern.type === "max") intent.priceMax = parseInt(match[1]) * 10000;
            else if (pattern.type === "min") intent.priceMin = parseInt(match[1]) * 10000;
            else if (pattern.type === "range") {
                intent.priceMin = parseInt(match[1]) * 10000;
                intent.priceMax = parseInt(match[2]) * 10000;
            } else if (pattern.type === "cheap") intent.priceMax = 500000;
            else if (pattern.type === "premium") intent.priceMin = 1000000;
        }
    }

    // 특수 필터
    if (/베스트|인기|잘 팔리|많이 팔/.test(msg)) intent.isBestSeller = true;
    if (/신상|새로 나온|최신/.test(msg)) intent.isNew = true;
    if (/md.?추천|에디터|픽/.test(msg)) intent.isMdPick = true;

    // 인원수 — name 필드 검색용 ("2인", "3.5인" 등)
    const personMatch = message.match(/(\d+(?:\.\d+)?)\s*인/);
    if (personMatch) {
        intent.persons = personMatch[1] + "인";
    }

    // 시리즈명
    const allSeries = [...new Set(productData.map((p) => p.series).filter(Boolean))];
    for (const s of allSeries) {
        const seriesShort = s.split(" ")[0];
        if (seriesShort.length >= 2 && msg.includes(seriesShort.toLowerCase())) {
            intent.series = s;
            break;
        }
    }

    return intent;
}

// ─── 상품 검색 ──────────────────────────────────────────────────────────────
function searchProducts(intent, limit = 5) {
    let results = [...productData];

    // 시리즈 필터
    if (intent.series) {
        const filtered = results.filter((p) =>
            p.series?.includes(intent.series.split(" ")[0])
        );
        if (filtered.length > 0) results = filtered;
    }

    // 카테고리 필터 (category3까지 체크)
    if (intent.categories.length > 0) {
        const filtered = results.filter((p) =>
            intent.categories.some(({ filter }) => {
                if (Array.isArray(filter)) {
                    return filter.some((f) => {
                        const [cat, cat2, cat3] = f.split(" > ");
                        return (
                            p.originalCategory === cat &&
                            (!cat2 || p.category2 === cat2) &&
                            (!cat3 || p.category3 === cat3)
                        );
                    });
                }
                return (
                    (!filter.originalCategory || p.originalCategory === filter.originalCategory) &&
                    (!filter.category2 || p.category2 === filter.category2) &&
                    (!filter.category3 || p.category3 === filter.category3)
                );
            })
        );
        if (filtered.length > 0) results = filtered;
    }

    // 재질 필터 — material + name 둘 다 체크
    if (intent.materials.length > 0) {
        const filtered = results.filter((p) =>
            intent.materials.some(
                (m) => p.material?.includes(m) || p.name?.includes(m)
            )
        );
        if (filtered.length > 0) results = filtered;
    }

    // 인원수 필터 — name 필드에서 검색
    if (intent.persons) {
        const filtered = results.filter((p) => p.name?.includes(intent.persons));
        if (filtered.length > 0) results = filtered;
    }

    // 가격 필터
    if (intent.priceMin !== null || intent.priceMax !== null) {
        const filtered = results.filter((p) => {
            const price = parseInt((p.price || "0").replace(/,/g, ""));
            if (intent.priceMin && price < intent.priceMin) return false;
            if (intent.priceMax && price > intent.priceMax) return false;
            return true;
        });
        if (filtered.length > 0) results = filtered;
    }

    // 특수 필터
    if (intent.isBestSeller) {
        const filtered = results.filter((p) => p.BestSeller);
        if (filtered.length > 0) results = filtered;
    }
    if (intent.isNew) {
        const filtered = results.filter((p) => p.new);
        if (filtered.length > 0) results = filtered;
    }
    if (intent.isMdPick) {
        const filtered = results.filter((p) => p.mdPick);
        if (filtered.length > 0) results = filtered;
    }

    // ranking + BestSeller 기준 정렬
    results.sort((a, b) => {
        if (a.BestSeller && !b.BestSeller) return -1;
        if (!a.BestSeller && b.BestSeller) return 1;
        return (a.ranking ?? 9999) - (b.ranking ?? 9999);
    });

    return results.slice(0, limit);
}

// ─── GPT용 상품 포맷 ────────────────────────────────────────────────────────
function formatProductsForGPT(products) {
    if (products.length === 0) return "관련 상품을 찾지 못했습니다.";

    return products.map((p, i) => {
        const colors = p.options?.find((o) => o.name === "색상")?.values?.join(", ") || "정보 없음";
        const tags = [
            p.BestSeller ? "베스트셀러" : null,
            p.new ? "신상품" : null,
            p.mdPick ? "MD추천" : null,
        ].filter(Boolean).join(", ");

        return `[상품 ${i + 1}]
- 상품명: ${p.name}
- 시리즈: ${p.series || ""}
- 카테고리: ${p.originalCategory} > ${p.category2}${p.category3 ? " > " + p.category3 : ""}
- 가격: ${p.price}원
- 재질: ${p.material || "정보 없음"}
- 색상 옵션: ${colors}
- 태그: ${tags || "없음"}`;
    }).join("\n\n");
}

// ─── OpenAI 클라이언트 ───────────────────────────────────────────────────────
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `당신은 일룸(iloom) 공식 가구 쇼핑몰의 친절한 상담 챗봇입니다.
아래 규칙을 반드시 따르세요:

1. 제공된 [일룸 상품 데이터]에 있는 상품만 추천하세요. 데이터에 없는 상품을 임의로 만들지 마세요.
2. 상품 상세 정보(가격, 재질 등)는 아래 카드에서 확인 가능하므로 텍스트에서 반복하지 마세요.
3. 답변은 2~3문장으로 짧고 친근하게 작성하세요.
4. 여러 상품 추천 시 각 상품의 핵심 특징을 마크다운 리스트로 한 줄씩만 정리하세요. 예시:
   - **상품명**: 핵심 특징 한 줄
5. 데이터에 해당 상품이 없을 경우 "현재 해당 조건의 상품을 찾기 어렵습니다"라고 답하세요.
6. 답변 마지막엔 "더 궁금한 점이 있으시면 말씀해주세요 😊"로 마무리하세요.
7. 이전 대화 맥락을 참고해서 "다른 걸 추천해줘", "더 저렴한 걸로" 같은 요청에도 자연스럽게 대응하세요.`;

// ─── API 엔드포인트 ──────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
    try {
        // history: [{ role: "user"|"bot", text }] 형태로 프론트에서 전달
        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: "메시지가 비어 있습니다." });
        }

        // 1. 쿼리 분석
        const intent = parseQuery(message);
        console.log("🔍 인텐트:", JSON.stringify(intent));

        // 2. 상품 검색
        const relatedProducts = searchProducts(intent, 5);
        console.log(`📋 검색된 상품 ${relatedProducts.length}개:`, relatedProducts.map(p => p.name));

        // 3. 대화 히스토리 구성 (최근 6턴)
        const recentHistory = history.slice(-6);
        const gptMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...recentHistory.map((h) => ({
                role: h.role === "user" ? "user" : "assistant",
                content: h.text,
            })),
            {
                role: "user",
                content: `[일룸 상품 데이터]\n${formatProductsForGPT(relatedProducts)}\n\n---\n고객 질문: ${message}`,
            },
        ];

        // 4. GPT 호출
        const response = await client.chat.completions.create({
            model: "gpt-5.4",
            messages: gptMessages,
            temperature: 0.7,
            max_completion_tokens: 800,
        });

        const answer = response.choices[0]?.message?.content || "답변을 생성할 수 없습니다.";

        const products = relatedProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.productImages?.[0] || null,
            category: `${p.originalCategory} > ${p.category2}`,
            series: p.series || "",
            tags: [
                p.BestSeller ? "베스트셀러" : null,
                p.new ? "신상품" : null,
                p.mdPick ? "MD추천" : null,
            ].filter(Boolean),
        }));

        res.json({ answer, products });
    } catch (error) {
        console.error("=== 서버 에러 ===");
        console.error(error);
        res.status(500).json({ error: error?.message || "서버 오류" });
    }
});

app.listen(4000, "127.0.0.1", () => {
    console.log("🛋️  일룸 챗봇 서버 실행중 http://localhost:4000");
});