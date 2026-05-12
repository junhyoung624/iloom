import { useRef, useEffect, useState } from "react";
import styles from "./scss/ModuleHero.module.scss"

export default function ModuleHero() {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => { });
  }, []);

  return (
    <section className={styles.hero}>
      {/* 배경 비디오 */}
      <div className={`${styles.videoBg} ${loaded ? styles.visible : ""}`}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setLoaded(true)}
        >
          {/* 실제 영상 경로로 교체하세요 */}
          <source src="images/video/iloom_module.mp4" type="video/mp4" />
        </video>
        <div className={styles.overlay} />
      </div>

      {/* 콘텐츠 */}
      <div className={styles.content}>
        <div className={styles.inner}>
          <h1 className={styles.heading}>
            나만의 공간,
            <br />
            <em>모듈로 완성하다</em>
          </h1>

          <p className={styles.desc}>
            하나의 구조에서 시작해 무한히 확장되는 iloom 모듈 시스템.
            <br />
            크기, 컬러, 구성 — 모든 것을 당신의 라이프스타일에 맞게 설계하세요.
          </p>

          <a href="/customize" className={styles.cta}>
            <span>커스터마이즈 하러가기</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 10H16M16 10L11 5M16 10L11 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
