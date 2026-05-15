import { useState, useMemo, useCallback, useRef, useEffect, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import './scss/configurator.scss'

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
  { id: 'none', label: '없음 (오픈)', pricePerSlot: 0 },
  { id: 'panel', label: '패널 (고정)', pricePerSlot: 89000 },
  { id: 'folding', label: '폴딩 도어', pricePerSlot: 139000 },
  { id: 'dropdown', label: '드롭다운 도어', pricePerSlot: 159000 },
  { id: 'sliding', label: '슬라이딩 도어', pricePerSlot: 179000 },
  { id: 'glass', label: '글라스 도어', pricePerSlot: 199000 },
]

const FRAME_COLORS = [
  { id: 'chrome', label: '크롬', hex: '#D4D4D4', price: 0 },
  { id: 'black', label: '매트 블랙', hex: '#1A1A1A', price: 30000 },
]

const FOOT_TYPES = [
  { id: 'chrome', label: '크롬 캡', price: 0 },
  { id: 'rubber', label: '고무 발패드', price: 15000 },
  { id: 'caster', label: '캐스터 (바퀴)', price: 45000 },
]

const MODULE_BASE_PRICE = 420000
const FRAME_BASE_PRICE = 80000
const FOOT_PAD_PRICE = 15000
const MAX_COLS = 5
const MAX_ROWS = 4

const MW = 0.92
const MH_FULL = 0.55
const MH_HALF = 0.275
const MD = 0.46
const FT = 0.015
const JR = 0.024

const getMH = (_ht) => MH_FULL
const MH = MH_FULL

const makeModule = (r, c, color = COLOR_OPTIONS[0], heightType = 'full') => ({
  r, c,
  panelType: 'folding',
  color,
  heightType,
  accessory: 'none',
})

const fmt = (n) => n.toLocaleString('ko-KR') + '원'

function getCameraPositions(cols, rows, modules) {
  const objW = cols * (MW + FT * 2)
  let objH = FT * 2
  for (let r = 0; r < rows; r++) {
    const rowMod = modules?.find(m => m.r === r)
    const mh = getMH(rowMod?.heightType || 'full')
    objH += mh + FT * 2
  }
  const midY = objH / 2
  const objMax = Math.max(objW, objH)
  const rowBonus = Math.max(0, rows - 1) * 0.22
  const dist = objMax * 0.88 + 0.7 + rowBonus

  return {
    front: new THREE.Vector3(0, midY, dist * 0.95),
    iso: new THREE.Vector3(dist * 0.55, midY + dist * 0.18, dist * 0.6),
    target: new THREE.Vector3(0, midY, 0),
  }
}

