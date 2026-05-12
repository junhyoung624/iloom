import { useState, useMemo, useCallback, useRef, useEffect, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import './scss/configurator.scss'

// ────────────────────────────────────────────────────────────
//  상수
// ────────────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { id: 'golden-yellow', label: 'Golden Yellow', hex: '#E8A020', r: 0.91, g: 0.63, b: 0.13 },
  { id: 'pure-white', label: 'Pure White', hex: '#F0EEE9', r: 0.94, g: 0.93, b: 0.91 },
  { id: 'graphite-black', label: 'Graphite Black', hex: '#2A2A2A', r: 0.16, g: 0.16, b: 0.16 },
  { id: 'warm-grey', label: 'Warm Grey', hex: '#9E9E96', r: 0.62, g: 0.62, b: 0.59 },
  { id: 'deep-red', label: 'Deep Red', hex: '#C0222A', r: 0.75, g: 0.13, b: 0.16 },
  { id: 'forest-green', label: 'Forest Green', hex: '#3A6B4A', r: 0.23, g: 0.42, b: 0.29 },
  { id: 'sky-blue', label: 'Sky Blue', hex: '#5A8FBF', r: 0.35, g: 0.56, b: 0.75 },
  { id: 'terracotta', label: 'Terracotta', hex: '#C4603A', r: 0.77, g: 0.38, b: 0.23 },
  { id: 'dusty-pink', label: 'Dusty Pink', hex: '#D4908A', r: 0.83, g: 0.56, b: 0.54 },
  { id: 'olive', label: 'Olive', hex: '#7A7A3A', r: 0.48, g: 0.48, b: 0.23 },
]

const PANEL_TYPES = [
  { id: 'none', label: '없음', pricePerSlot: 0 },
  { id: 'panel', label: '패널', pricePerSlot: 89000 },
  { id: 'folding', label: '폴딩 도어', pricePerSlot: 139000 },
]

const MODULE_BASE_PRICE = 420000
const FRAME_CHROME_PRICE = 80000
const FOOT_PAD_PRICE = 15000  // 고무 발 4개 세트
const MAX_COLS = 5
const MAX_ROWS = 4

// 모듈 1칸 실제 치수 (Three.js units ≈ m)
const MW = 0.92   // width
const MH_FULL = 0.55  // 표준 높이
const MH_HALF = 0.275 // 슬림 높이 (절반)
const MD = 0.46   // depth
const FT = 0.015  // frame tube radius
const JR = 0.024  // joint sphere radius

// heightType별 실제 MH
const getMH = (ht) => ht === 'half' ? MH_HALF : MH_FULL
// 하위 호환
const MH = MH_FULL

const makeModule = (r, c, color = COLOR_OPTIONS[0], heightType = 'full') => ({
  r, c,
  panelType: 'folding',
  color,
  heightType,  // 'full' | 'half'
})

const fmt = (n) => n.toLocaleString('ko-KR') + '원'

// ────────────────────────────────────────────────────────────
//  카메라 위치: 정면 ↔ 아이소메트릭
// ────────────────────────────────────────────────────────────
function getCameraPositions(cols, rows, modules) {
  const objW = cols * (MW + FT * 2)
  let objH = FT * 2
  for (let r = 0; r < rows; r++) {
    const rowMod = modules?.find(m => m.r === r)
    const mh = getMH(rowMod?.heightType || 'full')
    objH += mh + FT * 2
  }
  const midY = objH / 2   // 가구 세로 중심
  const objMax = Math.max(objW, objH)
  const rowBonus = Math.max(0, rows - 1) * 0.22
  const dist = objMax * 0.88 + 0.7 + rowBonus

  return {
    front: new THREE.Vector3(0, midY, dist * 0.95),
    iso: new THREE.Vector3(dist * 0.55, midY + dist * 0.18, dist * 0.6),
    target: new THREE.Vector3(0, midY, 0),
  }
}

