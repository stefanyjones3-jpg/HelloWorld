import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Schedule.css'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const DEFAULT_EVENTS = [
  { id: '1', title: 'Take morning medicines', time: '08:00', icon: '💊', repeat: 'daily' },
  { id: '2', title: 'Breakfast', time: '08:30', icon: '🥞', repeat: 'daily' },
  { id: '3', title: 'Morning walk', time: '09:30', icon: '🚶', repeat: 'daily' },
  { id: '4', title: 'Lunch', time: '12:30', icon: '🥗', repeat: 'daily' },
  { id: '5', title: 'Rest time', time: '14:00', icon: '😴', repeat: 'daily' },
  { id: '6', title: 'Dinner', time: '18:00', icon: '🍽️', repeat: 'daily' },
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

export default function Schedule() {
  const [events, setEvents] = useLocalStorage('scheduleEvents', DEFAULT_EVENTS)
  const [done, setDone] = useLocalStorage(`scheduleDone_${todayKey()}`, {})
  const [showAdd, setShowAdd] = useState(false)

  const now = new Date()
  const dayName = DAYS[now.getDay()]
  const dateStr = `${MONTHS[now.getMonth()]} ${now.getDate()}`

  const toggle = (id) => setDone((prev) => ({ ...prev, [id]: !prev[id] }))
  const addEvent = (ev) => {
    setEvents((prev) => [...prev, { ...ev, id: Date.now().toString() }])
    setShowAdd(false)
  }
  const deleteEvent = (id) => setEvents((prev) => prev.filter((e) => e.id !== id))

  const sorted = [...events].sort((a, b) => a.time.localeCompare(b.time))

  const currentHour = now.getHours()
  const currentMin = now.getMinutes()
  const nowMins = currentHour * 60 + currentMin

  const upcoming = sorted.filter((e) => {
    const [h, m] = e.time.split(':').map(Number)
    return h * 60 + m >= nowMins && !done[e.id]
  })

  const nextEvent = upcoming[0]

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📅 My Schedule</h1>
        <p className="page-subtitle">{dayName}, {dateStr}</p>
      </div>

      {nextEvent && (
        <div className="next-up card">
          <p className="next-label">Coming up next</p>
          <div className="next-event">
            <span className="next-icon">{nextEvent.icon}</span>
            <div>
              <p className="next-title">{nextEvent.title}</p>
              <p className="next-time">{formatTime(nextEvent.time)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="timeline">
        {sorted.map((event) => {
          const [h, m] = event.time.split(':').map(Number)
          const evMins = h * 60 + m
          const isPast = evMins < nowMins
          const isDone = done[event.id]

          return (
            <div
              key={event.id}
              className={`timeline-item ${isPast || isDone ? 'past' : ''} ${isDone ? 'done' : ''}`}
            >
              <div className="timeline-time">{formatTime(event.time)}</div>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <button
                  className="event-row"
                  onClick={() => toggle(event.id)}
                  aria-pressed={isDone}
                >
                  <span className="event-icon">{event.icon}</span>
                  <span className="event-title">{event.title}</span>
                  {isDone && <span className="done-check">✓</span>}
                </button>
                <button className="event-delete" onClick={() => deleteEvent(event.id)} aria-label="Remove">✕</button>
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn btn-ghost btn-full" style={{ marginTop: 20 }} onClick={() => setShowAdd(true)}>
        + Add to Schedule
      </button>

      {showAdd && <AddEventModal onAdd={addEvent} onClose={() => setShowAdd(false)} />}
    </div>
  )
}

const ICONS = ['💊', '🥞', '🥗', '🍽️', '🚶', '😴', '📞', '🏠', '🎵', '📺', '🛁', '🚗', '👨‍⚕️', '💪', '📖']

function AddEventModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ title: '', time: '09:00', icon: '📅', repeat: 'daily' })
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Add Event</h2>
        <div className="form-group">
          <label className="label">Icon</label>
          <div className="icon-picker">
            {ICONS.map((ic) => (
              <button
                key={ic}
                className={`icon-btn ${form.icon === ic ? 'selected' : ''}`}
                onClick={() => setForm((f) => ({ ...f, icon: ic }))}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="label">Event Name *</label>
          <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Doctor's appointment" />
        </div>
        <div className="form-group">
          <label className="label">Time</label>
          <input className="input" type="time" value={form.time} onChange={set('time')} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => { if (form.title.trim()) onAdd(form) }}>Add</button>
        </div>
      </div>
    </div>
  )
}
