import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './EmergencyContacts.css'

const DEFAULT_CONTACTS = [
  { id: '1', name: 'Emergency Services', phone: '911', relation: 'Emergency', icon: '🚨', primary: true },
  { id: '2', name: 'My Doctor', phone: '', relation: 'Doctor', icon: '👨‍⚕️', primary: false },
  { id: '3', name: 'Family Member', phone: '', relation: 'Family', icon: '👨‍👩‍👧', primary: false },
]

export default function EmergencyContacts() {
  const [contacts, setContacts] = useLocalStorage('emergencyContacts', DEFAULT_CONTACTS)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)

  const deleteContact = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  const addContact = (contact) => {
    setContacts((prev) => [...prev, { ...contact, id: Date.now().toString() }])
    setShowAdd(false)
  }

  const updateContact = (updated) => {
    setContacts((prev) => prev.map((c) => c.id === updated.id ? updated : c))
    setEditing(null)
  }

  const primaryContacts = contacts.filter((c) => c.primary)
  const otherContacts = contacts.filter((c) => !c.primary)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🆘 Get Help</h1>
        <p className="page-subtitle">Tap any button to call</p>
      </div>

      {/* Reassurance message */}
      <div className="reassurance-card card">
        <p className="reassurance-text">
          You are safe. If you need help, tap one of the buttons below and someone will come.
        </p>
      </div>

      {/* Primary / emergency contacts */}
      {primaryContacts.length > 0 && (
        <>
          <p className="section-label">Emergency</p>
          <div className="emergency-list">
            {primaryContacts.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onEdit={() => setEditing(c)}
                onDelete={() => deleteContact(c.id)}
                big
              />
            ))}
          </div>
        </>
      )}

      {otherContacts.length > 0 && (
        <>
          <p className="section-label">My People</p>
          <div className="contacts-list">
            {otherContacts.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onEdit={() => setEditing(c)}
                onDelete={() => deleteContact(c.id)}
              />
            ))}
          </div>
        </>
      )}

      <button className="btn btn-ghost btn-full" style={{ marginTop: 20 }} onClick={() => setShowAdd(true)}>
        + Add Contact
      </button>

      {showAdd && (
        <ContactModal
          onSave={addContact}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <ContactModal
          initial={editing}
          onSave={updateContact}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function ContactCard({ contact, onEdit, onDelete, big }) {
  const hasPhone = contact.phone && contact.phone.trim()

  return (
    <div className={`contact-card card ${big ? 'contact-big' : ''}`}>
      <div className="contact-info">
        <span className="contact-icon">{contact.icon}</span>
        <div>
          <p className="contact-name">{contact.name}</p>
          <p className="contact-relation">{contact.relation}</p>
          {hasPhone && <p className="contact-number">{contact.phone}</p>}
        </div>
      </div>
      <div className="contact-actions">
        {hasPhone ? (
          <a
            href={`tel:${contact.phone.replace(/\D/g, '')}`}
            className={`call-btn ${big ? 'call-btn-big' : ''}`}
          >
            📞 {big ? 'CALL NOW' : 'Call'}
          </a>
        ) : (
          <button className="setup-btn" onClick={onEdit}>Set phone #</button>
        )}
        <div className="card-meta-btns">
          <button className="icon-action-btn" onClick={onEdit}>✏️</button>
          <button className="icon-action-btn" onClick={onDelete}>🗑️</button>
        </div>
      </div>
    </div>
  )
}

function ContactModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', phone: '', relation: '', icon: '👤', primary: false
  })
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const icons = ['👤', '👨‍⚕️', '👨‍👩‍👧', '🚨', '💊', '🏠', '👮', '🧑‍🤝‍🧑']

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">{initial ? 'Edit Contact' : 'Add Contact'}</h2>

        <div className="form-group">
          <label className="label">Icon</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {icons.map((ic) => (
              <button
                key={ic}
                style={{
                  width: 44, height: 44, borderRadius: 10, border: form.icon === ic ? '2px solid var(--primary)' : '2px solid var(--border)',
                  background: form.icon === ic ? 'var(--primary-light)' : 'white', fontSize: '1.4rem', cursor: 'pointer'
                }}
                onClick={() => setForm((f) => ({ ...f, icon: ic }))}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="label">Name *</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Dr. Smith" />
        </div>
        <div className="form-group">
          <label className="label">Relationship</label>
          <input className="input" value={form.relation} onChange={set('relation')} placeholder="e.g. Doctor, Daughter" />
        </div>
        <div className="form-group">
          <label className="label">Phone Number</label>
          <input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="e.g. 555-1234" />
        </div>
        <div className="form-group">
          <label className="checkbox-row" style={{ borderBottom: 'none', paddingTop: 0 }}>
            <input
              type="checkbox"
              className="checkbox"
              checked={form.primary}
              onChange={(e) => setForm((f) => ({ ...f, primary: e.target.checked }))}
            />
            <span>Show as Emergency contact (large red button)</span>
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={() => { if (form.name.trim()) onSave(form) }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