// ────────────────────────────────────────────────────────────
//  메인 컴포넌트
// ────────────────────────────────────────────────────────────
export default function Configurator() {
  const navigate = useNavigate()
  const viewerRef = useRef(null)
  const glRef = useRef(null)   // Three.js gl 인스턴스

  const [modules, setModules] = useState([makeModule(0, 0)])
  const [selectedCell, setSelectedCell] = useState({ r: 0, c: 0 })
  const [selectedHeightType, setSelectedHeightType] = useState('full')  // 'full' | 'half'
  const [hasFootPad, setHasFootPad] = useState(false)
  const [scrollT, setScrollT] = useState(0)   // 0=정면, 1=아이소
  const [hoveredCell, setHoveredCell] = useState(null)

  const cols = useMemo(() => Math.max(...modules.map(m => m.c)) + 1, [modules])
  const rows = useMemo(() => Math.max(...modules.map(m => m.r)) + 1, [modules])
  const selectedModule = useMemo(
    () => modules.find(m => m.r === selectedCell.r && m.c === selectedCell.c),
    [modules, selectedCell]
  )

  // 스크롤 감지 → scrollT 업데이트
  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const h = el.offsetHeight
      // 뷰어 안에서의 스크롤 진행도 0→1
      const raw = Math.max(0, -rect.top) / (h * 0.6)
      setScrollT(Math.min(1, raw))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── 모듈 관리 ──
  const addCol = useCallback(() => {
    if (cols >= MAX_COLS) return
    setModules(prev => {
      const curColor = prev[0]?.color || COLOR_OPTIONS[0]
      return [...prev, ...Array.from({ length: rows }, (_, r) => makeModule(r, cols, curColor, selectedHeightType))]
    })
  }, [cols, rows, selectedHeightType])

  const addRow = useCallback(() => {
    if (rows >= MAX_ROWS) return
    setModules(prev => {
      const curColor = prev[0]?.color || COLOR_OPTIONS[0]
      return [...prev, ...Array.from({ length: cols }, (_, c) => makeModule(rows, c, curColor, selectedHeightType))]
    })
  }, [rows, cols, selectedHeightType])

  const removeCol = useCallback(() => {
    if (cols <= 1) return
    setModules(prev => prev.filter(m => m.c !== cols - 1))
    setSelectedCell(s => ({ ...s, c: Math.min(s.c, cols - 2) }))
  }, [cols])

  const removeRow = useCallback(() => {
    if (rows <= 1) return
    setModules(prev => prev.filter(m => m.r !== rows - 1))
    setSelectedCell(s => ({ ...s, r: Math.min(s.r, rows - 2) }))
  }, [rows])

  // X버튼: 해당 모듈(셀) 제거 + 좌표 재정렬
  const removeModule = useCallback((r, c) => {
    if (modules.length <= 1) return
    const next = modules.filter(m => !(m.r === r && m.c === c))
    const uC = [...new Set(next.map(m => m.c))].sort((a, b) => a - b)
    const uR = [...new Set(next.map(m => m.r))].sort((a, b) => a - b)
    const reindexed = next.map(m => ({ ...m, c: uC.indexOf(m.c), r: uR.indexOf(m.r) }))
    setModules(reindexed)
    setSelectedCell(s => ({
      r: Math.min(s.r, Math.max(...reindexed.map(m => m.r))),
      c: Math.min(s.c, Math.max(...reindexed.map(m => m.c))),
    }))
  }, [modules])

  const updateSelected = useCallback((key, value) => {
    setModules(prev => prev.map(m =>
      m.r === selectedCell.r && m.c === selectedCell.c ? { ...m, [key]: value } : m
    ))
  }, [selectedCell])

  const applyAll = useCallback(() => {
    if (!selectedModule) return
    const { panelType, color } = selectedModule
    setModules(prev => prev.map(m => ({ ...m, panelType, color })))
  }, [selectedModule])

  // ── 가격 ──
  const totalModules = modules.length
  const modulePrice = MODULE_BASE_PRICE * totalModules
  const panelPrice = modules.reduce((acc, m) => {
    const pt = PANEL_TYPES.find(p => p.id === m.panelType)
    return acc + (pt?.pricePerSlot || 0)
  }, 0)
  const totalPrice = modulePrice + panelPrice + FRAME_CHROME_PRICE + (hasFootPad ? FOOT_PAD_PRICE : 0)

  // ── 주문 ──
  const handleOrder = () => {
    // Three.js canvas 실제 렌더 스크린샷 우선, 실패 시 2D 폴백
    let previewImg = ''
    try {
      if (glRef.current?.domElement) {
        glRef.current.render(glRef.current.scene, glRef.current.camera)
        previewImg = glRef.current.domElement.toDataURL('image/png')
      }
    } catch { /* noop */ }
    if (!previewImg) previewImg = generatePreviewDataUrl(modules, cols, rows)

    navigate('/charge', {
      state: {
        directBuyItem: {
          id: 'iloom-module-custom',
          name: `iloom Module 수납장 ${cols}×${rows}`,
          series: 'ILOOM MODULE',
          color: selectedModule?.color.label || COLOR_OPTIONS[0].label,
          price: String(totalPrice),
          qty: 1,
          productImages: [previewImg],
          config: { cols, rows, modules, totalModules },
        }
      }
    })
  }

  return (
    <div className="cfg-page">

      {/* ── 뷰어 (스크롤 트리거 영역) ── */}
      <div className="cfg-viewer-area" ref={viewerRef}>
        <div className="cfg-viewer-sticky">

          {/* 라벨 */}
          {scrollT < 0.5 && (
            <p className="cfg-viewer-label">FRONT VIEW</p>
          )}

          {/* Three.js 캔버스 */}
          <div className="cfg-canvas-wrap">
            <Canvas
              shadows
              dpr={[1, 2]}
              camera={{ fov: 55, near: 0.1, far: 100 }}
              gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; glRef.current = gl }} style={{ background: "#ffffff" }}
            >
              <Suspense fallback={null}>
                {/* 조명 — USM 파우더코팅 새틴광택 재현 */}
                <ambientLight intensity={0.55} />
                {/* 키라이트 */}
                <directionalLight
                  position={[4, 9, 5]}
                  intensity={0.1}
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                  shadow-camera-near={0.1}
                  shadow-camera-far={40}
                  shadow-camera-left={-5}
                  shadow-camera-right={5}
                  shadow-camera-top={5}
                  shadow-camera-bottom={-5}
                />
                <directionalLight position={[-4, 3, -3]} intensity={0.3} color="#e8f0ff" />
                <directionalLight position={[0, -2, 4]} intensity={0.3} color="#fff8f0" />
                <pointLight position={[2, 4, 3]} intensity={0.1} />

                <Environment preset="studio" environmentIntensity={0.3} />

                {/* 바닥 그림자 */}
                <ContactShadows
                  position={[0, -0.01, 0]}
                  opacity={0.14}
                  scale={14}
                  blur={3}
                  far={1}
                />

                {/* 가구 */}
                <FurnitureScene
                  modules={modules}
                  cols={cols}
                  rows={rows}
                  selectedCell={selectedCell}
                  hoveredCell={hoveredCell}
                  onSelectCell={setSelectedCell}
                  onHoverCell={setHoveredCell}
                  onRemoveModule={removeModule}
                  onAddCol={addCol}
                  onAddRow={addRow}
                  canAddCol={cols < MAX_COLS}
                  canAddRow={rows < MAX_ROWS}
                  hasFootPad={hasFootPad}
                />

                {/* 스크롤 카메라 */}
                <ScrollCamera scrollT={scrollT} cols={cols} rows={rows} modules={modules} />
              </Suspense>
            </Canvas>

            {/* 화살표는 Three.js 씬 내부 Html 컴포넌트로 렌더링 */}

            {/* 스크롤 힌트 */}
            <div className={`cfg-scroll-hint ${scrollT > 0.05 ? 'hidden' : ''}`}>
              <span>스크롤하여 3D로 전환</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polyline points="3,5 8,11 13,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* 뷰 전환 인디케이터 */}
          <div className="cfg-view-indicator">
            <div className="cfg-view-indicator__bar">
              <div className="cfg-view-indicator__fill" style={{ width: `${scrollT * 100}%` }} />
            </div>
          </div>
        </div>

        {/* 스크롤 공간 */}
        <div className="cfg-scroll-spacer" />
      </div>

      {/* ── 사이드바 ── */}
      <aside className="cfg-sidebar">
        <div className="cfg-sidebar__top">
          <p className="cfg-sidebar__brand">ILOOM MODULE</p>
          <h2 className="cfg-sidebar__title">Configurator</h2>
        </div>

        {/* 모듈 구성 */}
        <section className="cfg-section">
          <h3 className="cfg-section__label">모듈 구성</h3>
          <div className="cfg-grid-control">
            <div className="cfg-grid-control__row">
              <span>가로 (열)</span>
              <div className="cfg-stepper">
                <button onClick={removeCol} disabled={cols <= 1}>−</button>
                <span>{cols}</span>
                <button onClick={addCol} disabled={cols >= MAX_COLS}>+</button>
              </div>
            </div>
            <div className="cfg-grid-control__row">
              <span>세로 (행)</span>
              <div className="cfg-stepper">
                <button onClick={removeRow} disabled={rows <= 1}>−</button>
                <span>{rows}</span>
                <button onClick={addRow} disabled={rows >= MAX_ROWS}>+</button>
              </div>
            </div>
            <p className="cfg-grid-control__hint">캔버스 화살표로도 확장 가능 · 모듈 클릭으로 선택</p>
          </div>
        </section>

        {/* 추가 모듈 높이 타입 */}
        <section className="cfg-section">
          <h3 className="cfg-section__label">추가 모듈 높이</h3>
          <div className="cfg-height-btns">
            <button
              className={`cfg-height-btn ${selectedHeightType === 'full' ? 'active' : ''}`}
              onClick={() => setSelectedHeightType('full')}
            >
              <span className="cfg-height-btn__bar cfg-height-btn__bar--full" />
              <span>표준</span>
            </button>
            <button
              className={`cfg-height-btn ${selectedHeightType === 'half' ? 'active' : ''}`}
              onClick={() => setSelectedHeightType('half')}
            >
              <span className="cfg-height-btn__bar cfg-height-btn__bar--half" />
              <span>슬림 1/2</span>
            </button>
          </div>
          <p className="cfg-grid-control__hint">↑ 화살표로 행 추가 시 이 높이로 추가됩니다</p>
        </section>

        {/* 선택 모듈 옵션 */}
        <section className="cfg-section">
          <div className="cfg-section__label-row">
            <h3 className="cfg-section__label">선택 모듈 옵션</h3>
            {selectedModule && (
              <span className="cfg-section__cell-tag">
                {selectedCell.c + 1}열 {selectedCell.r + 1}행
              </span>
            )}
          </div>

          <div className="cfg-panel-list">
            {PANEL_TYPES.map(p => (
              <button
                key={p.id}
                className={`cfg-panel-btn ${selectedModule?.panelType === p.id ? 'active' : ''}`}
                onClick={() => updateSelected('panelType', p.id)}
              >
                <span className="cfg-panel-btn__name">{p.label}</span>
                <span className="cfg-panel-btn__price">
                  {p.pricePerSlot === 0 ? '무료' : `+${p.pricePerSlot.toLocaleString()}원`}
                </span>
              </button>
            ))}
          </div>

          <div className="cfg-color-block">
            <p className="cfg-color-block__title">패널 색상</p>
            <div className="cfg-color-grid">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  className={`cfg-color-swatch ${selectedModule?.color.id === c.id ? 'active' : ''}`}
                  style={{ '--swatch': c.hex }}
                  onClick={() => setModules(prev => prev.map(m => ({ ...m, color: c })))}
                  title={c.label}
                />
              ))}
            </div>
            <p className="cfg-color-name">{selectedModule?.color.label}</p>
          </div>

          <div className="cfg-apply-all">
            <button onClick={applyAll}>전체 모듈에 적용</button>
          </div>
        </section>

        {/* 프레임 */}
        <section className="cfg-section">
          <h3 className="cfg-section__label">프레임</h3>
          <div className="cfg-frame-badge">
            <span className="cfg-frame-badge__dot" />
            Chrome (고광택 크롬)
          </div>
          <div className="cfg-foot-pad">
            <label className="cfg-foot-pad__label">
              <input
                type="checkbox"
                checked={hasFootPad}
                onChange={e => setHasFootPad(e.target.checked)}
              />
              <span>고무 발 패드 추가</span>
              <span className="cfg-foot-pad__price">+{FOOT_PAD_PRICE.toLocaleString()}원</span>
            </label>
            <p className="cfg-foot-pad__desc">바닥 긁힘 방지 · 미끄럼 방지</p>
          </div>
        </section>

        {/* 가격 */}
        <div className="cfg-summary">
          <div className="cfg-summary__row">
            <span>모듈 ({totalModules}개)</span>
            <span>{fmt(modulePrice)}</span>
          </div>
          <div className="cfg-summary__row">
            <span>도어 옵션</span>
            <span>{fmt(panelPrice)}</span>
          </div>
          <div className="cfg-summary__row">
            <span>크롬 프레임</span>
            <span>{fmt(FRAME_CHROME_PRICE)}</span>
          </div>
          {hasFootPad && (
            <div className="cfg-summary__row">
              <span>고무 발 패드</span>
              <span>{fmt(FOOT_PAD_PRICE)}</span>
            </div>
          )}
          <div className="cfg-summary__total">
            <span>합계</span>
            <strong>{fmt(totalPrice)}</strong>
          </div>
        </div>

        <button className="cfg-order-btn" onClick={handleOrder}>주문하기</button>
      </aside>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
