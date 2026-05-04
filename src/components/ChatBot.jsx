import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ChatBotTest() {

    const [message, setMessage] = useState("");
    const [answer, setAnswer] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim()) return;

        setLoading(true);
        setAnswer("");
        setProducts([]);

        try {
            const res = await fetch("http://localhost:4000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const data = await res.json();
            setAnswer(data.answer);
            setProducts(data.products || []);
        } catch (error) {
            setAnswer("에러가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
            <h2>일룸 상품 챗봇</h2>

            {/* 입력창 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="예: 패브릭 소파 추천해줘, 100만원 이하 침대"
                    style={{ flex: 1, padding: "8px 12px", fontSize: 14, borderRadius: 6, border: "1px solid #ddd" }}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    style={{ padding: "8px 16px", borderRadius: 6, background: "#222", color: "#fff", border: "none", cursor: "pointer" }}
                >
                    {loading ? "검색중..." : "전송"}
                </button>
            </div>

            {/* GPT 답변 */}
            {answer && (
                <div style={{ background: "#f8f8f8", borderRadius: 8, padding: 16, marginBottom: 16, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {answer}
                </div>
            )}

            {/* 추천 상품 카드 */}
            {products.length > 0 && (
                <div>
                    <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>추천 상품 바로가기</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {products.map((p) => (
                            <Link
                                key={p.id}
                                to={`/product/${p.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    border: "1px solid #eee", borderRadius: 8, padding: 12,
                                    transition: "box-shadow 0.2s",
                                }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                                >
                                    {/* 썸네일 */}
                                    {p.image && (
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                                            onError={e => e.target.style.display = "none"}
                                        />
                                    )}
                                    {/* 상품 정보 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, color: "#999", marginBottom: 2 }}>{p.series}</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {p.name}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ fontSize: 14, fontWeight: 700 }}>{p.price}원</span>
                                            {p.tags.map(tag => (
                                                <span key={tag} style={{ fontSize: 11, background: "#222", color: "#fff", borderRadius: 4, padding: "2px 6px" }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {/* 화살표 */}
                                    <span style={{ color: "#bbb", fontSize: 18 }}>›</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}