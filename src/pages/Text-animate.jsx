"use client";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

const animationVariants = {
    blurInUp: {
        hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
        show: (i) => ({
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: { delay: i * 0.04, duration: 0.4, ease: "easeOut" },
        }),
    },
    slideUp: {
        hidden: { y: "110%" },
        show: (i) => ({
            y: "0%",
            transition: { delay: i * 0.05, duration: 0.6, ease: [0.33, 1, 0.68, 1] },
        }),
    },
    fadeIn: {
        hidden: { opacity: 0 },
        show: (i) => ({
            opacity: 1,
            transition: { delay: i * 0.06, duration: 0.4 },
        }),
    },
};

export function TextAnimate({
    children,
    animation = "fadeIn",
    by = "word",
    delay = 0,
    once = false,
    className = "",
    segmentClassName = "",
    as: Tag = "p",
}) {
    const ref = useRef(null);
    const controls = useAnimation();
    const isInView = useInView(ref, { once, margin: "-10% 0px" });
    const variants = animationVariants[animation] ?? animationVariants.fadeIn;

    useEffect(() => {
        if (isInView) controls.start("show");
        else if (!once) controls.start("hidden");
    }, [isInView, controls, once]);

    const segments =
        by === "character"
            ? children.split("")
            : by === "word"
                ? children.split(" ")
                : [children];

    return (
        <Tag ref={ref} className={className} aria-label={children}>
            <span aria-hidden>
                {segments.map((seg, i) => (
                    <span
                        key={i}
                        style={{
                            display: "inline-block",
                            overflow: "hidden",
                            verticalAlign: "bottom",
                            ...(by === "word" ? { marginRight: "0.25em" } : {}),
                        }}
                    >
                        <motion.span
                            custom={i + delay / 0.04}
                            variants={variants}
                            initial="hidden"
                            animate={controls}
                            style={{ display: "inline-block" }}
                            className={segmentClassName}
                        >
                            {seg === " " ? "\u00A0" : seg}
                        </motion.span>
                    </span>
                ))}
            </span>
        </Tag>
    );
}