//  스크롤 드리븐 카메라
// ────────────────────────────────────────────────────────────
function ScrollCamera({ scrollT, cols, rows, modules }) {
  const { camera } = useThree()
  const tRef = useRef(0)

  useFrame(() => {
    // 부드럽게 lerp
    tRef.current += (scrollT - tRef.current) * 0.07

    const t = tRef.current
    const { front, iso, target } = getCameraPositions(cols, rows, modules)

    // easeInOutCubic
    const ease = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2

    camera.position.lerpVectors(front, iso, ease)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
  })

  return null
}

// ────────────────────────────────────────────────────────────
//  가구 씬
// ────────────────────────────────────────────────────────────

// PBR 머테리얼 캐시
const matCache = new Map()

function getChromeMat() {
  if (!matCache.has('chrome')) {
    matCache.set('chrome', new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.92, 0.92, 0.92),
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2.2,
      reflectivity: 1.0,
    }))
  }
  return matCache.get('chrome')
}

function getPanelMat(color, panelType) {
  const key = `${color.id}-${panelType}`
  if (!matCache.has(key)) {
    const c = new THREE.Color()
    c.setStyle(color.hex)          // sRGB hex → linear 자동변환
    matCache.set(key, new THREE.MeshPhysicalMaterial({
      color: c,
      metalness: 0.0,
      roughness: 0.42,
      clearcoat: 0.28,
      clearcoatRoughness: 0.25,
      envMapIntensity: 0.9,
      reflectivity: 0.3,
    }))
  }
  return matCache.get(key)
}

