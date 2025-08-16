import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, signup } from '../services/authService'
import { saveProfile } from '../services/profileService'
import './auth.css'

function Auth() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [entered, setEntered] = useState(false)
  const navigate = useNavigate()
  const wheelHandledRef = useRef(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Trigger fade-in on mount
    const id = requestAnimationFrame(() => setEntered(true))

    const onWheel = (e: WheelEvent) => {
      if (wheelHandledRef.current) return
      // When modal is open, block navigation gestures
      if (isModalOpen) {
        e.preventDefault()
        return
      }
      // Disable downward scroll
      if (e.deltaY > 0) {
        e.preventDefault()
        return
      }
      // Upward scroll should go back to welcome
      if (e.deltaY < 0) {
        e.preventDefault()
        wheelHandledRef.current = true
        navigate('/')
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      // Prevent rubber-band on mobile
      e.preventDefault()
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(id)
    }
  }, [navigate])

  return (
    <section className="auth-section" style={{ opacity: entered ? 1 : 0, transition: 'opacity 510ms ease' }}>
      <div className="auth-landing">
        <h1 className="page-title">Babawhutto</h1>
        <p className="page-subtitle">
          Mahinda Rajapaksa (Sinhala; Tamil: මහින්ද රාජපක්ෂ; born Percy Mahendra Rajapaksa; 18 November 1945) is a Sri Lankan politician.
        </p>
        <div className="actions-row">
          <button type="button" className="primary" onClick={() => { setAuthMode('login'); setIsModalOpen(true) }}>LOGIN</button>
          <button type="button" onClick={() => { setAuthMode('signup'); setIsModalOpen(true) }}>SIGNUP</button>
        </div>

        <h2 className="offer-title">What we offer</h2>
        <div className="offer-grid">
          <div className="offer-card" />
          <div className="offer-card" />
          <div className="offer-card" />
        </div>
      </div>

      {isModalOpen ? (
        <AuthModal onClose={() => setIsModalOpen(false)}>
          {authMode === 'login' ? <LoginForm /> : <SignupForm />}
        </AuthModal>
      ) : null}
    </section>
  )
}

export default Auth

function LoginForm() {
  const [email, setEmail] = useState('demo@babaf.dev')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      sessionStorage.setItem('onboard_needed', '1')
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        required
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? <div style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</div> : null}

      <button type="submit" className="primary" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}

function SignupForm() {
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('demo+new@babaf.dev')
  const [password, setPassword] = useState('password123')
  const [childName, setChildName] = useState('Baby')
  const [birthdate, setBirthdate] = useState('2024-01-01')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signup(name, email, password)
      saveProfile({ childName, birthdateISO: birthdate })
      sessionStorage.setItem('onboard_needed', '1')
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label htmlFor="signup-name">Name</label>
      <input
        id="signup-name"
        type="text"
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="signup-email">Email</label>
      <input
        id="signup-email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="signup-password">Password</label>
      <input
        id="signup-password"
        type="password"
        required
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label htmlFor="child-name">Child name</label>
      <input
        id="child-name"
        type="text"
        required
        placeholder="Child name"
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
      />

      <label htmlFor="birthdate">Birthdate</label>
      <input
        id="birthdate"
        type="date"
        required
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
      />

      {error ? <div style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</div> : null}

      <button type="submit" className="primary" disabled={loading}>
        {loading ? 'Creating...' : 'Create account'}
      </button>
    </form>
  )
}

type AuthModalProps = { onClose: () => void; children: React.ReactNode }
function AuthModal({ onClose, children }: AuthModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="auth-tabs" style={{ marginBottom: 12 }}>
          {/* tabs hidden in modal; heading handled by page buttons */}
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}


