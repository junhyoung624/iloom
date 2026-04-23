import { useEffect, useState } from "react";

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(percent);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div style={{
            position: "fixed",
            top: 61,
            left: 0,
            width: "100%",
            height: "3px",
            zIndex: 9999,
            background: "transparent",
        }}>
            <div style={{
                height: "50%",
                width: `${progress}%`,
                background: "#b3b3b3",
                transition: "width 0.1s linear",
            }} />
        </div>
    );
}