import { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Home.css'

function getGreeting(hour) {
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function Home({ setActiveTab }) {
  const [now, setNow] = useState(new Date())
  const [name] = useLocalStorage('userName', 'Friend')

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hour = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  const dayName = DAYS[now.getDay()]
  const monthName = MONTHS[now.getMonth()]
  const dateNum = now.getDate()
  const year = now.getFullYear()

  const quickLinks = [
    { id: 'medications', label: 'My Medicines', icon: '💊', color: '#4A90D9' },
    { id: 'family', label: 'My Family', icon: '👨‍👩‍👧', color: '#8B5CF6' },
    { id: 'schedule', label: 'My Schedule', icon: '📅', color: '#27AE60' },
    { id: 'emergency', label: 'Get Help', icon: '🆘', color: '#DC3545' },
  ]

  return (
    <div className="home-page">
      <div className="greeting-card">
        <p className="greeting-text">{getGreeting(hour)},</p>
        <p className="greeting-name">{name}</p>
        <div className="clock">{hour12}:{minutes} <span className="ampm">{ampm}</span></div>
        <div className="date-display">
          {dayName}, {monthName} {dateNum}, {year}
        </div>
      </div>

      <div className="quick-links">
        {quickLinks.map((link) => (
          <button
            key={link.id}
            className="quick-link-btn"
            style={{ '--link-color': link.color }}
            onClick={() => setActiveTab(link.id)}
          >
            <span className="quick-icon">{link.icon}</span>
            <span className="quick-label">{link.label}</span>
          </button>
        ))}
      </div>

      <WeatherOrNote />
    </div>
  )
}

function WeatherOrNote() {
  const [note, setNote] = useLocalStorage('dailyNote', '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note)

  const save = () => {
    setNote(draft)
    setEditing(false)
  }

  return (
    <div className="daily-note card">
      <div className="note-header">
        <span>📝 Today's Note</span>
        {!editing && (
          <button className="edit-btn" onClick={() => { setDraft(note); setEditing(true) }}>
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <>
          <textarea
            className="input note-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a note for today..."
            rows={3}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <p className="note-content">
          {note || 'Tap "Edit" to write a note for today.'}
        </p>
      )}
    </div>
  )
}
