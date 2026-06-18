const OpenAI = require("openai");
const productData = require("./productData.json");

const CATEGORY_KEYWORDS = {
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
    소파: { originalCategory: "거실", category2: "소파" },
    패브릭소파: { originalCategory: "거실", category2: "소파", category3: "패브릭소파" },
    가죽소파: { originalCategory: "거실", category2: "소파", category3: "가죽소파" },
    코너소파: { originalCategory: "거실", category2: "소파", category3: "코너소파•카우치" },
    카우치: { originalCategory: "거실", category2: "소파", category3: "코너소파•카우치" },
    리클라이너: { originalCategory: "거실", category2: "소파", category3: "리클라이너소파" },
    "1인소파": { originalCategory: "거실", category2: "소파", category3: "1인소파" },
    소파테이블: { originalCategory: "거실", category2: "소파", category3: "소파테이블" },
    침대: ["침실 > 침대 > 일반침대", "침실 > 침대 > 수납침대", "침실 > 침대 > 모션베드", "학생방 > 침대", "키즈룸 > 침대"],
    일반침대: { originalCategory: "침실", category2: "침대", category3: "일반침대" },
    수납침대: ["침실 > 침대 > 수납침대", "학생방 > 침대 > 수납침대"],
    모션베드: { originalCategory: "침실", category2: "침대", category3: "모션베드" },
    패밀리침대: { originalCategory: "침실", category2: "침대", category3: "패밀리침대" },
    책상: ["학생방 > 책상", "서재 > 책상", "키즈룸 > 책상"],
    모션책상: { originalCategory: "학생방", category2: "책상", category3: "모션데스크" },
    모션데스크: { originalCategory: "학생방", category2: "책상", category3: "모션데스크" },
    높이조절책상: { originalCategory: "학생방", category2: "책상", category3: "모션데스크" },
    식탁: { originalCategory: "주방", category2: "식탁" },
    "2인식탁": { originalCategory: "주방", category2: "식탁", category3: "2인용식탁" },
    "4인식탁": { originalCategory: "주방", category2: "식탁", category3: "4인용식탁" },
    "6인식탁": { originalCategory: "주방", category2: "식탁", category3: "6인용식탁" },
    식탁의자: { originalCategory: "주방", category2: "식탁의자" },
    다이닝: { originalCategory: "주방" },
    수납장: ["거실 > 수납장", "침실 > 수납장", "학생방 > 수납장", "키즈룸 > 수납장"],
    서랍장: ["침실 > 수납장 > 서랍장", "서재 > 서랍장"],
    책장: ["학생방 > 책장", "서재 > 책장"],
    거실장: { originalCategory: "거실", category2: "거실장" },
    장식장: { originalCategory: "거실", category2: "수납장", category3: "장식장" },
    화장대: { originalCategory: "침실", category2: "화장대" },
};

const MATERIAL_KEYWORDS = {
    패브릭: "패브릭", 가죽: "가죽", 인조가죽: "인조가죽", 원목: "원목",
    세라믹: "세라믹", 유리: "유리", 부클: "부클", 스틸: "스틸",
};

const PRICE_PATTERNS = [
    { regex: /(\d+)\s*만원?\s*(이하|미만|까지)/, type: "max" },
    { regex: /(\d+)\s*만원?\s*(이상|넘|초과|부터)/, type: "min" },
    { regex: /(\d+)\s*[-~]\s*(\d+)\s*만원?/, type: "range" },
    { regex: /저렴|싼|가성비/, type: "cheap" },
    { regex: /고급|프리미엄|최고급/, type: "premium" },
];

