import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Lens({
    children,
    zoomFactor = 2,
    lensSize = 200,
    isStatic = false,
    position,
}) {
    const containerRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const lensPos = isStatic && position ? position : mousePos;

    const handleMouseMove = (e) => {
        if (isStatic) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={containerRef}
            style={{ position: "relative", cursor: "none" }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {children}

            <AnimatePresence>
                {(isHovering || isStatic) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "absolute",
                            top: lensPos.y - lensSize / 2,
                            left: lensPos.x - lensSize / 2,
                            width: lensSize,
                            height: lensSize,
                            overflow: "hidden",
                            pointerEvents: "none",
                            boxShadow: "0 0 0 2px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0.25)",
                            borderRadius: "4px",
                            zIndex: 50,
                        }}
                    >
                        {/* 렌즈 안 이미지: 컨테이너 기준으로 정확히 위치 계산 */}
                        <div
                            style={{
                                position: "absolute",
                                top: -(lensPos.y * zoomFactor) + lensSize / 2,
                                left: -(lensPos.x * zoomFactor) + lensSize / 2,
                                width: containerRef.current?.offsetWidth * zoomFactor || "100%",
                                height: containerRef.current?.offsetHeight * zoomFactor || "100%",
                                transformOrigin: "top left",
                            }}
                        >
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}