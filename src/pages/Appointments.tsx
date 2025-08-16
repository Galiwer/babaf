import React, { useState, useEffect } from 'react';
import SideNav from '../components/SideNav';
import './appointments.css';

interface Appointment {
  id: string;
  title: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  notes: string;
  completed: boolean;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    doctor: '',
    specialty: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    const stored = localStorage.getItem('appointments');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch {
        setAppointments([]);
      }
    }
  };

  const saveAppointments = (appts: Appointment[]) => {
    localStorage.setItem('appointments', JSON.stringify(appts));
    setAppointments(appts);
  };

  const handleAddAppointment = () => {
    if (!newAppointment.title || !newAppointment.doctor || !newAppointment.date) {
      alert('Please fill in all required fields');
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      ...newAppointment,
      completed: false
    };

    const updated = [...appointments, appointment];
    saveAppointments(updated);
    
    setNewAppointment({
      title: '',
      doctor: '',
      specialty: '',
      date: '',
      time: '',
      notes: ''
    });
    setShowAddModal(false);
  };

  const handleToggleComplete = (id: string) => {
    const updated = appointments.map(apt => 
      apt.id === id ? { ...apt, completed: !apt.completed } : apt
    );
    saveAppointments(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      const updated = appointments.filter(apt => apt.id !== id);
      saveAppointments(updated);
    }
  };

  const upcomingAppointments = appointments.filter(apt => !apt.completed);
  const completedAppointments = appointments.filter(apt => apt.completed);

  return (
    <div className="appointments-page">
      <SideNav />
      <main className="appointments-main">
        <header className="appointments-header">
          <h1>Doctor Appointments</h1>
          <button 
            className="add-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Add Appointment
          </button>
        </header>

        <div className="appointments-content">
          <section className="upcoming">
            <h2>Upcoming Appointments</h2>
            {upcomingAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No upcoming appointments</p>
                <button onClick={() => setShowAddModal(true)}>Schedule your first appointment</button>
              </div>
            ) : (
              <div className="appointments-list">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-info">
                      <h3>{appointment.title}</h3>
                      <p className="doctor">{appointment.doctor} - {appointment.specialty}</p>
                      <p className="datetime">{appointment.date} at {appointment.time}</p>
                      {appointment.notes && <p className="notes">{appointment.notes}</p>}
                    </div>
                    <div className="appointment-actions">
                      <button 
                        className="complete-btn"
                        onClick={() => handleToggleComplete(appointment.id)}
                      >
                        Mark Complete
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {completedAppointments.length > 0 && (
            <section className="completed">
              <h2>Completed Appointments</h2>
              <div className="appointments-list">
                {completedAppointments.map(appointment => (
                  <div key={appointment.id} className="appointment-card completed">
                    <div className="appointment-info">
                      <h3>{appointment.title}</h3>
                      <p className="doctor">{appointment.doctor} - {appointment.specialty}</p>
                      <p className="datetime">{appointment.date} at {appointment.time}</p>
                      {appointment.notes && <p className="notes">{appointment.notes}</p>}
                    </div>
                    <div className="appointment-actions">
                      <button 
                        className="undo-btn"
                        onClick={() => handleToggleComplete(appointment.id)}
                      >
                        Mark Incomplete
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Add Appointment Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Add New Appointment</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddAppointment(); }}>
                <div className="form-group">
                  <label>Appointment Title *</label>
                  <input
                    type="text"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                    placeholder="e.g., Vaccination Checkup"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Doctor Name *</label>
                  <input
                    type="text"
                    value={newAppointment.doctor}
                    onChange={(e) => setNewAppointment({...newAppointment, doctor: e.target.value})}
                    placeholder="e.g., Dr. Smith"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Specialty</label>
                  <input
                    type="text"
                    value={newAppointment.specialty}
                    onChange={(e) => setNewAppointment({...newAppointment, specialty: e.target.value})}
                    placeholder="e.g., Pediatrics"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">
                    Add Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Appointments;
