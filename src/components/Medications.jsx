import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Medications.css'

const DEFAULT_MEDS = [
  { id: '1', name: 'Donepezil', dose: '10mg', times: ['08:00'], instructions: 'Take with breakfast', color: '#4A90D9' },
  { id: '2', name: 'Vitamin D', dose: '1000 IU', times: ['08:00'], instructions: 'Take with food', color: '#F39C12' },
]

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function Medications() {
  const [meds, setMeds] = useLocalStorage('medications', DEFAULT_MEDS)
  const [taken, setTaken] = useLocalStorage(`medsTaken_${todayKey()}`, {})
  const [showAdd, setShowAdd] = useState(false)
  const [notifGranted, setNotifGranted] = useState(Notification.permission === 'granted')

  const requestNotifications = async () => {
    const perm = await Notification.requestPermission()
    setNotifGranted(perm === 'granted')
  }

  const toggleTaken = (medId, time) => {
    const key = `${medId}_${time}`
    setTaken((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isTaken = (medId, time) => !!taken[`${medId}_${time}`]

  const addMed = (med) => {
    setMeds((prev) => [...prev, { ...med, id: Date.now().toString() }])
    setShowAdd(false)
  }

  const deleteMed = (id) => {
    setMeds((prev) => prev.filter((m) => m.id !== id))
  }

  const allTodayCount = meds.reduce((a, m) => a + m.times.length, 0)
  const takenCount = meds.reduce((a, m) =>
    a + m.times.filter((t) => isTaken(m.id, t)).length, 0)

  // Reminder check every minute
  useEffect(() => {
    if (!notifGranted) return
    const check = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      meds.forEach((med) => {
        med.times.forEach((t) => {
          if (t === currentTime && !isTaken(med.id, t)) {
            new Notification(`💊 Time for ${med.name}`, {
              body: `${med.dose} — ${med.instructions || 'Take your medication'}`,
              icon: '/favicon.svg',
            })
          }
        })
      })
    }
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [meds, taken, notifGranted])

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">💊 My Medicines</h1>
        <p className="page-subtitle">Stay on track every day</p>
      </div>

      {/* Progress */}
      <div className="med-progress card">
        <div className="progress-text">
          <span>{takenCount} of {allTodayCount} taken today</span>
          {takenCount === allTodayCount && allTodayCount > 0 && (
            <span className="badge badge-success">All done! ✓</span>
          )}
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: allTodayCount ? `${(takenCount / allTodayCount) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Notification prompt */}
      {!notifGranted && (
        <button className="notif-banner" onClick={requestNotifications}>
          🔔 Turn on reminders so you never miss a medicine
        </button>
      )}

      {/* Medication list */}
      {meds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3>No medicines added</h3>
          <p>Ask a caregiver to add your medicines.</p>
        </div>
      ) : (
        <div className="med-list">
          {meds.map((med) => (
            <div key={med.id} className="med-card card" style={{ '--med-color': med.color }}>
              <div className="med-header">
                <div className="med-dot" />
                <div className="med-info">
                  <p className="med-name">{med.name}</p>
                  <p className="med-dose">{med.dose}</p>
                  {med.instructions && <p className="med-instructions">{med.instructions}</p>}
                </div>
                <button className="delete-btn" onClick={() => deleteMed(med.id)} aria-label="Remove">✕</button>
              </div>
              <div className="med-times">
                {med.times.map((t) => (
                  <button
                    key={t}
                    className={`time-pill ${isTaken(med.id, t) ? 'taken' : ''}`}
                    onClick={() => toggleTaken(med.id, t)}
                  >
                    {isTaken(med.id, t) ? '✓ ' : ''}{formatTime(t)}
                    <span className="pill-sub">{isTaken(med.id, t) ? 'Taken' : 'Not yet'}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-ghost btn-full" style={{ marginTop: 20 }} onClick={() => setShowAdd(true)}>
        + Add Medicine
      </button>

      {showAdd && <AddMedModal onAdd={addMed} onClose={() => setShowAdd(false)} />}
    </div>
  )
}

const COLORS = ['#4A90D9', '#27AE60', '#E8935A', '#8B5CF6', '#F39C12', '#DC3545']

function AddMedModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', dose: '', instructions: '', times: ['08:00'], color: COLORS[0] })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const setTime = (i) => (e) => setForm((f) => {
    const times = [...f.times]
    times[i] = e.target.value
    return { ...f, times }
  })
  const addTime = () => setForm((f) => ({ ...f, times: [...f.times, '12:00'] }))
  const removeTime = (i) => setForm((f) => ({ ...f, times: f.times.filter((_, idx) => idx !== i) }))

  const submit = () => {
    if (!form.name.trim()) return
    onAdd(form)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Add Medicine</h2>
        <div className="form-group">
          <label className="label">Medicine Name *</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Donepezil" />
        </div>
        <div className="form-group">
          <label className="label">Dose</label>
          <input className="input" value={form.dose} onChange={set('dose')} placeholder="e.g. 10mg" />
        </div>
        <div className="form-group">
          <label className="label">Instructions</label>
          <input className="input" value={form.instructions} onChange={set('instructions')} placeholder="e.g. Take with food" />
        </div>
        <div className="form-group">
          <label className="label">Time(s)</label>
          {form.times.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" type="time" value={t} onChange={setTime(i)} style={{ flex: 1 }} />
              {form.times.length > 1 && (
                <button onClick={() => removeTime(i)} style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', borderRadius: 8, padding: '0 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>✕</button>
              )}
            </div>
          ))}
          <button className="btn btn-ghost" style={{ marginTop: 4, padding: '10px 16px', fontSize: '0.95rem' }} onClick={addTime}>+ Add Time</button>
        </div>
        <div className="form-group">
          <label className="label">Color</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #333' : '2px solid transparent', cursor: 'pointer'
                }}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
              />
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit}>Add</button>
        </div>
      </div>
    </div>
  )
}