function getKnobMat() {
  if (!matCache.has('knob')) {
    matCache.set('knob', new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.90, 0.90, 0.90),
      metalness: 1.0,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.5,
      reflectivity: 1.0,
    }))
  }
  return matCache.get('knob')
}

function getHoverMat() {
  if (!matCache.has('hover')) {
    matCache.set('hover', new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.23, 0.50, 0.92),
      metalness: 0.04,
      roughness: 0.4,
      transparent: true,
      opacity: 0.10,
    }))
  }
  return matCache.get('hover')
}

function getSelectMat() {
  if (!matCache.has('select')) {
    matCache.set('select', new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.23, 0.50, 0.92),
      metalness: 0.04,
      roughness: 0.4,
      transparent: true,
      opacity: 0.16,
    }))
  }
  return matCache.get('select')
}

// ── 기하 캐시 ──
const geomCache = {}
function getTubeGeom(r, h) {
  const k = `tube-${r}-${h}`
  if (!geomCache[k]) geomCache[k] = new THREE.CylinderGeometry(r, r, h, 14, 1)
  return geomCache[k]
}
function getSphereGeom(r) {
  const k = `sphere-${r}`
  if (!geomCache[k]) geomCache[k] = new THREE.SphereGeometry(r, 16, 16)
  return geomCache[k]
}
function getPanelGeom(w, h, d) {
  const k = `panel-${w}-${h}-${d}`
  if (!geomCache[k]) geomCache[k] = new THREE.BoxGeometry(w, h, d)
  return geomCache[k]
}
function getKnobGeom() {
  if (!geomCache['knob']) geomCache['knob'] = new THREE.SphereGeometry(0.028, 16, 16)
  return geomCache['knob']
}

