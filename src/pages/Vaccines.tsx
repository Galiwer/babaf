import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { addCustomVaccine, computeDueDateISO, setAdministered, updateVaccine, deleteVaccine } from '../services/vaccineService'
import type { VaccineRecord } from '../services/vaccineService'
import { getProfile } from '../services/profileService'
import { useVaccineSync } from '../hooks/useVaccineSync'
import './vaccines.css'

function VaccinesPage() {
  useNavigate()
  const { vaccines, refreshVaccines } = useVaccineSync()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [offset, setOffset] = useState<string>('0')
  const [openAdd, setOpenAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editOffset, setEditOffset] = useState<string>('0')
  const profile = getProfile()

  const onToggleAdmin = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdministered(id, e.target.checked)
    refreshVaccines()
  }

  const onAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const months = Number(offset)
    if (!name.trim() || Number.isNaN(months) || months < 0) return
    addCustomVaccine(name.trim(), company.trim() || 'Custom', months)
    setName(''); setCompany(''); setOffset('0')
    refreshVaccines()
  }

  const onOpenEdit = (v: VaccineRecord) => {
    setEditId(v.id)
    setEditName(v.name)
    setEditCompany(v.company)
    setEditOffset(String(v.offsetMonths))
  }

  const onSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editId) return
    const months = Number(editOffset)
    if (!editName.trim() || Number.isNaN(months) || months < 0) return
    updateVaccine(editId, { name: editName.trim(), company: editCompany.trim(), offsetMonths: months })
    setEditId(null)
    refreshVaccines()
  }

  const onDelete = (id: string) => {
    if (!confirm('Delete this vaccine?')) return
    deleteVaccine(id)
    refreshVaccines()
  }

  return (
    <div className="vaccines-page">
      <SideNav />

      <main className="vacc-main">
        <h1>Vaccine Register</h1>
        <div className="list">
          {vaccines.map(v => (
            <label key={v.id} className={`row ${v.administered ? 'administered' : ''}`}>
              <span className="line">
                <div className="vaccine-info">
                  <div className="vaccine-name">{v.name} — {v.company}</div>
                  <div className="vaccine-due">
                    Due: {computeDueDateISO(v.offsetMonths, profile) || '—'} (at {v.offsetMonths} months after birth)
                  </div>
                  {v.isCustom && (
                    <div style={{ display: 'flex', gap: '1vmin', marginTop: '1vmin' }}>
                      <button className="ghost" type="button" onClick={() => onOpenEdit(v)}>Edit</button>
                      <button className="ghost" type="button" onClick={() => onDelete(v.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </span>
              <input 
                type="checkbox" 
                checked={v.administered} 
                onChange={onToggleAdmin(v.id)}
                className="vaccine-checkbox"
              />
            </label>
          ))}
        </div>

        <button type="button" className="fab" onClick={() => setOpenAdd(true)} aria-label="Add vaccine">+</button>

        {openAdd ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setOpenAdd(false)}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>
              <h2>Add vaccine</h2>
              <form className="auth-form" onSubmit={(e)=>{ onAdd(e); setOpenAdd(false) }}>
                <label>Vaccine name
                  <input className="add-input" placeholder="e.g., HepB" value={name} onChange={(e)=>setName(e.target.value)} />
                </label>
                <label>Company
                  <input className="add-input" placeholder="e.g., Generic" value={company} onChange={(e)=>setCompany(e.target.value)} />
                </label>
                <label>Months after birth
                  <input className="add-input" type="number" min="0" placeholder="Months" value={offset} onChange={(e)=>setOffset(e.target.value)} />
                </label>
                <div style={{ textAlign: 'right' }}>
                  <button className="primary" type="submit">Add</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {editId ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditId(null)}>
            <div className="modal" onClick={(e)=>e.stopPropagation()}>
              <h2>Edit vaccine</h2>
              <form className="auth-form" onSubmit={(e)=>{ onSaveEdit(e); }}>
                <label>Vaccine name
                  <input className="add-input" value={editName} onChange={(e)=>setEditName(e.target.value)} />
                </label>
                <label>Company
                  <input className="add-input" value={editCompany} onChange={(e)=>setEditCompany(e.target.value)} />
                </label>
                <label>Months after birth
                  <input className="add-input" type="number" min="0" value={editOffset} onChange={(e)=>setEditOffset(e.target.value)} />
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1vmin' }}>
                  <button className="ghost" type="button" onClick={()=>setEditId(null)}>Cancel</button>
                  <button className="primary" type="submit">Save</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default VaccinesPage


