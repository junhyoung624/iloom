import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'
import "./scss/product3dviewer.scss"
import PaveSofaCards from '../pages/PaveSofaCards'

const MODEL_PATH = '/models/sofa.glb'

const colors = [
    { name: '베이지', value: '#d8d1c5' },
    { name: '그레이', value: '#b8b8b8' },
]

const SALE_DAYS = 7

function getSaleTimeLeft() {
    const now = new Date()
    const savedEndDate = localStorage.getItem('familySaleEndDate')

    let endDate

    if (savedEndDate) {
        endDate = new Date(savedEndDate)
    } else {
        endDate = new Date()
        endDate.setDate(now.getDate() + SALE_DAYS)
        endDate.setHours(23, 59, 59, 999)
        localStorage.setItem('familySaleEndDate', endDate.toISOString())
    }

    const diff = endDate.getTime() - now.getTime()

    if (diff <= 0) {
        return {
            day: 0,
            hours: '00',
            minutes: '00',
            seconds: '00',
            isEnded: true,
        }
    }

    const day = Math.ceil(diff / (1000 * 60 * 60 * 24))
    const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0')
    const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0')
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0')

    return {
        day,
        hours,
        minutes,
        seconds,
        isEnded: false,
    }
}

function Model({ color }) {
    const { scene } = useGLTF(MODEL_PATH)
    const modelRef = useRef()

    const clonedScene = useMemo(() => {
        const clone = scene.clone(true)

        clone.traverse((child) => {
            if (!child.isMesh) return

            child.castShadow = true
            child.receiveShadow = true

            const cloneMaterial = (mat) => {
                const newMat = mat.clone()

                if (mat.map) {
                    newMat.map = mat.map
                }

                if (mat.normalMap) {
                    newMat.normalMap = mat.normalMap
                }

                if (mat.roughnessMap) {
                    newMat.roughnessMap = mat.roughnessMap
                }

                if (mat.aoMap) {
                    newMat.aoMap = mat.aoMap
                }

                if ('roughness' in newMat) newMat.roughness = 1.3
                if ('metalness' in newMat) newMat.metalness = 0
                if ('envMapIntensity' in newMat) newMat.envMapIntensity = 0.10
                if (newMat.normalScale) newMat.normalScale.set(1, 1)

                newMat.needsUpdate = true

                return newMat
            }

            if (Array.isArray(child.material)) {
                child.material = child.material.map(cloneMaterial)
            } else {
                child.material = cloneMaterial(child.material)
            }
        })

        return clone
    }, [scene])

    useEffect(() => {
        if (!modelRef.current) return

        const targetColor = new THREE.Color(color)

        modelRef.current.traverse((child) => {
            if (!child.isMesh) return

            const applyColor = (mat) => {
                if (!mat) return

                if (mat.color) {
                    mat.color.copy(targetColor)
                }

                if ('roughness' in mat) mat.roughness = 0.9
                if ('metalness' in mat) mat.metalness = 0
                if ('envMapIntensity' in mat) mat.envMapIntensity = 0.14
                if (mat.normalScale) mat.normalScale.set(1, 1)

                mat.needsUpdate = true
            }

            if (Array.isArray(child.material)) {
                child.material.forEach(applyColor)
            } else {
                applyColor(child.material)
            }
        })
    }, [color])

    return (
        <Center>
            <primitive
                ref={modelRef}
                object={clonedScene}
                scale={1.9}
                position={[0, -0.08, 0]}
            />
        </Center>
    )
}

// ✅ 스크롤해서 3D 영역에 도착했을 때 카메라 등장 애니메이션
function CameraIntro({ play }) {
    const { camera } = useThree()
    const controlsRef = useRef(null)
    const progressRef = useRef(0)
    const playedRef = useRef(false)

    const startPos = useMemo(() => new THREE.Vector3(-4.8, 2.6, 7.4), [])
    const endPos = useMemo(() => new THREE.Vector3(-2.2, 1.1, 5.2), [])
    const target = useMemo(() => new THREE.Vector3(0, -0.1, 0), [])

    useEffect(() => {
        if (!play || playedRef.current) return

        progressRef.current = 0
        camera.position.copy(startPos)
        camera.lookAt(target)
        camera.updateProjectionMatrix()

        if (controlsRef.current) {
            controlsRef.current.target.copy(target)
            controlsRef.current.update()
        }
    }, [play, camera, startPos, target])

    useFrame((_, delta) => {
        if (!play || playedRef.current) return

        progressRef.current += delta * 0.7

        const t = Math.min(progressRef.current, 1)

        // 뾰로롱 느낌: 처음 빠르고 끝은 부드럽게 멈춤
        const ease = 1 - Math.pow(1 - t, 3)

        camera.position.lerpVectors(startPos, endPos, ease)
        camera.lookAt(target)
        camera.updateProjectionMatrix()

        if (controlsRef.current) {
            controlsRef.current.target.copy(target)
            controlsRef.current.update()
        }

        if (t >= 1) {
            playedRef.current = true
            camera.position.copy(endPos)
            camera.lookAt(target)
            camera.updateProjectionMatrix()
        }
    })

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={3.8}
            maxDistance={7}
            target={[0, -0.1, 0]}
        />
    )
}

