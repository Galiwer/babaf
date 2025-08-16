export type Appointment = { id: string; whenISO: string; title: string }

const KEY = 'appointments'

export function listAppointments(): Appointment[] {
  const text = localStorage.getItem(KEY)
  if (!text) return []
  try { return JSON.parse(text) as Appointment[] } catch { return [] }
}

export function addAppointment(a: Appointment) {
  const all = listAppointments()
  all.push(a)
  localStorage.setItem(KEY, JSON.stringify(all))
}


