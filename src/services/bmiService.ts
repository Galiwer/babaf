export type BmiEntry = {
  dateISO: string // YYYY-MM-DD
  heightCm: number
  weightKg: number
}

const KEY = 'bmi_entries'

export function listBmi(): BmiEntry[] {
  const text = localStorage.getItem(KEY)
  if (!text) return []
  try { return (JSON.parse(text) as BmiEntry[]).sort((a,b)=>a.dateISO.localeCompare(b.dateISO)) } catch { return [] }
}

export function addBmi(entry: BmiEntry) {
  const all = listBmi().filter(e => e.dateISO !== entry.dateISO)
  all.push(entry)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function updateBmi(originalDateISO: string, updated: BmiEntry) {
  const all = listBmi().filter(e => e.dateISO !== originalDateISO)
  all.push(updated)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function deleteBmi(dateISO: string) {
  const all = listBmi().filter(e => e.dateISO !== dateISO)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function computeBmi(heightCm: number, weightKg: number): number {
  const h = heightCm / 100
  if (!h) return 0
  return +(weightKg / (h * h)).toFixed(1)
}

export function classifyBmi(bmi: number): { label: string; color: 'danger' | 'ok' | 'warn' } {
  if (bmi <= 0) return { label: 'unknown', color: 'warn' }
  if (bmi < 18.5) return { label: 'underweight', color: 'danger' }
  if (bmi < 25) return { label: 'healthy', color: 'ok' }
  if (bmi < 30) return { label: 'overweight', color: 'warn' }
  return { label: 'obese', color: 'danger' }
}

export function latest(): BmiEntry | null {
  const all = listBmi()
  return all.length ? all[all.length - 1] : null
}


