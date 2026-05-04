import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import './scss/product3dviewer.scss'
import PaveSofaCards from '../pages/PaveSofaCards'
import { rotate } from 'three/tsl'

const QUALITY_STATS = [
    {
        id: 'compress',
        label: '반복 압축 테스트',
        desc: '동일 하중 가압 후\n형태 변형률 2.1% 이하',
        target: 100000,
        suffix: '회',
        compare: '업계 기준 5만 회',
        score: 97,
    },
    {
        id: 'restore',
        label: '폼 복원율',
        desc: '압축 후 24시간 내\n원형 복원 비율',
        target: 98,
        suffix: '%',
        compare: '업계 평균 85%',
        score: 98,
    },
    {
        id: 'load',
        label: '최대 하중 테스트',
        desc: '프레임 파손 없이\n견딘 최대 집중 하중',
        target: 280,
        suffix: 'kg',
        compare: '업계 기준 150kg',
        score: 93,
    },
    {
        id: 'uv',
        label: '자외선 내색 테스트',
        desc: 'UV 조사 후\n색차 ΔE 1.2 이하 유지',
        target: 5000,
        suffix: '시간',
        compare: '업계 기준 1000시간',
        score: 91,
    },
    {
        id: 'warranty',
        label: '무상 보증 기간',
        desc: '프레임·스프링·폼\n전 구성품 보증',
        target: 3,
        suffix: '년',
        compare: '업계 평균 1년',
        score: 100,
        scoreLabel: '업계 최장',
    },
    {
        id: 'density',
        label: '우레탄 폼 밀도',
        desc: '고반발 고밀도 폼\n체중 분산 최적화',
        target: 40,
        suffix: 'kg/m³',
        compare: '일반 제품 18~25',
        score: 88,
        scoreLabel: '프리미엄급',
    },
]

const MODEL_LIST = [
    {
        key: 'sofa1',
        name: '2인용',
        optionName: '파베 2인용 소파',
        models: [
            {
                path: '/models/sofa1.glb',
                scale: 1.9,
                position: [0, 0, 0],
            },
        ],
        camera: [-2.2, 1.1, 5.2],
        target: [0, 0.45, 0],
    },
    {
        key: 'sofa2',
        name: '3인용',
        optionName: '파베 3인용 소파',
        models: [
            {
                path: '/models/sofa2.glb',
                scale: 1.9,
                position: [0, 0, 0],
            },
        ],
        camera: [-2.2, 1.1, 5.2],
        target: [0, 0.45, 0],
    },
    {
        key: 'stool',
        name: '스툴',
        optionName: '파베 스툴',
        models: [
            {
                path: '/models/stool.glb',
                scale: 2.1,
                position: [0, 0, 0],
            },
        ],
        camera: [-1.8, 1.0, 4.4],
        target: [0, 0.3, 0],
    },
    {
        key: 'sofa1-stool',
        name: '2인용 + 스툴',
        optionName: '파베 2인용 소파 + 스툴',
        models: [
            {
                path: '/models/sofa1.glb',
                scale: 1.75,
                position: [-0.45, 0, 0],
            },
            {
                path: '/models/stool.glb',
                scale: [1.65, 1.62, 1.5],
                position: [0.03, -0.05, 1.18],
                // rotation: [0, Math.PI, 0],
            },
        ],
        camera: [-2.8, 1.3, 6.0],
        target: [0.0, 0.45, 0.3],
    },
    {
        key: 'sofa2-stool',
        name: '3인용 + 스툴',
        optionName: '파베 3인용 소파 + 스툴',
        models: [
            {
                path: '/models/sofa2.glb',
                scale: 1.65,
                position: [-0.45, 0, 0],
            },
            {
                path: '/models/stool.glb',
                scale: [1.6, 1.5, 1.5],
                position: [0.45, -0.02, 1.1],
                // rotation: [0, Math.PI, 0]
            },
        ],
        camera: [-3.0, 1.3, 6.4],
        target: [0.1, 0.45, 0.3],
    },
]