export default function Configurator() {
  const navigate = useNavigate()
  const viewerRef = useRef(null)
  const glRef = useRef(null)

  // ── 히스토리 관리 ──
  const [history, setHistory] = useState([[makeModule(0, 0)]])
  const [historyIdx, setHistoryIdx] = useState(0)
  const historyIdxRef = useRef(0)
  const historyRef = useRef([[makeModule(0, 0)]])

  const modules = history[historyIdx]

  const setModules = useCallback((updater) => {
    const idx = historyIdxRef.current
    const currentModules = historyRef.current[idx]
    const next = typeof updater === 'function' ? updater(currentModules) : updater
    const newHistory = [...historyRef.current.slice(0, idx + 1), next]
    historyRef.current = newHistory
    historyIdxRef.current = idx + 1
    setHistory(newHistory)
    setHistoryIdx(idx + 1)
  }, [])

  const undo = useCallback(() => {
    const idx = Math.max(0, historyIdxRef.current - 1)
    historyIdxRef.current = idx
    setHistoryIdx(idx)
  }, [])

  const redo = useCallback(() => {
    const idx = Math.min(historyRef.current.length - 1, historyIdxRef.current + 1)
    historyIdxRef.current = idx
    setHistoryIdx(idx)
  }, [])

  const canUndo = historyIdx > 0
  const canRedo = historyIdx < history.length - 1

  const [selectedCell, setSelectedCell] = useState({ r: 0, c: 0 })
  const [selectedHeightType, setSelectedHeightType] = useState('full')
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0])
  const [footType, setFootType] = useState(FOOT_TYPES[0])
  const [scrollT, setScrollT] = useState(0)
  const [hoveredCell, setHoveredCell] = useState(null)

  const cols = useMemo(() => Math.max(...modules.map(m => m.c)) + 1, [modules])
  const rows = useMemo(() => Math.max(...modules.map(m => m.r)) + 1, [modules])
  const selectedModule = useMemo(
    () => modules.find(m => m.r === selectedCell.r && m.c === selectedCell.c),
    [modules, selectedCell]
  )

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const h = el.offsetHeight
      const raw = Math.max(0, -rect.top) / (h * 0.6)
      setScrollT(Math.min(1, raw))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    setHistory(prev => {
      const currentModules = prev[historyIdx]
      const next = currentModules.map(m =>
        m.r === selectedCell.r && m.c === selectedCell.c ? { ...m, [key]: value } : m
      )
      return [...prev.slice(0, historyIdx + 1), next]
    })
    setHistoryIdx(prev => prev + 1)
  }, [selectedCell, historyIdx])

  const applyAll = useCallback(() => {
    if (!selectedModule) return
    const { panelType, color } = selectedModule
    setModules(prev => prev.map(m => ({ ...m, panelType, color })))
  }, [selectedModule])

  const totalModules = modules.length
  const modulePrice = MODULE_BASE_PRICE * totalModules
  const panelPrice = modules.reduce((acc, m) => {
    const pt = PANEL_TYPES.find(p => p.id === m.panelType)
    return acc + (pt?.pricePerSlot || 0)
  }, 0)
  const accessoryPrice = 0
  const frameColorPrice = frameColor?.price || 0
  const footPrice = footType?.price || 0
  const totalPrice = modulePrice + panelPrice + accessoryPrice + FRAME_BASE_PRICE + frameColorPrice + footPrice

  const handleOrder = () => {
    let previewImg = ''
    try {
      if (glRef.current?.domElement) {
        previewImg = glRef.current.domElement.toDataURL('image/png')
      }
    } catch { }
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
          _custom: true,
          config: { cols, rows, modules, totalModules },
        }
      }
    })
  }

  return (
    <div className="cfg-page">
      <div className="cfg-viewer-area" ref={viewerRef}>
        <div className="cfg-viewer-sticky">
          <p className="cfg-viewer-label">
            {scrollT < 0.4 ? 'FRONT VIEW' : 'ISOMETRIC VIEW'}
          </p>
          <div className="cfg-canvas-wrap">
            <Canvas
              shadows
              dpr={[1, 2]}
              camera={{ fov: 55, near: 0.1, far: 100 }}
              gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
              onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; glRef.current = gl }}
              style={{ background: "#ffffff" }}
            >
              <Suspense fallback={null}>
                <ambientLight intensity={0.55} />
                <directionalLight
                  position={[4, 9, 5]}
                  intensity={1}
                  castShadow
                  shadow-mapSize={[2048, 2048]}
                  shadow-camera-near={0.1}
                  shadow-camera-far={40}
                  shadow-camera-left={-5}
                  shadow-camera-right={5}
                  shadow-camera-top={5}
                  shadow-camera-bottom={-5}
                />
                <directionalLight position={[-4, 3, -3]} intensity={0.2} color="#e8f0ff" />
                <directionalLight position={[0, -2, 4]} intensity={0.1} color="#fff8f0" />
                <pointLight position={[2, 4, 3]} intensity={0.05} />
                <Environment preset="studio" environmentIntensity={0.3} />
                <ContactShadows position={[0, -0.01, 0]} opacity={0.14} scale={14} blur={3} far={1} />
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
                  frameColor={frameColor}
                  footType={footType}
                  scrollT={scrollT}
                />
                <ScrollCamera scrollT={scrollT} cols={cols} rows={rows} modules={modules} />
              </Suspense>
            </Canvas>
            <div className={`cfg-scroll-hint ${scrollT > 0.05 ? 'hidden' : ''}`}>
              <span>스크롤하여 조립하기</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polyline points="3,5 8,11 13,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="cfg-view-indicator">
            <div className="cfg-view-indicator__bar">
              <div className="cfg-view-indicator__fill" style={{ width: `${scrollT * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="cfg-scroll-spacer" />
      </div>

      <aside className="cfg-sidebar">
        <div className="cfg-sidebar__top">
          <p className="cfg-sidebar__brand">ILOOM MODULE</p>
          <h2 className="cfg-sidebar__title">Configurator</h2>
        </div>

        {/* ── 이전/다음 버튼 ── */}
        <div className="cfg-history-btns">
          <button className="cfg-history-btn" onClick={undo} disabled={!canUndo}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="9,2 4,7 9,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            이전
          </button>
          <button className="cfg-history-btn" onClick={redo} disabled={!canRedo}>
            다음
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="5,2 10,7 5,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

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

        <section className="cfg-section">
          <h3 className="cfg-section__label">프레임 색상</h3>
          <div className="cfg-frame-colors">
            {FRAME_COLORS.map(fc => (
              <button
                key={fc.id}
                className={`cfg-frame-color-btn ${frameColor.id === fc.id ? 'active' : ''}`}
                onClick={() => { matCache.delete(`frame-${fc.id}`); setFrameColor(fc) }}
              >
                <span className="cfg-frame-color-btn__dot" style={{ background: fc.hex }} />
                <span>{fc.label}</span>
                <span className="cfg-frame-color-btn__price">
                  {fc.price === 0 ? '' : `+${fc.price.toLocaleString()}원`}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="cfg-section">
          <h3 className="cfg-section__label">바닥 마감</h3>
          <div className="cfg-foot-types">
            {FOOT_TYPES.map(ft => (
              <button
                key={ft.id}
                className={`cfg-foot-btn ${footType.id === ft.id ? 'active' : ''}`}
                onClick={() => setFootType(ft)}
              >
                <span>{ft.label}</span>
                <span className="cfg-foot-btn__price">
                  {ft.price === 0 ? '기본' : `+${ft.price.toLocaleString()}원`}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="cfg-summary">
          <div className="cfg-summary__row">
            <span>모듈 ({totalModules}개)</span>
            <span>{fmt(modulePrice)}</span>
          </div>
          {panelPrice > 0 && (
            <div className="cfg-summary__row">
              <span>도어 옵션</span>
              <span>{fmt(panelPrice)}</span>
            </div>
          )}
          <div className="cfg-summary__row">
            <span>프레임 ({frameColor.label})</span>
            <span>{fmt(FRAME_BASE_PRICE + frameColorPrice)}</span>
          </div>
          {footPrice > 0 && (
            <div className="cfg-summary__row">
              <span>바닥 마감 ({footType.label})</span>
              <span>{fmt(footPrice)}</span>
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

// ── 아래 함수들은 기존 코드 그대로 ──
function ScrollCamera({ scrollT, cols, rows, modules }) {
  const { camera } = useThree()
  const tRef = useRef(0)

  useFrame(() => {
    tRef.current += (scrollT - tRef.current) * 0.07
    const t = tRef.current
    const { front, iso, target } = getCameraPositions(cols, rows, modules)
    const ease = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2
    camera.position.lerpVectors(front, iso, ease)
    camera.lookAt(target)
    camera.updateProjectionMatrix()
  })

  return null
}

const matCache = new Map()

function getFrameMat(frameColor) {
  const key = `frame-${frameColor?.id || 'chrome'}`
  if (!matCache.has(key)) {
    const fc = frameColor || FRAME_COLORS[0]
    const c = new THREE.Color(); c.setStyle(fc.hex)
    const isChrome = fc.id === 'chrome'
    matCache.set(key, new THREE.MeshPhysicalMaterial({
      color: c,
      metalness: isChrome ? 1.0 : 0.7,
      roughness: isChrome ? 0.05 : 0.22,
      envMapIntensity: isChrome ? 2.2 : 1.2,
      reflectivity: 1.0,
    }))
  }
  return matCache.get(key)
}

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
    c.setStyle(color.hex)
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
  const k = `panel-${w.toFixed(4)}-${h.toFixed(4)}-${d.toFixed(4)}`
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
  frameColor, footType, scrollT,
}) {
  const totalW = cols * (MW + FT * 2) + FT * 2
  const rowHeights = Array.from({ length: rows }, () => MH_FULL)
  const totalH = rowHeights.reduce((s, h) => s + h + FT * 2, FT * 2)
  const offsetX = -totalW / 2
  const offsetY = 0

  return (
    <group position={[offsetX, offsetY, 0]}>
      {modules.map(m => {
        const yOff = FT + m.r * (MH_FULL + FT * 2)
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
            scrollT={scrollT}
          />
        )
      })}
      <FrameStructure modules={modules} cols={cols} rows={rows} rowHeights={rowHeights} frameColor={frameColor} />
      <Legs cols={cols} footType={footType} frameColor={frameColor} />
      <SceneArrows
        cols={cols} rows={rows}
        onAddCol={onAddCol} onAddRow={onAddRow}
        canAddCol={canAddCol} canAddRow={canAddRow}
        rowHeights={rowHeights}
      />
    </group>
  )
}

function SceneArrows({ cols, rows, onAddCol, onAddRow, canAddCol, canAddRow, rowHeights }) {
  const totalW = cols * (MW + FT * 2) + FT * 2
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
      {canAddCol && (
        <Html position={[totalW + 0.14, midY, MD / 2]} center occlude={false} zIndexRange={[10, 20]}>
          <button style={btnStyle} onClick={onAddCol} title="열 추가">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <polyline points="4,2 10,7 4,12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Html>
      )}
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

function Module({ module, cols, rows, isSelected, isHovered, onSelect, onHover, onRemove, canRemove, yOffset, scrollT }) {
  const { r, c, panelType, color, heightType = 'full', accessory = 'none' } = module
  const mh = getMH(heightType)
  const x = c * (MW + FT * 2) + FT
  const y = yOffset

  const PT = 0.018
  const PI = 0.010

  const [doorOpen, setDoorOpen] = useState(false)
  const doorAngleRef = useRef(0)
  const doorSlideRef = useRef(0)
  const doorDropRef = useRef(0)
  const doorGroupRef = useRef()

  const hasDoor = ['folding', 'dropdown', 'sliding', 'glass'].includes(panelType)

  useFrame((_, delta) => {
    if (!hasDoor) return
    const speed = 4.5
    if (panelType === 'folding' || panelType === 'glass') {
      const target = doorOpen ? -Math.PI / 2 : 0
      doorAngleRef.current += (target - doorAngleRef.current) * Math.min(1, delta * speed)
      if (doorGroupRef.current) doorGroupRef.current.rotation.y = doorAngleRef.current
    } else if (panelType === 'dropdown') {
      const target = doorOpen ? Math.PI / 2 : 0
      doorDropRef.current += (target - doorDropRef.current) * Math.min(1, delta * speed)
      if (doorGroupRef.current) doorGroupRef.current.rotation.x = doorDropRef.current
    } else if (panelType === 'sliding') {
      const target = doorOpen ? MW * 0.85 : 0
      doorSlideRef.current += (target - doorSlideRef.current) * Math.min(1, delta * speed)
      if (doorGroupRef.current) doorGroupRef.current.position.x = doorSlideRef.current
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (hasDoor) setDoorOpen(v => !v)
    onSelect()
  }

  const frontMat = useMemo(() => getPanelMat(color, panelType), [color, panelType])
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
  const iH = (heightType === 'half' ? mh / 2 : mh) - PI * 2
  const iD = MD - PI * 2
  const panelOffY = heightType === 'half' ? -(mh / 4) : 0

  const evts = {
    onClick: handleClick,
    onPointerEnter: e => { e.stopPropagation(); onHover(true) },
    onPointerLeave: e => { e.stopPropagation(); onHover(false) },
  }

  const isPanel = panelType === 'panel'

  return (
    <group position={[x + MW / 2, y + mh / 2 + panelOffY, 0]}>
      <mesh visible={false} geometry={getPanelGeom(iW, iH, MD)} {...evts} />
      <mesh castShadow receiveShadow material={sideMat} geometry={getPanelGeom(iW, iH, PT)} position={[0, 0, -(MD / 2 - PT / 2)]} />
      <mesh castShadow receiveShadow material={sideMat} geometry={getPanelGeom(PT, iH, iD)} position={[-(iW / 2 + PT / 2), 0, 0]} />
      <mesh castShadow receiveShadow material={sideMat} geometry={getPanelGeom(PT, iH, iD)} position={[iW / 2 + PT / 2, 0, 0]} />
      <mesh castShadow receiveShadow material={sideMat} geometry={getPanelGeom(iW, PT, iD)} position={[0, iH / 2 + PT / 2, 0]} />
      <mesh castShadow receiveShadow material={sideMat} geometry={getPanelGeom(iW, PT, iD)} position={[0, -(iH / 2 + PT / 2), 0]} />

      {isPanel && (
        <mesh castShadow receiveShadow material={frontMat} geometry={getPanelGeom(iW, iH, PT)} position={[0, 0, MD / 2 - PT / 2]} />
      )}

      {(isSelected || isHovered) && (
        <mesh geometry={getPanelGeom(iW + 0.01, iH + 0.01, PT)} position={[0, 0, MD / 2 + PT]} material={isSelected ? getSelectMat() : getHoverMat()} />
      )}

      {panelType === 'folding' && (
        <group position={[-(iW / 2), 0, MD / 2 - PT / 2]}>
          <group ref={doorGroupRef}>
            <group position={[iW / 2, 0, 0]}>
              <mesh castShadow receiveShadow material={frontMat} geometry={getPanelGeom(iW, iH, PT)} />
              <mesh castShadow geometry={getKnobGeom()} material={getKnobMat()} position={[iW * 0.15, 0, PT / 2 + 0.013]} />
            </group>
          </group>
        </group>
      )}

      {panelType === 'dropdown' && (
        <group position={[0, -(iH / 2), MD / 2 - PT / 2]}>
          <group ref={doorGroupRef}>
            <group position={[0, iH / 2, 0]}>
              <mesh castShadow receiveShadow material={frontMat} geometry={getPanelGeom(iW, iH, PT)} />
              <mesh castShadow geometry={getKnobGeom()} material={getKnobMat()} position={[0, iH * 0.3, PT / 2 + 0.013]} />
            </group>
          </group>
        </group>
      )}

      {panelType === 'sliding' && (
        <group ref={doorGroupRef}>
          <mesh castShadow receiveShadow material={frontMat} geometry={getPanelGeom(iW, iH, PT)} position={[0, 0, MD / 2 - PT / 2]} />
          <mesh castShadow material={getKnobMat()} position={[0, 0, MD / 2 + 0.01]}>
            <boxGeometry args={[iW * 0.3, 0.011, 0.011]} />
          </mesh>
        </group>
      )}

      {panelType === 'glass' && (
        <group position={[-(iW / 2), 0, MD / 2 - 0.004]}>
          <group ref={doorGroupRef}>
            <group position={[iW / 2, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[iW, iH, 0.007]} />
                <meshPhysicalMaterial color="#c8e8e0" transparent opacity={0.40} roughness={0.04} metalness={0} transmission={0.6} thickness={0.4} envMapIntensity={1.4} />
              </mesh>
              <mesh castShadow material={getKnobMat()} position={[iW * 0.3, 0, 0.012]}>
                <boxGeometry args={[0.011, iH * 0.22, 0.011]} />
              </mesh>
            </group>
          </group>
        </group>
      )}

      {accessory === 'shelf' && (
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[iW - 0.01, 0.014, iD - 0.01]} />
          <meshPhysicalMaterial color="#e8e4dc" roughness={0.6} metalness={0} />
        </mesh>
      )}
      {accessory === 'drawer2' && (
        <group>
          {[-0.28, 0.08].map((dy, i) => (
            <group key={i} position={[0, dy * (mh / MH_FULL), 0.04]}>
              <mesh castShadow>
                <boxGeometry args={[iW - 0.02, iH * 0.35, iD * 0.7]} />
                <meshPhysicalMaterial color={new THREE.Color().setStyle(color.hex)} roughness={0.4} metalness={0} clearcoat={0.2} />
              </mesh>
              <mesh castShadow material={getKnobMat()} position={[0, 0, iD * 0.36]}>
                <sphereGeometry args={[0.018, 12, 12]} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      {accessory === 'drawer5' && (
        <group>
          {[-0.38, -0.19, 0, 0.19, 0.38].map((dy, i) => (
            <group key={i} position={[0, dy * (mh / MH_FULL), 0.04]}>
              <mesh castShadow>
                <boxGeometry args={[iW - 0.02, iH * 0.14, iD * 0.7]} />
                <meshPhysicalMaterial color={new THREE.Color().setStyle(color.hex)} roughness={0.4} metalness={0} clearcoat={0.2} />
              </mesh>
              <mesh castShadow material={getKnobMat()} position={[0, 0, iD * 0.36]}>
                <sphereGeometry args={[0.013, 10, 10]} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      {accessory === 'led' && (
        <group position={[0, iH / 2 - 0.01, iD * 0.3]}>
          <mesh>
            <boxGeometry args={[iW * 0.85, 0.008, 0.012]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffe8a0" emissiveIntensity={1.5} />
          </mesh>
          <pointLight color="#ffe8a0" intensity={0.4} distance={0.6} decay={2} position={[0, -0.02, 0]} />
        </group>
      )}
      {accessory === 'cable' && (
        <mesh position={[iW * 0.3, iH / 2 - 0.015, iD * 0.2]}>
          <torusGeometry args={[0.022, 0.006, 8, 20]} />
          <meshPhysicalMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
      )}
      {accessory === 'lock' && (
        <group position={[iW * 0.42, 0, MD / 2 + 0.008]}>
          <mesh castShadow material={getKnobMat()}>
            <cylinderGeometry args={[0.01, 0.01, 0.025, 10]} />
          </mesh>
          <mesh castShadow material={getKnobMat()} position={[0, 0, 0.014]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.015, 8]} />
          </mesh>
        </group>
      )}

      {isHovered && canRemove && (
        <RemoveButton position={[MW / 2 - 0.04, mh / 2 - 0.04, MD / 2 + 0.02]} onRemove={onRemove} />
      )}
    </group>
  )
}

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

const LEG_H = 0.06
const LEG_R = FT * 1.1
const PAD_H = 0.014
const PAD_R = FT * 1.6

function Legs({ cols, footType, frameColor }) {
  const chromeMat = useMemo(() => getFrameMat(frameColor), [frameColor])
  const rubberMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.06, 0.06, 0.06),
    metalness: 0.0, roughness: 0.95,
  }), [])
  const casterMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.75, 0.75, 0.75),
    metalness: 0.8, roughness: 0.2, envMapIntensity: 1.5,
  }), [])

  const ft = footType?.id || 'chrome'
  const legXs = [FT, cols * (MW + FT * 2) + FT]
  const legZs = [-MD / 2 + FT, MD / 2 - FT]
  const WHEEL_R = 0.028
  const WHEEL_T = 0.012

  return (
    <group position={[0, -LEG_H, 0]}>
      {legXs.map(lx =>
        legZs.map(lz => (
          <group key={`leg-${lx}-${lz}`} position={[lx, LEG_H / 2, lz]}>
            <mesh castShadow geometry={getTubeGeom(LEG_R, LEG_H)} material={chromeMat} />
            {ft === 'chrome' && (
              <mesh castShadow material={chromeMat} position={[0, -(LEG_H / 2 + PAD_H * 0.25), 0]}>
                <cylinderGeometry args={[LEG_R * 1.3, LEG_R, PAD_H * 0.5, 14]} />
              </mesh>
            )}
            {ft === 'rubber' && (
              <mesh castShadow geometry={getTubeGeom(PAD_R, PAD_H)} material={rubberMat} position={[0, -(LEG_H / 2 + PAD_H / 2), 0]} />
            )}
            {ft === 'caster' && (
              <group position={[0, -(LEG_H / 2 + WHEEL_R), 0]}>
                <mesh castShadow material={rubberMat} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[WHEEL_R, WHEEL_R, WHEEL_T, 16]} />
                </mesh>
                <mesh castShadow material={casterMat} position={[0, WHEEL_R * 0.6, 0]}>
                  <cylinderGeometry args={[LEG_R * 1.1, LEG_R * 1.1, WHEEL_R * 0.5, 12]} />
                </mesh>
              </group>
            )}
          </group>
        ))
      )}
    </group>
  )
}

function FrameStructure({ modules, cols, rows, rowHeights, frameColor }) {
  const chromeMat = useMemo(() => getFrameMat(frameColor), [frameColor])

  const rowBotY = (r) => r * (MH_FULL + FT * 2)
  const rowTopY = (r) => rowBotY(r) + MH_FULL + FT * 2
  const rowMidY = (r) => rowBotY(r) + MH_FULL / 2 + FT

  const nodeX = (c) => c * (MW + FT * 2)

  const cellSet = useMemo(() => new Set(modules.map(m => `${m.r},${m.c}`)), [modules])
  const hasCell = (r, c) => cellSet.has(`${r},${c}`)
  const isHalf = (r, c) => {
    const m = modules.find(mod => mod.r === r && mod.c === c)
    return m?.heightType === 'half'
  }

  const vPipes = useMemo(() => {
    const pipes = []
    const seen = new Set()
    modules.forEach(({ r, c }) => {
      ;[c, c + 1].forEach(cx => {
        const key = `${r}-${cx}`
        if (!seen.has(key)) { seen.add(key); pipes.push({ r, cx }) }
      })
    })
    return pipes
  }, [modules])

  const hPipes = useMemo(() => {
    const pipes = []
    const added = new Set()
    const add = (cx, y, len) => {
      const key = `${cx.toFixed(3)}-${y.toFixed(3)}`
      if (!added.has(key)) { added.add(key); pipes.push({ cx, y, len }) }
    }

    for (let r = 0; r <= rows; r++) {
      const boundY = r < rows ? rowBotY(r) : rowBotY(rows - 1) + MH_FULL + FT * 2
      for (let c = 0; c < cols; c++) {
        const lExists = r > 0 && hasCell(r - 1, c)
        const rExists = r < rows && hasCell(r, c)
        if (lExists || rExists) {
          const len = MW + FT * 2
          add(nodeX(c) + len / 2, boundY, len)
        }
      }
    }

    modules.forEach(({ r, c, heightType }) => {
      if (heightType !== 'half') return
      const midY = rowMidY(r)
      const len = MW + FT * 2
      add(nodeX(c) + len / 2, midY, len)
      if (c > 0 && isHalf(r, c - 1)) add(nodeX(c - 1) + len / 2, midY, len)
      if (c + 1 < cols && isHalf(r, c + 1)) add(nodeX(c + 1) + len / 2, midY, len)
    })

    return pipes
  }, [modules, rows, cols])

  const joints = useMemo(() => {
    const pts = new Map()
    modules.forEach(({ r, c }) => {
      const yB = rowBotY(r)
      const yT = rowBotY(r) + MH_FULL + FT * 2
        ;[yB, yT].forEach(y => {
          ;[c, c + 1].forEach(cx => {
            const key = `${y.toFixed(4)}-${cx}`
            if (!pts.has(key)) pts.set(key, { y, cx })
          })
        })
    })
    modules.forEach(({ r, c, heightType }) => {
      if (heightType !== 'half') return
      const midY = rowMidY(r)
        ;[c, c + 1].forEach(cx => {
          const key = `${midY.toFixed(4)}-${cx}`
          if (!pts.has(key)) pts.set(key, { y: midY, cx })
        })
    })
    return [...pts.values()]
  }, [modules])

  return (
    <group>
      {vPipes.map(({ r, cx }, i) => {
        const len = MH_FULL + FT * 2
        const yB = rowBotY(r)
        return (
          <group key={`vp-${i}`}>
            <mesh castShadow geometry={getTubeGeom(FT, len)} material={chromeMat} position={[nodeX(cx), yB + len / 2, MD / 2]} />
            <mesh castShadow geometry={getTubeGeom(FT, len)} material={chromeMat} position={[nodeX(cx), yB + len / 2, -MD / 2]} />
          </group>
        )
      })}
      {hPipes.map(({ cx, y, len }, i) => (
        <group key={`hp-${i}`}>
          <mesh castShadow geometry={getTubeGeom(FT, len)} material={chromeMat} position={[cx, y, MD / 2]} rotation={[0, 0, Math.PI / 2]} />
          <mesh castShadow geometry={getTubeGeom(FT, len)} material={chromeMat} position={[cx, y, -MD / 2]} rotation={[0, 0, Math.PI / 2]} />
        </group>
      ))}
      {joints.map(({ y, cx }, i) => (
        <mesh key={`dp-${i}`} castShadow geometry={getTubeGeom(FT, MD)} material={chromeMat} position={[nodeX(cx), y, 0]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
      {joints.map(({ y, cx }, i) => (
        <group key={`j-${i}`}>
          <mesh castShadow geometry={getSphereGeom(JR)} material={chromeMat} position={[nodeX(cx), y, MD / 2]} />
          <mesh castShadow geometry={getSphereGeom(JR)} material={chromeMat} position={[nodeX(cx), y, -MD / 2]} />
        </group>
      ))}
    </group>
  )
}

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