function FurnitureScene({
  modules, cols, rows,
  selectedCell, hoveredCell,
  onSelectCell, onHoverCell, onRemoveModule,
  onAddCol, onAddRow, canAddCol, canAddRow,
  hasFootPad,
}) {
  // 전체 가구를 중앙 정렬
  const totalW = cols * (MW + FT * 2) + FT * 2
  // 각 행 실제 높이 계산
  const rowHeights = Array.from({ length: rows }, (_, r) => {
    const m = modules.find(mod => mod.r === r)
    return getMH(m?.heightType || 'full')
  })
  const totalH = rowHeights.reduce((s, h) => s + h + FT * 2, FT * 2)
  const offsetX = -totalW / 2
  const offsetY = 0   // 하단 기준, y=0에서 위로

  return (
    <group position={[offsetX, offsetY, 0]}>
      {/* 모듈들 */}
      {modules.map(m => {
        // 이 모듈 행의 y 시작점 (FT + 이전 행들 높이 합)
        let yOff = FT
        for (let pr = 0; pr < m.r; pr++) {
          const pm = modules.find(mod => mod.r === pr && mod.c === 0)
          yOff += getMH(pm?.heightType || 'full') + FT * 2
        }
        return (
          <Module
            key={`m-${m.r}-${m.c}`}
            module={m}
            cols={cols}
            rows={rows}
            isSelected={selectedCell.r === m.r && selectedCell.c === m.c}
            isHovered={hoveredCell?.r === m.r && hoveredCell?.c === m.c}
            onSelect={() => onSelectCell({ r: m.r, c: m.c })}
            onHover={(v) => onHoverCell(v ? { r: m.r, c: m.c } : null)}
            onRemove={() => onRemoveModule(m.r, m.c)}
            canRemove={modules.length > 1}
            yOffset={yOff}
          />
        )
      })}

      {/* 프레임 파이프 + 조인트 */}
      <FrameStructure modules={modules} cols={cols} rows={rows} rowHeights={rowHeights} />

      {/* 다리 (4 모서리) */}
      <Legs cols={cols} hasFootPad={hasFootPad} />

      {/* ── 씬 내부 화살표 (오브젝트 바로 옆/위) ── */}
      <SceneArrows
        cols={cols} rows={rows}
        onAddCol={onAddCol} onAddRow={onAddRow}
        canAddCol={canAddCol} canAddRow={canAddRow}
        rowHeights={rowHeights}
      />
    </group>
  )
}

