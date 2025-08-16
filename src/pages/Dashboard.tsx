import React, { useState, useEffect, useMemo } from 'react';
import { getProfile, saveSpecialNotes, getSpecialNotes } from '../services/profileService';
import { computeDueDateISO, setAdministered } from '../services/vaccineService';
import { latest, computeBmi } from '../services/bmiService';
import { useVaccineSync } from '../hooks/useVaccineSync';
import SideNav from '../components/SideNav';
import './dashboard.css';

interface ChildProfile {
  childName: string;
  birthdateISO: string;
  photoDataUrl?: string;
}

type VaxNotif = { id: string; name: string; due: string | null };

type ApptNotif = { id: string; title: string; desc: string; date: string };

function toLocalDateFromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function classifyDue(dueISO: string | null, nearDays: number = 7): 'status-danger' | 'status-warn' | 'status-ok' {
  if (!dueISO) return 'status-ok';
  const today = startOfToday();
  const due = toLocalDateFromISO(dueISO);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'status-danger';
  if (diffDays <= nearDays) return 'status-warn';
  return 'status-ok';
}

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [specialNotes, setSpecialNotes] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [processingVaccine, setProcessingVaccine] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { vaccines: allVaccines, refreshVaccines } = useVaccineSync();

  useEffect(() => {
    const storedProfile = getProfile();
    if (storedProfile) {
      setProfile(storedProfile);
      setSpecialNotes(getSpecialNotes());
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const handleSaveNotes = () => { saveSpecialNotes(specialNotes); };

  const handleMarkVaccineDone = async (vaccineId: string) => {
    setProcessingVaccine(vaccineId);
    try {
      setAdministered(vaccineId, true);
      refreshVaccines();
      const vaccine = allVaccines.find(v => v.id === vaccineId);
      setSuccessMessage(`${vaccine?.name || 'Vaccine'} marked as administered!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally { setProcessingVaccine(null); }
  };

  const vaccineNotifications: VaxNotif[] = useMemo(() => {
    if (!profile?.birthdateISO) return [];
    return allVaccines
      .filter(vaccine => !vaccine.administered)
      .map(vaccine => {
        const dueDate = computeDueDateISO(vaccine.offsetMonths, profile);
        return { id: vaccine.id, name: vaccine.name, due: dueDate };
      })
      .filter(v => !!v.due) // keep all due dates (0-month, future, and overdue)
      .sort((a, b) => {
        const da = toLocalDateFromISO(a.due!);
        const db = toLocalDateFromISO(b.due!);
        return da.getTime() - db.getTime();
      })
      .slice(0, 50);
  }, [profile?.birthdateISO, allVaccines]);

  const appointmentNotifications: ApptNotif[] = useMemo(() => {
    const stored = localStorage.getItem('appointments');
    if (!stored) return [];
    try {
      const appointments = JSON.parse(stored);
      return appointments
        .filter((apt: any) => !apt.completed)
        .map((apt: any) => ({ id: apt.id, title: apt.title, desc: `${apt.doctor} - ${apt.specialty}`, date: apt.date }))
        .sort((a: ApptNotif, b: ApptNotif) => toLocalDateFromISO(a.date).getTime() - toLocalDateFromISO(b.date).getTime())
        .slice(0, 50);
    } catch { return []; }
  }, []);

  if (!profile) { return <div>Loading...</div>; }

  const birthDate = toLocalDateFromISO(profile.birthdateISO);
  const today = startOfToday();
  const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

  const lastBmi = latest();
  const bmiValue = lastBmi ? computeBmi(lastBmi.heightCm, lastBmi.weightKg) : 0;

  return (
    <div className="dashboard">
      <SideNav />
      <main className="dash-main">
        <header className="dash-header">
          <div className="date">{today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="welcome">Welcome back, {profile.childName}!</div>
        </header>

        <div className="dash-shell">
          <div className="dash-content">
            <section className="vaccines">
              <div className="section-header">
                <h2>Vaccines</h2>
                {successMessage && (
                  <div className="success-banner"><span className="success-icon">✓</span>{successMessage}</div>
                )}
              </div>
              <div className="feed notif-list hover-float scroll-panel">
                {vaccineNotifications.length === 0 ? (
                  <div className="notif status-ok">
                    <div className="icon" />
                    <div className="title">No scheduled vaccines yet</div>
                    <div className="meta">All vaccines are up to date!</div>
                  </div>
                ) : (
                  vaccineNotifications.map((n, idx) => {
                    const status = classifyDue(n.due);
                    return (
                      <div key={n.id + (n.due || '')} className={`notif ${status}`} style={{ animationDelay: `${idx * 60}ms` }}>
                        <div className="icon" />
                        <div className="vaccine-details">
                          <div className="title">{n.name}</div>
                          <div className="meta">Scheduled from birth</div>
                          <div className="meta">Due: {n.due}</div>
                        </div>
                        <button className="vaccine-done-btn" onClick={() => handleMarkVaccineDone(n.id)} disabled={processingVaccine === n.id}>
                          {processingVaccine === n.id ? 'Marking...' : 'Done'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="appointments">
              <h2>Doctors appointments</h2>
              <div className="feed notif-list hover-float scroll-panel">
                {appointmentNotifications.length === 0 ? (
                  <div className="notif status-ok">
                    <div className="icon" />
                    <div className="title">No upcoming appointments</div>
                    <div className="meta" />
                  </div>
                ) : (
                  appointmentNotifications.map((n, idx) => {
                    const status = classifyDue(n.date);
                    return (
                      <div key={n.id + n.date} className={`notif ${status}`} style={{ animationDelay: `${idx * 60}ms` }}>
                        <div className="icon" />
                        <div>
                          <div className="title">{n.title}</div>
                          <div className="meta">{n.desc}</div>
                        </div>
                        <div className="meta">Due {n.date}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <div className="dash-side">
            <div className="profile-card">
              <div className="profile-photo">
                {profile.photoDataUrl ? (
                  <img src={profile.photoDataUrl} alt={profile.childName} />
                ) : (
                  <div className="photo-placeholder">{profile.childName.charAt(0)}</div>
                )}
              </div>
              <div className="profile-info">
                <h3>{profile.childName}</h3>
                <p>{ageInMonths} months old</p>
              </div>
            </div>

            <div className="metrics">
              <div className="metric"><span className="label">Age</span><span className="value">{ageInMonths} months</span></div>
              <div className="metric"><span className="label">Height</span><span className="value">{lastBmi?.heightCm || '—'} cm</span></div>
              <div className="metric"><span className="label">Weight</span><span className="value">{lastBmi?.weightKg || '—'} kg</span></div>
              <div className="metric"><span className="label">BMI</span><span className="value">{bmiValue || '—'}</span></div>
            </div>

            <div className="notes">
              <h4>Special Notes</h4>
              <textarea value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} placeholder="Add any special notes about your child..." onBlur={handleSaveNotes} />
            </div>
          </div>
        </div>

        {showOnboarding && (
          <div className="modal-overlay" onClick={() => setShowOnboarding(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Welcome to Baby Vaccination Tracker!</h2>
              <p>Let's get started by setting up your child's profile.</p>
              <button onClick={() => setShowOnboarding(false)}>Get Started</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;


