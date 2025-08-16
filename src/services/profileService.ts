export type ChildProfile = {
  // New requested fields
  firstName: string
  lastName: string
  gender: string
  email: string
  password: string
  phoneNumber: number
  dateOfBirth: string // YYYY-MM-DD

  // Existing/legacy fields kept for compatibility with current app
  childName?: string
  birthdateISO?: string // YYYY-MM-DD
  photoDataUrl?: string
}

const PROFILE_KEY = 'child_profile'

export function saveProfile(profile: ChildProfile) {
  // Derive legacy fields for compatibility
  const childName = profile.childName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
  const birthdateISO = profile.birthdateISO || profile.dateOfBirth
  const toStore: ChildProfile = { ...profile, childName, birthdateISO }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(toStore))
}

export function getProfile(): ChildProfile | null {
  const text = localStorage.getItem(PROFILE_KEY)
  if (!text) return null
  try {
    const parsed = JSON.parse(text) as Partial<ChildProfile>
    // Backfill legacy/new fields if missing
    const childName = parsed.childName || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim()
    const birthdateISO = parsed.birthdateISO || parsed.dateOfBirth
    const dateOfBirth = parsed.dateOfBirth || parsed.birthdateISO || ''
    const result: ChildProfile = {
      firstName: parsed.firstName || (childName ? childName.split(' ')[0] : ''),
      lastName: parsed.lastName || (childName ? childName.split(' ').slice(1).join(' ') : ''),
      gender: parsed.gender || '',
      email: parsed.email || '',
      password: parsed.password || '',
      phoneNumber: typeof parsed.phoneNumber === 'number' ? parsed.phoneNumber : 0,
      dateOfBirth: dateOfBirth || '',
      childName,
      birthdateISO,
      photoDataUrl: parsed.photoDataUrl,
    }
    return result
  } catch {
    return null
  }
}

const NOTES_KEY = 'special_notes'
export function saveSpecialNotes(text: string) {
  localStorage.setItem(NOTES_KEY, text)
}
export function getSpecialNotes(): string {
  return localStorage.getItem(NOTES_KEY) || ''
}


