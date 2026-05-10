import { useState, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './FamilyFaces.css'

const DEFAULT_FAMILY = [
  { id: '1', name: 'Sarah', relation: 'Daughter', phone: '', photo: '', note: 'Lives nearby, visits on Sundays.' },
  { id: '2', name: 'Michael', relation: 'Son', phone: '', photo: '', note: 'Calls every Tuesday evening.' },
]

export default function FamilyFaces() {
  const [members, setMembers] = useLocalStorage('familyMembers', DEFAULT_FAMILY)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [cameraMode, setCameraMode] = useState(false)

  const openMember = (m) => setSelected(m)
  const closeMember = () => setSelected(null)

  const addMember = (member) => {
    setMembers((prev) => [...prev, { ...member, id: Date.now().toString() }])
    setShowAdd(false)
  }

  const deleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setSelected(null)
  }

  if (cameraMode) {
    return <CameraIdentify members={members} onBack={() => setCameraMode(false)} />
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👨‍👩‍👧 My Family</h1>
        <p className="page-subtitle">People who love you</p>
      </div>

      <button
        className="btn btn-primary btn-full identify-btn"
        onClick={() => setCameraMode(true)}
      >
        📷 Who is this person?
      </button>

      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No family members yet</h3>
          <p>Ask a caregiver to add your family photos.</p>
        </div>
      ) : (
        <div className="family-grid">
          {members.map((m) => (
            <button key={m.id} className="family-card" onClick={() => openMember(m)}>
              <div className="family-photo">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="photo-img" />
                ) : (
                  <span className="photo-placeholder">{m.name[0]}</span>
                )}
              </div>
              <p className="family-name">{m.name}</p>
              <p className="family-relation">{m.relation}</p>
            </button>
          ))}
        </div>
      )}

      <button
        className="btn btn-ghost btn-full"
        style={{ marginTop: 20 }}
        onClick={() => setShowAdd(true)}
      >
        + Add Family Member
      </button>

      {selected && (
        <MemberDetail
          member={selected}
          onClose={closeMember}
          onDelete={() => deleteMember(selected.id)}
        />
      )}

      {showAdd && (
        <AddMemberModal
          onAdd={addMember}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

function MemberDetail({ member, onClose, onDelete }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="member-detail-photo">
          {member.photo ? (
            <img src={member.photo} alt={member.name} className="detail-photo-img" />
          ) : (
            <span className="detail-placeholder">{member.name[0]}</span>
          )}
        </div>
        <h2 className="detail-name">{member.name}</h2>
        <p className="detail-relation">{member.relation}</p>
        {member.note && <p className="detail-note">"{member.note}"</p>}
        {member.phone && (
          <a href={`tel:${member.phone}`} className="btn btn-success btn-full" style={{ marginTop: 16 }}>
            📞 Call {member.name}
          </a>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button className="btn btn-danger" onClick={onDelete}>Remove</button>
        </div>
      </div>
    </div>
  )
}

function AddMemberModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', relation: '', phone: '', note: '', photo: '' })
  const fileRef = useRef()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm((f) => ({ ...f, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const submit = () => {
    if (!form.name.trim()) return
    onAdd(form)
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Add Family Member</h2>

        <div className="photo-upload-area" onClick={() => fileRef.current.click()}>
          {form.photo ? (
            <img src={form.photo} alt="preview" className="upload-preview" />
          ) : (
            <div className="upload-placeholder">
              <span style={{ fontSize: '2.5rem' }}>📷</span>
              <p>Tap to add photo</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />

        <div className="form-group">
          <label className="label">Name *</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Sarah" />
        </div>
        <div className="form-group">
          <label className="label">Relationship</label>
          <input className="input" value={form.relation} onChange={set('relation')} placeholder="e.g. Daughter, Son, Friend" />
        </div>
        <div className="form-group">
          <label className="label">Phone Number</label>
          <input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="e.g. 555-1234" />
        </div>
        <div className="form-group">
          <label className="label">Note</label>
          <textarea className="input" value={form.note} onChange={set('note')} placeholder="A helpful reminder about this person..." rows={2} style={{ resize: 'none' }} />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit}>Add</button>
        </div>
      </div>
    </div>
  )
}

function CameraIdentify({ members, onBack }) {
  const videoRef = useRef()
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      videoRef.current.srcObject = s
      setStream(s)
      setStarted(true)
    } catch {
      setError('Camera not available. Please check permissions.')
    }
  }

  const stopAndBack = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop())
    onBack()
  }

  return (
    <div className="page">
      <div className="camera-header">
        <button className="back-btn" onClick={stopAndBack}>← Back</button>
        <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Who is this?</h2>
      </div>

      <div className="camera-box">
        {error ? (
          <div className="camera-error">{error}</div>
        ) : started ? (
          <video ref={videoRef} autoPlay playsInline className="camera-video" />
        ) : (
          <div className="camera-start">
            <span style={{ fontSize: '3rem' }}>📷</span>
            <p>Point the camera at the person</p>
            <button className="btn btn-primary" onClick={startCamera} style={{ marginTop: 16 }}>
              Open Camera
            </button>
          </div>
        )}
      </div>

      <p className="section-label">Your Family Members</p>
      <div className="camera-family-scroll">
        {members.map((m) => (
          <div key={m.id} className="camera-member-chip">
            <div className="chip-photo">
              {m.photo ? <img src={m.photo} alt={m.name} /> : <span>{m.name[0]}</span>}
            </div>
            <div>
              <p className="chip-name">{m.name}</p>
              <p className="chip-relation">{m.relation}</p>
            </div>
          </div>
        ))}
        {members.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No family members added yet.</p>}
      </div>
    </div>
  )
}
