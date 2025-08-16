export type User = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  token: string
  user: User
}

const DEFAULT_BASE_URL = 'http://localhost:8080'
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE_URL
const USE_MOCK: boolean = ((import.meta as any).env?.VITE_USE_MOCK_AUTH ?? 'true') !== 'false'

const STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
}

function saveSession(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEYS.token, auth.token)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(auth.user))
}

export function getStoredSession(): AuthResponse | null {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  const userStr = localStorage.getItem(STORAGE_KEYS.user)
  if (!token || !userStr) return null
  try {
    const user = JSON.parse(userStr) as User
    return { token, user }
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.user)
}

// Mock user credentials for development
const MOCK_USER: User = {
  id: 'u_demo_1',
  name: 'Demo User',
  email: 'demo@babaf.dev',
}
const MOCK_PASSWORD = 'password123'
const MOCK_TOKEN = 'mock-demo-token'

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(350)
    if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
      const auth = { token: MOCK_TOKEN, user: MOCK_USER }
      saveSession(auth)
      return auth
    }
    throw new Error('Invalid email or password')
  }

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'Login failed')
    throw new Error(text || 'Login failed')
  }
  const data = (await response.json()) as AuthResponse
  saveSession(data)
  return data
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(400)
    // Pretend we created a new user
    const user: User = { id: 'u_demo_new', name, email }
    const auth = { token: MOCK_TOKEN, user }
    saveSession(auth)
    return auth
  }

  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => 'Signup failed')
    throw new Error(text || 'Signup failed')
  }
  const data = (await response.json()) as AuthResponse
  saveSession(data)
  return data
}

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    await delay(150)
    clearSession()
    return
  }
  try {
    await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' })
  } finally {
    clearSession()
  }
}

export async function getProfile(): Promise<User | null> {
  if (USE_MOCK) {
    await delay(150)
    const session = getStoredSession()
    return session?.user ?? null
  }
  const token = localStorage.getItem(STORAGE_KEYS.token)
  if (!token) return null
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return null
  const user = (await response.json()) as User
  return user
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


