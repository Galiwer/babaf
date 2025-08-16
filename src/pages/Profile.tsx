import { useState } from 'react'
import { getProfile, saveProfile } from '../services/profileService'
import { useNavigate } from 'react-router-dom'
import './profile.css'
import SideNav from '../components/SideNav'

function ProfilePage() {
  const navigate = useNavigate()
  const existing = getProfile()

  const [firstName, setFirstName] = useState(existing?.firstName || '')
  const [lastName, setLastName] = useState(existing?.lastName || '')
  const [gender, setGender] = useState(existing?.gender || '')
  const [email, setEmail] = useState(existing?.email || '')
  const [password, setPassword] = useState(existing?.password || '')
  const [phoneNumber, setPhoneNumber] = useState<number>(existing?.phoneNumber || 0)
  const [dateOfBirth, setDateOfBirth] = useState(existing?.dateOfBirth || existing?.birthdateISO || '')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(existing?.photoDataUrl)

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file)
    setPhotoDataUrl(url)
  }

  const onSave = () => {
    saveProfile({
      firstName,
      lastName,
      gender,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      photoDataUrl,
    })
    navigate('/dashboard')
  }

  const onDelete = () => {
    localStorage.removeItem('child_profile')
    navigate('/dashboard')
  }

  return (
    <div className="profile-page">
      <SideNav />

      <main className="profile-main">
        <h1>Profile</h1>
        <div className="form-grid">
          <label>First name
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label>Last name
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
          <label>Gender
            <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="e.g., male/female" />
          </label>
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>Phone number
            <input type="tel" value={phoneNumber || ''} onChange={(e) => setPhoneNumber(Number(e.target.value || 0))} />
          </label>
          <label>Date of birth
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </label>
          <label>Photo
            <input type="file" accept="image/*" onChange={onPickPhoto} />
          </label>
          {photoDataUrl ? (<img src={photoDataUrl} alt="Baby" className="photo-preview" />) : null}
        </div>
        <div className="actions">
          <button className="primary" onClick={onSave}>Save</button>
          <button className="danger" onClick={onDelete}>Delete profile</button>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}


