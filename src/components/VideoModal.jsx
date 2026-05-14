import { useEffect, useRef } from 'react'
import styles from "./scss/VideoModal.module.scss"

export default function VideoModal({ isOpen, onClose }) {
  const videoRef = useRef(null)
  const overlayRef = useRef(null)

  // 영상 재생
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    if (isOpen) {
      v.currentTime = 0
      v.play().catch(() => { })
    } else {
      v.pause()
    }
  }, [isOpen])

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleHideWeek = () => {
    const now = new Date()

    // 현재 시간 + 1일
    const tomorrow = now.getTime() + 1 * 24 * 60 * 60 * 1000

    localStorage.setItem(
      "hideVideoPopupUntil",
      String(tomorrow)
    )

    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className={styles.modal}>

        <button
          type="button"
          className={styles.topClose}
          onClick={onClose}
        >
          ✕
        </button>

        <div className={styles.videoWrap}>
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            autoPlay
          >
            <source
              src="/images/video/iloom_des.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        <div className={styles.bottom}>
          <button
            type="button"
            className={styles.btnSub}
            onClick={handleHideWeek}
          >
            오늘 하루 보지 않기
          </button>

          <button
            type="button"
            className={styles.btnClose}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}