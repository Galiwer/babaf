import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addBmi, classifyBmi, computeBmi, listBmi, latest, deleteBmi, updateBmi } from '../services/bmiService'
import type { BmiEntry } from '../services/bmiService'
import { getProfile } from '../services/profileService'
import './bmi.css'
import SideNav from '../components/SideNav'

function BmiPage() {
  useNavigate()
  const [entries, setEntries] = useState<BmiEntry[]>(listBmi())
  const last = entries.length ? entries[entries.length - 1] : null
  const currentBmi = last ? computeBmi(last.heightCm, last.weightKg) : 0
  const status = classifyBmi(currentBmi)
  const [isModalOpen, setModalOpen] = useState(false)
  const [dateISO, setDateISO] = useState<string>(new Date().toISOString().slice(0,10))
  const [heightCm, setHeightCm] = useState<number>(120)
  const [weightKg, setWeightKg] = useState<number>(25)
  const [edit, setEdit] = useState<{ originalDateISO: string; dateISO: string; heightCm: number; weightKg: number } | null>(null)

  const profile = getProfile()

  // Demo seed
  useEffect(() => {
    if (listBmi().length === 0 && !localStorage.getItem('bmi_demo_seeded')) {
      const today = new Date()
      const toISO = (d: Date) => d.toISOString().slice(0,10)
      const d1 = new Date(today); d1.setDate(today.getDate() - 120)
      const d2 = new Date(today); d2.setDate(today.getDate() - 90)
      const d3 = new Date(today); d3.setDate(today.getDate() - 60)
      const d4 = new Date(today); d4.setDate(today.getDate() - 30)
      const d5 = new Date(today)
      const demo: BmiEntry[] = [
        { dateISO: toISO(d1), heightCm: 70, weightKg: 8.0 },
        { dateISO: toISO(d2), heightCm: 72, weightKg: 8.5 },
        { dateISO: toISO(d3), heightCm: 74, weightKg: 9.0 },
        { dateISO: toISO(d4), heightCm: 75, weightKg: 9.3 },
        { dateISO: toISO(d5), heightCm: 77, weightKg: 9.7 },
      ]
      demo.forEach(addBmi)
      localStorage.setItem('bmi_demo_seeded', '1')
      setEntries(listBmi())
    }
  }, [])

  const graphRef = useRef<HTMLDivElement | null>(null)
  const [tooltip, setTooltip] = useState<{ visible: boolean; left: number; top: number; entry?: BmiEntry; age?: string }>(
    { visible: false, left: 0, top: 0 }
  )

  const graph = useMemo(() => buildGraphData(entries), [entries])

  function onPointClick(e: React.MouseEvent<SVGCircleElement>, entry: BmiEntry) {
    const container = graphRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const left = e.clientX - rect.left
    const top = e.clientY - rect.top - 8

    const age = formatAgeAt(entry.dateISO, profile?.birthdateISO || profile?.dateOfBirth)

    setTooltip({ visible: true, left, top, entry, age })
  }

  function closeTooltip() { setTooltip({ visible: false, left: 0, top: 0 }) }

  function handleSaveNew() {
    addBmi({ dateISO, heightCm, weightKg })
    setEntries(listBmi())
    setModalOpen(false)
  }

  function onEdit(entry: BmiEntry) {
    setEdit({ originalDateISO: entry.dateISO, dateISO: entry.dateISO, heightCm: entry.heightCm, weightKg: entry.weightKg })
  }

  function onSaveEdit() {
    if (!edit) return
    updateBmi(edit.originalDateISO, { dateISO: edit.dateISO, heightCm: edit.heightCm, weightKg: edit.weightKg })
    setEntries(listBmi())
    setEdit(null)
  }

  function onDelete(date: string) {
    if (!confirm('Delete this record?')) return
    deleteBmi(date)
    setEntries(listBmi())
  }

  const past = entries.slice(0, -1)
  const present = last ? [last] : []

  return (
    <div className="bmi-page">
      <SideNav />
      <main className="bmi-main">
        <h1 className="bmi-title">BMI</h1>

        <section className="bmi-top">
          <div className={`bmi-big ${status.color}`}>
            <div className="bmi-value">{currentBmi || '—'}</div>
            <div className="bmi-chip">{status.label}</div>
          </div>

          <div className="bmi-bars">
            {['underweight', 'healthy', 'overweight', 'obese'].map((label) => (
              <div key={label} className={`bar ${mapLabelToColor(label)}`}>{label}</div>
            ))}
          </div>

          <div className="bmi-meta">
            <div className="chip">Height {last?.heightCm ?? '—'} cm</div>
            <div className="chip">Weight {last?.weightKg ?? '—'} kg</div>
            <button className="ghost" onClick={() => setModalOpen(true)}>ADD</button>
          </div>
        </section>

        <section className="bmi-graph" ref={graphRef} onClick={closeTooltip}>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <rect x={graph.margins.left} y={graph.margins.top} width={graph.innerWidth} height={graph.innerHeight} fill="none" stroke="#ffffff22" strokeWidth="0.4" />
            {graph.yTicks.map(t => (<line key={`y-${t.y}`} x1={graph.margins.left} y1={t.y} x2={graph.margins.left + graph.innerWidth} y2={t.y} stroke="#ffffff11" strokeWidth="0.3" />))}
            {graph.xTicks.map(t => (<line key={`x-${t.x}`} x1={t.x} y1={graph.margins.top} x2={t.x} y2={graph.margins.top + graph.innerHeight} stroke="#ffffff0e" strokeWidth="0.3" />))}
            <polyline fill="none" stroke="#7c8bff" strokeWidth="0.8" points={graph.polyPoints} />
            {graph.circles.map((c) => (
              <circle key={c.key} cx={c.cx} cy={c.cy} r={1.2} fill="#7c8bff" stroke="#ffffff55" strokeWidth="0.3" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onPointClick(e, c.entry) }} />
            ))}
            <text x={graph.margins.left + graph.innerWidth / 2} y={graph.margins.top + graph.innerHeight + 6} textAnchor="middle" fill="#9aa0a6" fontSize="3">Date</text>
            <text x={graph.margins.left - 6} y={graph.margins.top - 3} textAnchor="start" fill="#9aa0a6" fontSize="3">BMI</text>
            {graph.yTicksLabeled.map(t => (<text key={`yl-${t.y}`} x={graph.margins.left - 2} y={t.y + 1.2} textAnchor="end" fill="#9aa0a6" fontSize="2.5">{t.label}</text>))}
            {graph.xTicksLabeled.map(t => (<text key={`xl-${t.x}`} x={t.x} y={graph.margins.top + graph.innerHeight + 4.5} textAnchor="middle" fill="#9aa0a6" fontSize="2.5">{t.label}</text>))}
            <text x={graph.margins.left + 1} y={graph.margins.top - 3} fill="#e6e8f0" fontSize="3.2" fontWeight={600}>BMI over time</text>
          </svg>

          {tooltip.visible && tooltip.entry && (
            <div className="bmi-tooltip" style={{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }} onClick={(e)=>e.stopPropagation()}>
              <div className="bmi-tooltip-title">{tooltip.entry.dateISO}</div>
              <div className="bmi-tooltip-row">Height: <strong>{tooltip.entry.heightCm} cm</strong></div>
              <div className="bmi-tooltip-row">Weight: <strong>{tooltip.entry.weightKg} kg</strong></div>
              {tooltip.age ? (<div className="bmi-tooltip-row">Age: <strong>{tooltip.age}</strong></div>) : null}
            </div>
          )}
        </section>

        {/* Past / Present entries */}
        <section style={{ display: 'grid', gap: '1.6vmin' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 2.6vmin, 1.8rem)' }}>BMI entries</h2>
          <div style={{ display: 'grid', gap: '1vmin' }}>
            {[...entries].reverse().map(e => (
              <div key={e.dateISO} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1vmin', alignItems: 'center', background: 'var(--panel)', border: '0.1vmin solid var(--muted)', borderRadius: '1vmin', padding: '1.2vmin' }}>
                <div style={{ color: 'var(--subtle)' }}>{e.dateISO}</div>
                <div>H {e.heightCm} cm • W {e.weightKg} kg • BMI {computeBmi(e.heightCm, e.weightKg)}</div>
                <div style={{ display: 'flex', gap: '1vmin' }}>
                  <button className="ghost" onClick={() => onEdit(e)}>Edit</button>
                  <button className="ghost" onClick={() => onDelete(e.dateISO)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Edit modal */}
        {edit ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEdit(null)}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>
              <h2>Edit BMI entry</h2>
              <div className="auth-form">
                <label>Date<input type="date" value={edit.dateISO} onChange={(e)=>setEdit({ ...edit, dateISO: e.target.value })} /></label>
                <label>Height (cm)<input type="number" value={edit.heightCm} onChange={(e)=>setEdit({ ...edit, heightCm: Number(e.target.value) })} /></label>
                <label>Weight (kg)<input type="number" value={edit.weightKg} onChange={(e)=>setEdit({ ...edit, weightKg: Number(e.target.value) })} /></label>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1vmin' }}>
                  <button className="ghost" type="button" onClick={()=>setEdit(null)}>Cancel</button>
                  <button className="primary" type="button" onClick={onSaveEdit}>Save</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Add modal */}
        {isModalOpen ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setModalOpen(false)}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>
              <h2>Add BMI entry</h2>
              <div className="auth-form">
                <label>Date<input type="date" value={dateISO} onChange={(e)=>setDateISO(e.target.value)} /></label>
                <label>Height (cm)<input type="number" value={heightCm} onChange={(e)=>setHeightCm(Number(e.target.value))} /></label>
                <label>Weight (kg)<input type="number" value={weightKg} onChange={(e)=>setWeightKg(Number(e.target.value))} /></label>
                <button className="primary" onClick={handleSaveNew}>Save</button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default BmiPage

function buildGraphData(entries: BmiEntry[]): {
  polyPoints: string;
  circles: Array<{ key: string; cx: number; cy: number; entry: BmiEntry }>;
  margins: { left: number; right: number; top: number; bottom: number };
  innerWidth: number;
  innerHeight: number;
  yTicks: Array<{ y: number }>;
  xTicks: Array<{ x: number }>;
  yTicksLabeled: Array<{ y: number; label: string }>;
  xTicksLabeled: Array<{ x: number; label: string }>;
} {
  const margins = { left: 10, right: 6, top: 8, bottom: 12 }
  const width = 100
  const height = 60
  const innerWidth = width - margins.left - margins.right
  const innerHeight = height - margins.top - margins.bottom

  if (!entries.length) {
    return {
      polyPoints: '', circles: [], margins, innerWidth, innerHeight,
      yTicks: [], xTicks: [], yTicksLabeled: [], xTicksLabeled: []
    }
  }

  // Sort by date
  const sorted = [...entries].sort((a,b)=>new Date(a.dateISO).getTime()-new Date(b.dateISO).getTime())

  const times = sorted.map(e => new Date(e.dateISO).getTime())
  const minDate = Math.min(...times)
  const maxDate = Math.max(...times)
  const bmis = sorted.map(e => computeBmi(e.heightCm, e.weightKg))
  const minBmi = Math.min(...bmis)
  const maxBmi = Math.max(...bmis)

  const span = Math.max(1, maxDate - minDate)
  const range = Math.max(1, maxBmi - minBmi)

  const toX = (t: number) => margins.left + ((t - minDate) / span) * innerWidth
  const toY = (b: number) => margins.top + (1 - (b - minBmi) / range) * innerHeight

  const points = sorted.map(e => {
    const x = toX(new Date(e.dateISO).getTime())
    const y = toY(computeBmi(e.heightCm, e.weightKg))
    return { x, y, entry: e }
  })

  let poly = ''
  if (points.length === 1) {
    const p = points[0]
    poly = `${margins.left},${p.y.toFixed(2)} ${margins.left + innerWidth},${p.y.toFixed(2)}`
  } else {
    poly = points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  }

  const circles = points.map(p => ({ key: p.entry.dateISO, cx: +p.x.toFixed(2), cy: +p.y.toFixed(2), entry: p.entry }))

  // Y ticks: min, mid, max
  const yMin = toY(minBmi)
  const yMid = toY(minBmi + range / 2)
  const yMax = toY(maxBmi)
  const yTicks = [{ y: yMin }, { y: yMid }, { y: yMax }]
  const yTicksLabeled = [
    { y: yMax, label: maxBmi.toFixed(1) },
    { y: yMid, label: (minBmi + range / 2).toFixed(1) },
    { y: yMin, label: minBmi.toFixed(1) },
  ]

  // X ticks: first, middle, last
  const firstX = toX(minDate)
  const lastX = toX(maxDate)
  const midX = toX(minDate + span / 2)
  const fmt = (t: number) => {
    const d = new Date(t)
    return `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`
  }
  const xTicks = [{ x: firstX }, { x: midX }, { x: lastX }]
  const xTicksLabeled = [
    { x: firstX, label: fmt(minDate) },
    { x: midX, label: fmt(minDate + span / 2) },
    { x: lastX, label: fmt(maxDate) },
  ]

  return { polyPoints: poly, circles, margins, innerWidth, innerHeight, yTicks, xTicks, yTicksLabeled, xTicksLabeled }
}

function mapLabelToColor(label: string): 'danger'|'ok'|'warn' {
  if (label === 'healthy') return 'ok'
  if (label === 'overweight') return 'warn'
  return 'danger'
}

function formatAgeAt(dateISO: string, birthISO?: string): string | undefined {
  if (!birthISO) return undefined
  const d = new Date(dateISO)
  const b = new Date(birthISO)
  let years = d.getFullYear() - b.getFullYear()
  let months = d.getMonth() - b.getMonth()
  if (d.getDate() < b.getDate()) months -= 1
  while (months < 0) { years -= 1; months += 12 }
  if (years < 0) return undefined
  return years ? `${years}y ${months}m` : `${months}m`
}


