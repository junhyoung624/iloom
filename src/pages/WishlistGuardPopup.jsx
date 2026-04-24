import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function WishlistGuardPopup({ onClose }) {
    const navigate = useNavigate();

    // ESC 키로 닫기
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <>

            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    zIndex: 9998,
                    backdropFilter: "blur(2px)",
                    animation: "fadeIn 0.2s ease",
                }}
            />


            <div style={{
                position: "fixed",
                top: "-100%", left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#fff",
                padding: "40px 36px 32px",
                zIndex: 9999,
                width: 320,
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}>

                <div style={{
                    width: 56, height: 56,
                    borderRadius: "50%",
                    background: "#fff0f3",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#ff4d6d"
                        stroke="#ff4d6d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "#111" }}>
                    로그인이 필요해요
                </h3>
                <p style={{ fontSize: 13.5, color: "#888", lineHeight: 1.6, margin: "0 0 28px" }}>
                    위시리스트는 로그인 후<br />이용할 수 있어요.
                </p>

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: "11px 0",
                            border: "1.5px solid #e5e5e5",
                            background: "#fff", fontSize: 14, color: "#555",
                            cursor: "pointer", fontWeight: 500,
                        }}
                    >
                        닫기
                    </button>
                    <button
                        onClick={() => { onClose(); navigate("/login"); }}
                        style={{
                            flex: 1, padding: "11px 0",
                            border: "none",
                            background: "#111", fontSize: 14, color: "#fff",
                            cursor: "pointer", fontWeight: 600,
                        }}
                    >
                        로그인하기
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes popIn {
                    from { opacity: 0; transform: translate(-50%, -48%) scale(0.9) }
                    to   { opacity: 1; transform: translate(-50%, -50%) scale(1) }
                }
            `}</style>
        </>
    );
}