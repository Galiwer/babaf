export type User = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  message: string
  userId: string
  name: string
  email: string
}

const DEFAULT_BASE_URL = 'http://localhost:9090/health'
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE_URL

const STORAGE_KEYS = {
  userId: 'auth_user_id',
  user: 'auth_user',
}

function saveSession(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEYS.userId, auth.userId)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({
    id: auth.userId,
    name: auth.name,
    email: auth.email
  }))
}

export function getStoredSession(): AuthResponse | null {
  const userId = localStorage.getItem(STORAGE_KEYS.userId)
  const userStr = localStorage.getItem(STORAGE_KEYS.user)
  if (!userId || !userStr) return null
  try {
    const user = JSON.parse(userStr) as User
    return { message: "Session restored", userId, name: user.name, email: user.email }
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.userId)
  localStorage.removeItem(STORAGE_KEYS.user)
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'Login failed')
    throw new Error(text || 'Login failed')
  }
  
  const responseData = await response.json()
  console.log('Login response:', responseData)
  
  // Handle both direct response and response with body property
  const data = responseData.body ? responseData.body as AuthResponse : responseData as AuthResponse
  saveSession(data)
  return data
}

export async function signup(firstName: string, lastName: string, email: string, password: string, gender: string, dateOfBirth: string, phoneNumber: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      firstName, 
      lastName, 
      email, 
      password, 
      gender, 
      dateOfBirth,
      phoneNumber
    }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'Signup failed')
    throw new Error(text || 'Signup failed')
  }
  
  const responseData = await response.json()
  console.log('Signup response:', responseData)
  
  // Handle both direct response and response with body property
  const data = responseData.body ? responseData.body as AuthResponse : responseData as AuthResponse
  saveSession(data)
  return data
}

export async function logout(): Promise<void> {
  clearSession()
}

export async function getProfile(): Promise<User | null> {
  const userId = localStorage.getItem(STORAGE_KEYS.userId)
  if (!userId) return null
  const userStr = localStorage.getItem(STORAGE_KEYS.user)
  if (userStr) {
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  }
  return null
}