// 씬 좌표 기준 Html 화살표
function SceneArrows({ cols, rows, onAddCol, onAddRow, canAddCol, canAddRow, rowHeights }) {
  // group 이미 offset 적용됨 → 로컬좌표: (0,0)=좌하단, (totalW, totalH)=우상단
  const totalW = cols * (MW + FT * 2) + FT * 2
  // rowHeights 없으면 폴백
  const totalH = rowHeights
    ? rowHeights.reduce((s, h) => s + h + FT * 2, FT * 2)
    : rows * (MH_FULL + FT * 2) + FT * 2
  const midX = totalW / 2
  const midY = totalH / 2

  const btnStyle = {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(17,17,17,0.75)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    transition: 'background 0.15s',
  }

  return (
    <>
      {/* 우측 화살표 (열 추가) */}
      {canAddCol && (
        <Html position={[totalW + 0.14, midY, MD / 2]} center occlude={false} zIndexRange={[10, 20]}>
          <button style={btnStyle} onClick={onAddCol} title="열 추가">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <polyline points="4,2 10,7 4,12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Html>
      )}

      {/* 좌측 화살표 (열 추가, 반대쪽) — 없음 */}

      {/* 위쪽 화살표 (행 추가) */}
      {canAddRow && (
        <Html position={[midX, totalH + 0.14, MD / 2]} center occlude={false} zIndexRange={[10, 20]}>
          <button style={btnStyle} onClick={onAddRow} title="행 추가">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <polyline points="2,10 7,4 12,10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Html>
      )}
    </>
  )
}

// ── 개별 모듈 ──
function Module({ module, cols, rows, isSelected, isHovered, onSelect, onHover, onRemove, canRemove, yOffset }) {
  const { r, c, panelType, color, heightType = 'full' } = module
  const mh = getMH(heightType)
  const x = c * (MW + FT * 2) + FT
  const y = yOffset  // 행별 누적 y (FurnitureScene에서 계산해서 전달)

  const PT = 0.018   // panel thickness
  const PI = 0.010   // panel inset from frame

  // 앞면용 머테리얼
  const frontMat = useMemo(() => getPanelMat(color, panelType), [color, panelType])
  // 나머지 5면용 머테리얼 (같은 색, 약간 어둡게)
  const sideMat = useMemo(() => {
    const base = new THREE.Color()
    base.setStyle(color.hex)
    base.multiplyScalar(0.88)
    return new THREE.MeshPhysicalMaterial({
      color: base,
      metalness: 0.0,
      roughness: 0.46,
      clearcoat: 0.20,
      clearcoatRoughness: 0.30,
      envMapIntensity: 0.7,
    })
  }, [color])

  const iW = MW - PI * 2
  const iH = mh - PI * 2
  const iD = MD - PI * 2

  const evts = {
    onClick: e => { e.stopPropagation(); onSelect() },
    onPointerEnter: e => { e.stopPropagation(); onHover(true) },
    onPointerLeave: e => { e.stopPropagation(); onHover(false) },
  }

  return (
    <group position={[x + MW / 2, y + mh / 2, 0]}>

      {/* ── 앞면 ── */}
      {panelType !== 'none' ? (
        <mesh castShadow receiveShadow material={frontMat}
          geometry={getPanelGeom(iW, iH, PT)}
          position={[0, 0, MD / 2 - PT / 2 + 0.001]}
          {...evts}
        />
      ) : (
        // none: invisible hit area
        <mesh visible={false} geometry={getPanelGeom(iW, iH, PT)}
          position={[0, 0, MD / 2 - PT / 2 + 0.001]} {...evts} />
      )}

      {/* ── 뒷면 ── */}
      <mesh castShadow receiveShadow material={sideMat}
        geometry={getPanelGeom(iW, iH, PT)}
        position={[0, 0, -(MD / 2 - PT / 2 + 0.001)]}
        {...evts}
      />

      {/* ── 좌측면 ── */}
      <mesh castShadow receiveShadow material={sideMat}
        geometry={getPanelGeom(PT, iH, iD)}
        position={[-(MW / 2 - PT / 2 + 0.001), 0, 0]}
        {...evts}
      />

      {/* ── 우측면 ── */}
      <mesh castShadow receiveShadow material={sideMat}
        geometry={getPanelGeom(PT, iH, iD)}
        position={[MW / 2 - PT / 2 + 0.001, 0, 0]}
        {...evts}
      />

      {/* ── 상단면 ── */}
      <mesh castShadow receiveShadow material={sideMat}
        geometry={getPanelGeom(iW, PT, iD)}
        position={[0, mh / 2 - PT / 2 + 0.001, 0]}
        {...evts}
      />

      {/* ── 하단면 ── */}
      <mesh castShadow receiveShadow material={sideMat}
        geometry={getPanelGeom(iW, PT, iD)}
        position={[0, -(mh / 2 - PT / 2 + 0.001), 0]}
        {...evts}
      />

      {/* ── 선택/호버 오버레이 (앞면) ── */}
      {(isSelected || isHovered) && (
        <mesh
          geometry={getPanelGeom(iW, iH, PT + 0.002)}
          position={[0, 0, MD / 2 - PT / 2 + 0.004]}
          material={isSelected ? getSelectMat() : getHoverMat()}
        />
      )}

      {/* ── 손잡이 (폴딩도어) ── */}
      {panelType === 'folding' && (
        <mesh castShadow geometry={getKnobGeom()} material={getKnobMat()}
          position={[0, 0, MD / 2 + 0.013]}
        />
      )}

      {/* ── X 버튼 ── */}
      {isHovered && canRemove && (
        <RemoveButton
          position={[MW / 2 - 0.04, mh / 2 - 0.04, MD / 2 + 0.02]}
          onRemove={onRemove}
        />
      )}
    </group>
  )
}

