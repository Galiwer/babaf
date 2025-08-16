import type { ChildProfile } from './profileService'
import { getProfile } from './profileService'

export type VaccineRecord = {
  id: string
  name: string
  company: string
  offsetMonths: number
  isCustom: boolean
  administered: boolean
  administeredDateISO?: string
}

const DEFAULTS: Omit<VaccineRecord, 'administered' | 'administeredDateISO' | 'isCustom'>[] = [
  { id: 'bcg-0', name: 'BCG', company: 'Generic', offsetMonths: 0 },
  { id: 'hepB-0', name: 'HepB (birth)', company: 'Generic', offsetMonths: 0 },
  { id: 'opv-2', name: 'OPV', company: 'Generic', offsetMonths: 2 },
  { id: 'dtp-2', name: 'DTP', company: 'Generic', offsetMonths: 2 },
  { id: 'ipv-2', name: 'IPV', company: 'Generic', offsetMonths: 2 },
  { id: 'dtp-4', name: 'DTP (booster)', company: 'Generic', offsetMonths: 4 },
  { id: 'mmr-12', name: 'MMR', company: 'Generic', offsetMonths: 12 },
]

const KEY = 'vaccines_db'

function seedIfNeeded() {
  const text = localStorage.getItem(KEY)
  if (text) return
  const seeded: VaccineRecord[] = DEFAULTS.map(v => ({ ...v, isCustom: false, administered: false }))
  localStorage.setItem(KEY, JSON.stringify(seeded))
}

export function listVaccines(): VaccineRecord[] {
  seedIfNeeded()
  const text = localStorage.getItem(KEY)
  try { return (JSON.parse(text || '[]') as VaccineRecord[]) } catch { return [] }
}

function saveVaccines(list: VaccineRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function addCustomVaccine(name: string, company: string, offsetMonths: number) {
  const list = listVaccines()
  const id = `${name.toLowerCase().replace(/\s+/g,'-')}-${Date.now()}`
  list.push({ id, name, company, offsetMonths, isCustom: true, administered: false })
  saveVaccines(list)
}

export function updateVaccine(id: string, changes: Partial<Pick<VaccineRecord, 'name'|'company'|'offsetMonths'>>) {
  const list = listVaccines()
  const rec = list.find(r => r.id === id)
  if (!rec) return
  if (typeof changes.name === 'string') rec.name = changes.name
  if (typeof changes.company === 'string') rec.company = changes.company
  if (typeof changes.offsetMonths === 'number') rec.offsetMonths = changes.offsetMonths
  saveVaccines(list)
}

export function deleteVaccine(id: string) {
  const list = listVaccines().filter(v => v.id !== id)
  saveVaccines(list)
}

export function setAdministered(id: string, administered: boolean, dateISO?: string) {
  const list = listVaccines()
  const rec = list.find(r => r.id === id)
  if (!rec) return
  rec.administered = administered
  rec.administeredDateISO = administered ? (dateISO || new Date().toISOString().slice(0,10)) : undefined
  saveVaccines(list)
}

export function computeDueDateISO(offsetMonths: number, profile?: ChildProfile | null): string | null {
  const p = profile ?? getProfile()
  if (!p) return null
  const baseISO = p.birthdateISO || p.dateOfBirth
  if (!baseISO) return null
  const birth = new Date(baseISO + 'T00:00:00')
  const due = addMonths(birth, offsetMonths)
  return `${due.getFullYear().toString().padStart(4,'0')}-${(due.getMonth()+1).toString().padStart(2,'0')}-${due.getDate().toString().padStart(2,'0')}`
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime())
  d.setMonth(d.getMonth() + months)
  return d
}