function DragGuide() {
    return (
        <div className="viewer-guide">
            <div className="viewer-guide-badge">
                <div className="viewer-guide-icon">
                    <svg viewBox="0 0 64 64" aria-hidden="true">
                        <g
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 18 L14 24 L22 30" />
                            <path d="M42 18 L50 24 L42 30" />
                            <path d="M14 24 H50" />
                            <path d="M28 43V24a4 4 0 1 1 8 0v11" />
                            <path d="M36 35a4 4 0 1 1 8 0v4" />
                            <path d="M28 35a4 4 0 1 0-8 0v3" />
                            <path d="M20 38v6c0 6 4 10 10 10h4c7 0 12-5 12-12v-5" />
                        </g>
                    </svg>
                </div>

                <div className="viewer-guide-text">
                    <strong>드래그해서 돌려보세요</strong>
                    <span>드래그해서 3D 뷰를 확인할 수 있어요</span>
                </div>
            </div>
        </div>
    )
}

export default function Product3DViewer() {
    const [selectedColor, setSelectedColor] = useState(colors[0].value)
    const [showGuide, setShowGuide] = useState(true)
    const [saleTime, setSaleTime] = useState(getSaleTimeLeft)

    // ✅ 3D 박스가 화면에 들어왔는지 감지
    const viewerRef = useRef(null)
    const [playCameraIntro, setPlayCameraIntro] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setSaleTime(getSaleTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (!viewerRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setPlayCameraIntro(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.35,
            }
        )

        observer.observe(viewerRef.current)

        return () => observer.disconnect()
    }, [])

    return (
        <section className="home-3d-viewer">
            <div className="viewer-text sale-viewer-text">
                <div className="sale-title-row">
                    <span className="sale-dday">
                        {saleTime.isEnded ? 'SALE END' : `D-${saleTime.day}`}
                    </span>
                </div>

                <h2>가정의 달, 파베 소파 특별 세일</h2>
                <p>
                    가족이 함께 머무는 거실을 더 포근하게.
                    지금 파베 패브릭 소파를 10% 할인된 혜택으로 만나보세요.
                </p>

                <div className="sale-timer">
                    <div className="sale-time-box">
                        <strong>{saleTime.hours}</strong>
                    </div>
                    <em>:</em>
                    <div className="sale-time-box">
                        <strong>{saleTime.minutes}</strong>
                    </div>
                    <em>:</em>
                    <div className="sale-time-box">
                        <strong>{saleTime.seconds}</strong>
                    </div>
                </div>
            </div>

            <div
                ref={viewerRef}
                className="viewer-box"
                onPointerDown={() => setShowGuide(false)}
                onTouchStart={() => setShowGuide(false)}
            >
                {showGuide && <DragGuide />}

                <Canvas
                    shadows
                    camera={{ position: [-2.2, 1.1, 5.2], fov: 28 }}
                    gl={{ alpha: true, antialias: true }}
                    onCreated={({ gl }) => {
                        gl.toneMapping = THREE.ACESFilmicToneMapping
                        gl.toneMappingExposure = 6.5
                    }}
                >
                    <ambientLight intensity={0.65} />

                    <directionalLight
                        position={[4, 5, 4]}
                        intensity={0.9}
                        castShadow
                    />

                    <directionalLight
                        position={[-3, 2, -3]}
                        intensity={0.12}
                    />

                    <Environment preset="apartment" environmentIntensity={0.15} />

                    <Suspense fallback={null}>
                        <Model color={selectedColor} />
                    </Suspense>

                    <CameraIntro play={playCameraIntro} />
                </Canvas>
            </div>

            <div className="viewer-color-list">
                {colors.map((color) => (
                    <button
                        key={color.value}
                        type="button"
                        className={`viewer-color-btn ${selectedColor === color.value ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color.value)}
                    >
                        <span
                            className="viewer-color-dot"
                            style={{ background: color.value }}
                        />
                        {color.name}
                    </button>
                ))}
            </div>

            <PaveSofaCards />
        </section>
    )
}

useGLTF.preload(MODEL_PATH)