const colors = [
    { name: '베이지', value: '#e3ddcd', renderValue: '#e3ddcd' },
    { name: '그레이', value: '#cfcfcf', renderValue: '#c8d2d4' },
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

function isFabricObject(objectName = '', materialName = '') {
    const name = `${objectName} ${materialName}`.toLowerCase()

    if (
        name.includes('leg') ||
        name.includes('wood') ||
        name.includes('base') ||
        name.includes('frame') ||
        name.includes('bottom')
    ) {
        return false
    }

    return (
        name.includes('fabric') ||
        name.includes('body') ||
        name.includes('seat') ||
        name.includes('cushion') ||
        name.includes('back') ||
        name.includes('arm') ||
        name.includes('sofa') ||
        name.includes('stool') ||
        name.includes('defaultmaterial')
    )
}

function ModelPart({ part, color, stoolColor }) {
    const { scene } = useGLTF(part.path)
    const modelRef = useRef()

    const clonedScene = useMemo(() => {
        const clone = scene.clone(true)
        const isStoolModel = part.path.toLowerCase().includes('stool')

        clone.traverse((child) => {
            if (!child.isMesh) return

            child.castShadow = true
            child.receiveShadow = true

            const cloneMaterial = (mat) => {
                if (!mat) return mat

                const newMat = mat.clone()
                const isFabric = isFabricObject(child.name, mat.name)

                if (mat.map) newMat.map = mat.map
                if (mat.normalMap) newMat.normalMap = mat.normalMap
                if (mat.roughnessMap) newMat.roughnessMap = mat.roughnessMap
                if (mat.aoMap) newMat.aoMap = mat.aoMap
                if (mat.metalnessMap) newMat.metalnessMap = mat.metalnessMap
                if (mat.emissiveMap) newMat.emissiveMap = mat.emissiveMap

                if (isFabric) {
                    if (newMat.color) {
                        newMat.color = new THREE.Color(color)
                    }
                    if ('envMapIntensity' in newMat) newMat.envMapIntensity = 0.018
                    if (newMat.normalMap && newMat.normalScale) {
                        newMat.normalScale.set(0.35, 0.35)
                    }
                    if ('roughness' in newMat) newMat.roughness = 1
                    if ('metalness' in newMat) newMat.metalness = 0
                } else {
                    if ('roughness' in newMat) newMat.roughness = 0.85
                    if ('metalness' in newMat) newMat.metalness = 0
                    if ('envMapIntensity' in newMat) newMat.envMapIntensity = 0.02
                }

                newMat.transparent = false
                newMat.opacity = 1
                newMat.depthWrite = true
                newMat.needsUpdate = true

                return newMat
            }

            if (Array.isArray(child.material)) {
                child.material = child.material.map(cloneMaterial)
            } else {
                child.material = cloneMaterial(child.material)
            }
        })

        const box = new THREE.Box3().setFromObject(clone)
        const center = box.getCenter(new THREE.Vector3())

        clone.position.x -= center.x
        clone.position.z -= center.z
        clone.position.y -= box.min.y

        return clone
    }, [scene, color, stoolColor, part.path])

    useEffect(() => {
        if (!modelRef.current) return

        const targetColor = new THREE.Color(color)
        const targetStoolColor = new THREE.Color(stoolColor)
        const isStoolModel = part.path.toLowerCase().includes('stool')

        modelRef.current.traverse((child) => {
            if (!child.isMesh) return

            const applyMaterial = (mat) => {
                if (!mat) return

                const isFabric = isFabricObject(child.name, mat.name)

                if (isFabric) {
                    if (mat.color) {
                        mat.color.copy(targetColor)
                    }
                    if ('envMapIntensity' in mat) mat.envMapIntensity = 0.018
                    if (mat.normalMap && mat.normalScale) {
                        mat.normalScale.set(0.35, 0.35)
                    }
                    if ('roughness' in mat) mat.roughness = 1
                    if ('metalness' in mat) mat.metalness = 0
                } else {
                    if ('roughness' in mat) mat.roughness = 0.85
                    if ('metalness' in mat) mat.metalness = 0
                    if ('envMapIntensity' in mat) mat.envMapIntensity = 0.02
                }

                mat.transparent = false
                mat.opacity = 1
                mat.depthWrite = true
                mat.needsUpdate = true
            }

            if (Array.isArray(child.material)) {
                child.material.forEach(applyMaterial)
            } else {
                applyMaterial(child.material)
            }
        })
    }, [color, stoolColor, part.path])

    return (
        <group position={part.position} rotation={part.rotation || [0, 0, 0]}>
            <primitive
                ref={modelRef}
                object={clonedScene}
                scale={part.scale}

            />
        </group>
    )
}

function SceneModels({ selectedModel, color, stoolColor }) {
    const groupRef = useRef()

    useEffect(() => {
        if (!groupRef.current) return

        // 먼저 이전 보정값 초기화
        groupRef.current.position.set(0, 0, 0)

        // 조합 전체 기준 박스 계산
        const box = new THREE.Box3().setFromObject(groupRef.current)
        const center = box.getCenter(new THREE.Vector3())

        // 전체 조합을 화면 중앙으로 이동
        groupRef.current.position.x -= center.x
        groupRef.current.position.z -= center.z
    }, [selectedModel.key, color, stoolColor])

    return (
        <group ref={groupRef}>
            {selectedModel.models.map((part, index) => (
                <ModelPart
                    key={`${part.path}-${index}`}
                    part={part}
                    color={color}
                    stoolColor={stoolColor}
                />
            ))}
        </group>
    )
}

function CameraController({ play, introKey, cameraPosition, targetPosition, enabled }) {
    const { camera } = useThree()
    const controlsRef = useRef(null)
    const progressRef = useRef(0)
    const playedRef = useRef(false)

    const startPos = useMemo(() => new THREE.Vector3(-4.8, 2.6, 7.4), [])
    const endPos = useMemo(
        () => new THREE.Vector3(...cameraPosition),
        [cameraPosition]
    )
    const target = useMemo(
        () => new THREE.Vector3(...targetPosition),
        [targetPosition]
    )

    useEffect(() => {
        if (!play) {
            camera.position.copy(endPos)
            camera.lookAt(target)
            camera.updateProjectionMatrix()

            if (controlsRef.current) {
                controlsRef.current.target.copy(target)
                controlsRef.current.update()
            }

            return
        }

        playedRef.current = false
        progressRef.current = 0

        camera.position.copy(startPos)
        camera.lookAt(target)
        camera.updateProjectionMatrix()

        if (controlsRef.current) {
            controlsRef.current.target.copy(target)
            controlsRef.current.update()
        }
    }, [play, introKey, camera, startPos, endPos, target])

    useFrame((_, delta) => {
        if (!play || playedRef.current) return

        progressRef.current += delta * 0.75

        const t = Math.min(progressRef.current, 1)
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
            enabled={enabled}
            enablePan={false}
            minDistance={3.8}
            maxDistance={7.4}
            target={targetPosition}
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
                    <strong>마우스로 돌려보세요</strong>
                    <span>원하는 각도에서 상품을 확인할 수 있어요</span>
                </div>
            </div>
        </div>
    )
}

function QualityStats() {
    const [animated, setAnimated] = useState(false)
    const wrapRef = useRef(null)
    const rafRefs = useRef([])

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAnimated(true)
                    obs.disconnect()
                }
            },
            { threshold: 0.15 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    useEffect(() => {
        if (!animated) return
        const counters = wrapRef.current?.querySelectorAll('.qs-count')
        counters?.forEach((el, i) => {
            const target = parseFloat(el.dataset.target)
            const suffix = el.dataset.suffix
            const duration = 1400 + i * 100
            const startTime = performance.now()
            const tick = (now) => {
                const t = Math.min((now - startTime) / duration, 1)
                const ease = 1 - Math.pow(1 - t, 4)
                const val = target * ease
                const display = target >= 1000
                    ? Math.round(val).toLocaleString()
                    : Math.round(val)
                el.textContent = display + suffix
                if (t < 1) {
                    rafRefs.current[i] = requestAnimationFrame(tick)
                }
            }
            rafRefs.current[i] = requestAnimationFrame(tick)
        })
        return () => rafRefs.current.forEach((id) => cancelAnimationFrame(id))
    }, [animated])

    return (
        <div className="qs-wrap" ref={wrapRef}>
            <div className="qs-intro">

                <h3>숫자로 증명하는 파베 소파</h3>
                <p>국제 가구 내구성 기준 KS G 4213 기반 자체 테스트 결과</p>
            </div>
            <div className="qs-grid">
                {QUALITY_STATS.map((stat, i) => (
                    <div
                        className={`qs-card ${animated ? 'visible' : ''}`}
                        key={stat.id}
                        style={{ transitionDelay: `${i * 0.07}s` }}
                    >
                        <div className="qs-card-head">
                            <span className="qs-pass">PASS</span>
                        </div>
                        <div className="qs-num">
                            <span
                                className="qs-count"
                                data-target={stat.target}
                                data-suffix={stat.suffix}
                            >
                                0{stat.suffix}
                            </span>
                        </div>
                        <div className="qs-card-label">
                            <strong>{stat.label}</strong>
                            <span>{stat.desc}</span>
                        </div>
                        <div className="qs-bar">
                            <div
                                className="qs-bar-fill"
                                style={{ width: animated ? `${stat.score}%` : '0%' }}
                            />
                        </div>
                        <div className="qs-bar-meta">
                            <span>{stat.compare}</span>
                            <span>{stat.scoreLabel ?? `${stat.score}점`}</span>
                        </div>
                    </div>
                ))}
            </div>
            <p className="qs-footnote">
                * 자체 품질관리 연구소 측정 기준 · 외부 공인 시험기관 성적서 보유
            </p>
        </div>
    )
}

export default function Product3DViewer() {
    const [activeTab, setActiveTab] = useState('viewer')
    const [selectedModelKey, setSelectedModelKey] = useState(MODEL_LIST[0].key)
    const [selectedColor, setSelectedColor] = useState(colors[0].value)
    const [showGuide, setShowGuide] = useState(true)
    const [saleTime, setSaleTime] = useState(getSaleTimeLeft)

    const viewerRef = useRef(null)
    const [playCameraIntro, setPlayCameraIntro] = useState(false)
    const [introKey, setIntroKey] = useState(0)

    const selectedModel =
        MODEL_LIST.find((model) => model.key === selectedModelKey) || MODEL_LIST[0]

    const selectedColorOption =
        colors.find((color) => color.value === selectedColor) || colors[0]

    const renderColor = selectedColorOption.renderValue || selectedColorOption.value
    const renderStoolColor = selectedColorOption.stoolValue || renderColor

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
                    setIntroKey((prev) => prev + 1)
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

    const handleModelClick = (modelKey) => {
        if (selectedModelKey === modelKey) return

        setSelectedModelKey(modelKey)
        setShowGuide(false)

        if (playCameraIntro) {
            setIntroKey((prev) => prev + 1)
        }
    }

    const handleColorClick = (colorValue) => {
        if (selectedColor === colorValue) return

        setSelectedColor(colorValue)
        setShowGuide(false)
    }

    return (
        <section className="home-3d-viewer">

            {/* 탭 네비게이션 */}
            <div className="viewer-tab-nav">
                <button
                    type="button"
                    className={`viewer-tab-btn ${activeTab === 'viewer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('viewer')}
                >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="16" height="12" rx="2" />
                        <path d="M7 16v2M13 16v2M5 18h10" />
                    </svg>
                    3D 쇼룸
                </button>
                <button
                    type="button"
                    className={`viewer-tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quality')}
                >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 2L3 5.5v4.5c0 4 2.8 7.5 7 8.5 4.2-1 7-4.5 7-8.5V5.5L10 2z" />
                        <path d="M7 10l2 2 4-4" />
                    </svg>
                    품질 테스트
                </button>
            </div>

            {/* 3D 쇼룸 패널 */}
            <div className={`viewer-tab-panel ${activeTab === 'viewer' ? 'active' : ''}`}>
                <div className="viewer-text sale-viewer-text">
                    <div className="sale-title-row">
                        <span className="sale-dday">
                            {saleTime.isEnded ? 'SALE END' : `D-${saleTime.day}`}
                        </span>
                    </div>

                    <h2>가정의 달, 파베 소파 특별 세일</h2>
                    <p>
                        가족이 함께 머무는 거실을 더 포근하게,
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
                    style={{ pointerEvents: showGuide ? 'none' : 'auto' }}
                >
                    {showGuide && <DragGuide />}

                    <Canvas
                        shadows
                        camera={{ position: selectedModel.camera, fov: 28 }}
                        gl={{ alpha: true, antialias: true }}
                        onCreated={({ gl }) => {
                            gl.toneMapping = THREE.ACESFilmicToneMapping
                            gl.toneMappingExposure = 7
                        }}
                    >
                        <ambientLight intensity={0.85} />

                        <directionalLight
                            position={[4, 5, 4]}
                            intensity={0.78}
                            castShadow
                        />

                        <directionalLight
                            position={[-3, 2, -3]}
                            intensity={0.15}
                        />

                        <Environment preset="studio" environmentIntensity={0.045} />

                        <Suspense
                            fallback={
                                <Html center>
                                    <div className="viewer-loading">
                                        3D 모델 불러오는 중...
                                    </div>
                                </Html>
                            }
                        >
                            <SceneModels
                                key={`${selectedModel.key}-${selectedColor}`}
                                selectedModel={selectedModel}
                                color={renderColor}
                                stoolColor={renderStoolColor}
                            />
                        </Suspense>

                        <CameraController
                            play={playCameraIntro}
                            introKey={`${selectedModel.key}-${introKey}`}
                            cameraPosition={selectedModel.camera}
                            targetPosition={selectedModel.target}
                            enabled={!showGuide}
                        />
                    </Canvas>
                </div>

                <div className="viewer-current-option">
                    현재 선택한 옵션은
                    <strong> {selectedModel.optionName} / {selectedColorOption.name}</strong>
                    입니다.
                </div>

                <div className="viewer-option-bar">
                    <div className="viewer-option-group">
                        <span className="viewer-option-label">쇼룸 구성</span>
                        <div className="viewer-model-tabs">
                            {MODEL_LIST.map((model) => (
                                <button
                                    key={model.key}
                                    type="button"
                                    className={selectedModelKey === model.key ? 'active' : ''}
                                    onClick={() => handleModelClick(model.key)}
                                >
                                    {model.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="viewer-option-group">
                        <span className="viewer-option-label">패브릭 컬러</span>
                        <div className="viewer-color-list">
                            {colors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    className={`viewer-color-btn ${selectedColor === color.value ? 'active' : ''}`}
                                    onClick={() => handleColorClick(color.value)}
                                >
                                    <span
                                        className="viewer-color-dot"
                                        style={{ background: color.value }}
                                    />
                                    {color.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 품질 테스트 패널 */}
            <div className={`viewer-tab-panel ${activeTab === 'quality' ? 'active' : ''}`}>
                <QualityStats />
            </div>

            <PaveSofaCards />
        </section>
    )
}

useGLTF.preload('/models/sofa1.glb')
useGLTF.preload('/models/sofa2.glb')
useGLTF.preload('/models/stool.glb')