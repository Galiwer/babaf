export type BmiEntry = {
  dateISO: string // YYYY-MM-DD
  heightCm: number
  weightKg: number
}

const KEY = 'bmi_entries'
const DEFAULT_BASE_URL = 'http://localhost:9090/health'
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE_URL
import { getUserId } from './profileService'

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

// Backend integration
export async function fetchBmiRecords(): Promise<BmiEntry[]> {
  const userId = getUserId()
  if (!userId) return []
  try {
    const response = await fetch(`${BASE_URL}/getBmiRecords?userId=${userId}`, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`Failed to fetch BMI records: ${response.status}`)
    const data = await response.json()
    // Map backend fields to frontend BmiEntry
    const mapped: BmiEntry[] = (Array.isArray(data) ? data : []).map((rec: any) => {
      // Normalize date
      let dateISO = ''
      const created = rec.created_at || rec.createdAt || rec.date || rec.created || ''
      if (typeof created === 'string') {
        dateISO = created.includes('T') ? created.split('T')[0] : created
      }
      return {
        dateISO,
        heightCm: Number(rec.height) * 100 || 0,
        weightKg: Number(rec.weight) || 0,
      }
    }).filter((e: BmiEntry) => !!e.dateISO)
    return mapped.sort((a,b)=>a.dateISO.localeCompare(b.dateISO))
  } catch (e) {
    console.error('fetchBmiRecords error', e)
    return []
  }
}

export async function addBmiRecordToBackend(entry: BmiEntry): Promise<number | null> {
  const userId = getUserId()
  if (!userId) return null
  const payload = {
    userId,
    weight: entry.weightKg,
    height: entry.heightCm / 100,
    date: entry.dateISO,
  }
  try {
    const response = await fetch(`${BASE_URL}/addBmiRecord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error(`Failed to add BMI record: ${response.status}`)
    const body = await response.json()
    // backend returns { message, bmi }
    return typeof body?.bmi === 'number' ? body.bmi : null
  } catch (e) {
    console.error('addBmiRecordToBackend error', e)
    return null
  }
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

// Growth/BMI classification from backend
export type GrowthCheckResponse = {
  userId: string
  gender?: string
  ageInMonths?: number
  weight: number
  height: number
  growthRange?: { under: number; min: number; max: number; over: number }
  weightStatus?: string
  bmi?: number
  bmiStatus?: string
  message?: string
}

export async function checkGrowth(weightKg: number, heightCm: number): Promise<GrowthCheckResponse | null> {
  const userId = getUserId()
  if (!userId) return null
  try {
    const response = await fetch(`${BASE_URL}/checkGrowth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ userId, weight: weightKg, height: heightCm }),
    })
    if (!response.ok) throw new Error(`checkGrowth failed: ${response.status}`)
    return await response.json()
  } catch (e) {
    console.error('checkGrowth error', e)
    return null
  }
}

