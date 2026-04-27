import { useEffect, useState } from "react";

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    const [bannerHeight, setBannerHeight] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(percent);
        };

        // --banner-height CSS 변수 감지
        const updateBannerHeight = () => {
            const val = getComputedStyle(document.documentElement)
                .getPropertyValue("--banner-height")
                .trim();
            setBannerHeight(parseInt(val) || 0);
        };

        // MutationObserver로 CSS 변수 변경 감지
        const observer = new MutationObserver(updateBannerHeight);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["style"],
        });

        window.addEventListener("scroll", handleScroll, { passive: true });
        updateBannerHeight();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <div style={{
            position: "fixed",
            top: 61 + bannerHeight,   // ✅ 배너 높이 반영
            left: 0,
            width: "100%",
            height: "3px",
            zIndex: 9999,
            background: "transparent",
            transition: "top 0.3s ease",  // ✅ 부드럽게
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