// ── X 제거 버튼 (Html CSS) ──
function RemoveButton({ position, onRemove }) {
  return (
    <Html position={position} center occlude={false} zIndexRange={[20, 30]}>
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        style={{
          width: 22, height: 22,
          borderRadius: '50%',
          background: 'rgba(17,17,17,0.82)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          lineHeight: 1,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </Html>
  )
}

// ── 다리 컴포넌트 ──
const LEG_H = 0.06
const LEG_R = FT * 1.1
const PAD_H = 0.014
const PAD_R = FT * 1.6

function Legs({ cols, hasFootPad }) {
  const chromeMat = getChromeMat()
  const rubberMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.08, 0.08, 0.08),
    metalness: 0.0,
    roughness: 0.95,
  }), [])

  const legXs = [
    FT,                           // 좌
    cols * (MW + FT * 2) + FT,    // 우
  ]
  const legZs = [-MD / 2 + FT, MD / 2 - FT]

  return (
    <group position={[0, -LEG_H, 0]}>
      {legXs.map(lx =>
        legZs.map(lz => (
          <group key={`leg-${lx}-${lz}`} position={[lx, LEG_H / 2, lz]}>
            {/* 크롬 파이프 */}
            <mesh castShadow geometry={getTubeGeom(LEG_R, LEG_H)} material={chromeMat} />
            {/* 고무 발 */}
            {hasFootPad && (
              <mesh castShadow geometry={getTubeGeom(PAD_R, PAD_H)} material={rubberMat}
                position={[0, -(LEG_H / 2 + PAD_H / 2), 0]} />
            )}
            {/* 발 없을 때 크롬 캡 */}
            {!hasFootPad && (
              <mesh castShadow material={chromeMat}
                position={[0, -LEG_H / 2, 0]}>
                <cylinderGeometry args={[LEG_R * 1.3, LEG_R, PAD_H * 0.5, 14]} />
              </mesh>
            )}
          </group>
        ))
      )}
    </group>
  )
}

