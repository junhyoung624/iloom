import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";

export function Dock({
    children,
    iconSize = 40,
    iconMagnification = 60,
    iconDistance = 140,
    direction = "middle",
    disableMagnification = false,
    className = "",
}) {
    const mouseX = useMotionValue(Infinity);

    const alignItems =
        direction === "top" ? "flex-start"
            : direction === "bottom" ? "flex-end"
                : "center";

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.clientX)}  // pageX → clientX
            onMouseLeave={() => mouseX.set(Infinity)}
            style={{ display: "flex", alignItems, gap: "8px" }}
            className={`dock ${className}`}
        >
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;
                return React.cloneElement(child, {
                    mouseX,
                    size: iconSize,
                    magnification: disableMagnification ? iconSize : iconMagnification,
                    distance: iconDistance,
                });
            })}
        </motion.div>
    );
}

export function DockIcon({
    mouseX,
    size = 40,
    magnification = 60,
    distance = 140,
    children,
    className = "",
    ...props
}) {
    const ref = useRef(null);
    const fallback = useMotionValue(Infinity);
    const mx = mouseX ?? fallback;

    const distanceFromCursor = useTransform(mx, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { left: 0, width: 0 };
        return val - bounds.left - bounds.width / 2;  // x → left
    });

    const widthSync = useTransform(
        distanceFromCursor,
        [-distance, 0, distance],
        [size, magnification, size]
    );

    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <motion.div
            ref={ref}
            style={{ width, height: width }}
            className={`dock-icon ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function DockSeparator() {
    return <div className="dock-separator" />;
}