function parseQuery(message) {
    const intent = {
        categories: [], materials: [], priceMin: null, priceMax: null,
        isBestSeller: false, isNew: false, isMdPick: false, series: null, persons: null,
    };
    const msg = message.toLowerCase();

    for (const [keyword, filter] of Object.entries(CATEGORY_KEYWORDS)) {
        if (msg.includes(keyword)) intent.categories.push({ keyword, filter });
    }
    for (const [keyword, value] of Object.entries(MATERIAL_KEYWORDS)) {
        if (msg.includes(keyword)) intent.materials.push(value);
    }
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
    if (/베스트|인기|잘 팔리|많이 팔/.test(msg)) intent.isBestSeller = true;
    if (/신상|새로 나온|최신/.test(msg)) intent.isNew = true;
    if (/md.?추천|에디터|픽/.test(msg)) intent.isMdPick = true;

    const personMatch = message.match(/(\d+(?:\.\d+)?)\s*인/);
    if (personMatch) intent.persons = personMatch[1] + "인";

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

function searchProducts(intent, limit = 5) {
    let results = [...productData];

    if (intent.series) {
        const filtered = results.filter((p) => p.series?.includes(intent.series.split(" ")[0]));
        if (filtered.length > 0) results = filtered;
    }
    if (intent.categories.length > 0) {
        const filtered = results.filter((p) =>
            intent.categories.some(({ filter }) => {
                if (Array.isArray(filter)) {
                    return filter.some((f) => {
                        const [cat, cat2, cat3] = f.split(" > ");
                        return p.originalCategory === cat && (!cat2 || p.category2 === cat2) && (!cat3 || p.category3 === cat3);
                    });
                }
                return (!filter.originalCategory || p.originalCategory === filter.originalCategory) &&
                    (!filter.category2 || p.category2 === filter.category2) &&
                    (!filter.category3 || p.category3 === filter.category3);
            })
        );
        if (filtered.length > 0) results = filtered;
    }
    if (intent.materials.length > 0) {
        const filtered = results.filter((p) =>
            intent.materials.some((m) => p.material?.includes(m) || p.name?.includes(m))
        );
        if (filtered.length > 0) results = filtered;
    }
    if (intent.persons) {
        const filtered = results.filter((p) => p.name?.includes(intent.persons));
        if (filtered.length > 0) results = filtered;
    }
    if (intent.priceMin !== null || intent.priceMax !== null) {
        const filtered = results.filter((p) => {
            const price = parseInt((p.price || "0").replace(/,/g, ""));
            if (intent.priceMin && price < intent.priceMin) return false;
            if (intent.priceMax && price > intent.priceMax) return false;
            return true;
        });
        if (filtered.length > 0) results = filtered;
    }
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

    results.sort((a, b) => {
        if (a.BestSeller && !b.BestSeller) return -1;
        if (!a.BestSeller && b.BestSeller) return 1;
        return (a.ranking ?? 9999) - (b.ranking ?? 9999);
    });

    return results.slice(0, limit);
}

function formatProductsForGPT(products) {
    if (products.length === 0) return "관련 상품을 찾지 못했습니다.";
    return products.map((p, i) => {
        const colors = p.options?.find((o) => o.name === "색상")?.values?.join(", ") || "정보 없음";
        const tags = [p.BestSeller ? "베스트셀러" : null, p.new ? "신상품" : null, p.mdPick ? "MD추천" : null].filter(Boolean).join(", ");
        return `[상품 ${i + 1}]\n- 상품명: ${p.name}\n- 시리즈: ${p.series || ""}\n- 카테고리: ${p.originalCategory} > ${p.category2}${p.category3 ? " > " + p.category3 : ""}\n- 가격: ${p.price}원\n- 재질: ${p.material || "정보 없음"}\n- 색상 옵션: ${colors}\n- 태그: ${tags || "없음"}`;
    }).join("\n\n");
}

const SYSTEM_PROMPT = `당신은 일룸(iloom) 공식 가구 쇼핑몰의 친절한 상담 챗봇입니다.
아래 규칙을 반드시 따르세요:
1. 제공된 [일룸 상품 데이터]에 있는 상품만 추천하세요. 데이터에 없는 상품을 임의로 만들지 마세요.
2. 상품 상세 정보(가격, 재질 등)는 아래 카드에서 확인 가능하므로 텍스트에서 반복하지 마세요.
3. 답변은 2~3문장으로 짧고 친근하게 작성하세요.
4. 여러 상품 추천 시 각 상품의 핵심 특징을 마크다운 리스트로 한 줄씩만 정리하세요.
5. 데이터에 해당 상품이 없을 경우 "현재 해당 조건의 상품을 찾기 어렵습니다"라고 답하세요.
6. 답변 마지막엔 "더 궁금한 점이 있으시면 말씀해주세요 😊"로 마무리하세요.
7. 이전 대화 맥락을 참고해서 자연스럽게 대응하세요.`;

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    try {
        const { message, history = [] } = JSON.parse(event.body);

        if (!message?.trim()) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: "메시지가 비어 있습니다." }) };
        }

        const intent = parseQuery(message);
        const relatedProducts = searchProducts(intent, 5);

        const recentHistory = history.slice(-6);
        const gptMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...recentHistory.map((h) => ({ role: h.role === "user" ? "user" : "assistant", content: h.text })),
            { role: "user", content: `[일룸 상품 데이터]\n${formatProductsForGPT(relatedProducts)}\n\n---\n고객 질문: ${message}` },
        ];

        // ─── Groq 클라이언트 (OpenAI SDK 호환) ───────────────────────────
        const client = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1",
        });

        const response = await client.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages: gptMessages,
            temperature: 0.7,
            max_tokens: 800, // Groq는 max_completion_tokens 대신 max_tokens 사용
        });

        const answer = response.choices[0]?.message?.content || "답변을 생성할 수 없습니다.";
        const products = relatedProducts.map((p) => ({
            id: p.id, name: p.name, price: p.price,
            image: p.productImages?.[0] || null,
            category: `${p.originalCategory} > ${p.category2}`,
            series: p.series || "",
            tags: [p.BestSeller ? "베스트셀러" : null, p.new ? "신상품" : null, p.mdPick ? "MD추천" : null].filter(Boolean),
        }));

        return { statusCode: 200, headers, body: JSON.stringify({ answer, products }) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error?.message || "서버 오류" }) };
    }
};