// ── 프레임 구조 (파이프 + 조인트) ──
// 각 row의 실제 높이를 반영해 파이프/조인트를 정확한 Y에 배치
function FrameStructure({ modules, cols, rows, rowHeights }) {
  const chromeMat = getChromeMat()

  // row 인덱스 → 실제 Y 좌표 (파이프 교차점)
  const nodeYArr = useMemo(() => {
    const arr = [0]  // row=0의 바닥 Y
    for (let r = 0; r < rows; r++) {
      const pm = modules.find(m => m.r === r && m.c === 0)
      const mh = getMH(pm?.heightType || 'full')
      arr.push(arr[r] + mh + FT * 2)
    }
    return arr  // arr[r] = row r의 하단 Y, arr[r+1] = 상단 Y
  }, [modules, rows])

  const nodeX = (c) => c * (MW + FT * 2)
  const nodeY = (r) => nodeYArr[r] ?? 0

  // 존재하는 노드 (r,c) 집합
  const nodeSet = useMemo(() => {
    const s = new Set()
    modules.forEach(({ r, c }) => {
      for (let dr = 0; dr <= 1; dr++)
        for (let dc = 0; dc <= 1; dc++)
          s.add(`${r + dr},${c + dc}`)
    })
    return s
  }, [modules])
  const hasNode = (r, c) => nodeSet.has(`${r},${c}`)

  // 수평 파이프
  const hPipes = useMemo(() => {
    const pipes = []
    for (let r = 0; r <= rows; r++)
      for (let c = 0; c < cols; c++)
        if (hasNode(r, c) && hasNode(r, c + 1))
          pipes.push({ r, c })
    return pipes
  }, [modules, rows, cols, nodeSet])

  // 수직 파이프 — 각 row의 실제 높이로 len 계산
  const vPipes = useMemo(() => {
    const pipes = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c <= cols; c++)
        if (hasNode(r, c) && hasNode(r + 1, c)) {
          const pm = modules.find(m => m.r === r && m.c === 0)
          const mh = getMH(pm?.heightType || 'full')
          pipes.push({ r, c, len: mh + FT * 2 })
        }
    return pipes
  }, [modules, rows, cols, nodeSet])

  // 전후 파이프 (Z축)
  const dPipes = useMemo(() => {
    const arr = []
    nodeSet.forEach(key => {
      const [r, c] = key.split(',').map(Number)
      arr.push({ r, c })
    })
    return arr
  }, [nodeSet])

  const joints = useMemo(() =>
    [...nodeSet].map(k => { const [r, c] = k.split(',').map(Number); return { r, c } }),
    [nodeSet]
  )

  return (
    <group>
      {/* 수평 파이프 */}
      {hPipes.map(({ r, c }) => {
        const len = MW + FT * 2
        const x = nodeX(c) + len / 2
        return (
          <group key={`hp-${r}-${c}`}>
            {/* 앞 */}
            <mesh castShadow geometry={getTubeGeom(FT, len)} material={chromeMat}
              position={[x, nodeY(r), MD / 2]} rotation={[0, 0, Math.PI / 2]} />
            {/* 뒤 */}
            <mesh castShadow geometry={getTubeGeom(FT, len)} material={chromeMat}
              position={[x, nodeY(r), -MD / 2]} rotation={[0, 0, Math.PI / 2]} />
          </group>
        )
      })}

      {/* 수직 파이프 — 각 row 실제 높이로 */}
      {vPipes.map(({ r, c, len }) => {
        const y = nodeY(r) + len / 2
        return (
          <group key={`vp-${r}-${c}`}>
            <mesh castShadow geometry={getTubeGeom(FT, len)} material={chromeMat}
              position={[nodeX(c), y, MD / 2]} />
            <mesh castShadow geometry={getTubeGeom(FT, len)} material={chromeMat}
              position={[nodeX(c), y, -MD / 2]} />
          </group>
        )
      })}

      {/* 전후 파이프 */}
      {dPipes.map(({ r, c }) => (
        <mesh
          key={`dp-${r}-${c}`}
          castShadow
          geometry={getTubeGeom(FT, MD)}
          material={chromeMat}
          position={[nodeX(c), nodeY(r), 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}

      {/* 조인트 구 — 앞 / 뒤 */}
      {joints.map(({ r, c }) => (
        <group key={`j-${r}-${c}`}>
          <mesh castShadow geometry={getSphereGeom(JR)} material={chromeMat}
            position={[nodeX(c), nodeY(r), MD / 2]} />
          <mesh castShadow geometry={getSphereGeom(JR)} material={chromeMat}
            position={[nodeX(c), nodeY(r), -MD / 2]} />
        </group>
      ))}
    </group>
  )
}

// ────────────────────────────────────────────────────────────
//  Charge 썸네일 생성 (canvas 2D)
// ────────────────────────────────────────────────────────────
function generatePreviewDataUrl(modules, cols, rows) {
  try {
    const W2 = 190, H2 = 118, PIPE2 = 7, PAD2 = 20
    const cW = cols * (W2 + PIPE2) + PIPE2 + PAD2 * 2
    const cH = rows * (H2 + PIPE2) + PIPE2 + PAD2 * 2 + 20
    const canvas = document.createElement('canvas')
    canvas.width = cW * 1.5; canvas.height = cH * 1.5
    const ctx = canvas.getContext('2d')
    const s = 1.5
    ctx.fillStyle = '#EDEAE4'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    modules.forEach(m => {
      if (m.panelType === 'none') return
      ctx.fillStyle = m.color.hex; ctx.globalAlpha = 0.88
      ctx.fillRect((PAD2 + m.c * (W2 + PIPE2) + PIPE2) * s, (PAD2 + m.r * (H2 + PIPE2) + PIPE2) * s, W2 * s, H2 * s)
    })
    ctx.globalAlpha = 1; ctx.fillStyle = '#CCCCCC'
    for (let c = 0; c <= cols; c++) ctx.fillRect((PAD2 + c * (W2 + PIPE2)) * s, PAD2 * s, PIPE2 * s, (rows * (H2 + PIPE2) + PIPE2) * s)
    for (let r = 0; r <= rows; r++) ctx.fillRect(PAD2 * s, (PAD2 + r * (H2 + PIPE2)) * s, (cols * (W2 + PIPE2) + PIPE2) * s, PIPE2 * s)
    return canvas.toDataURL('image/png')
  } catch { return '' }
}
