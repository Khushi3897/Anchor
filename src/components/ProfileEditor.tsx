// src/components/ProfileEditor.tsx — full Life Profile editor
import { useState, useRef } from 'react'
import type { LifeProfile, Caregiver, Person, Visitor, PhotoCard, GentleResponse } from '../lib/types'
import { loadProfile, saveProfile } from '../lib/storage'
import { demoPersona } from '../data/demoPersona'

const EMPTY_PROFILE: LifeProfile = {
  patientName: '',
  primaryCaregiver: { name: '', relationship: '', phone: '' },
  additionalCaregivers: [],
  locationText: '',
  reassuranceText: '',
  todayPlan: '',
  visitors: [],
  people: [],
  comfortItems: ['', '', '', '', ''],
  photoCards: [],
  gentleResponses: [],
  isDemoPersona: false,
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ProfileEditor() {
  const saved = loadProfile()
  const [profile, setProfile] = useState<LifeProfile>(saved ?? EMPTY_PROFILE)
  const [errors, setErrors] = useState<string[]>([])
  const [saved_, setSaved_] = useState(false)

  const update = (patch: Partial<LifeProfile>) =>
    setProfile((p) => ({ ...p, ...patch }))

  const updateCaregiver = (patch: Partial<Caregiver>) =>
    update({ primaryCaregiver: { ...profile.primaryCaregiver, ...patch } })

  // ── Save ─────────────────────────────────────────────────────────
  function handleSave() {
    const errs: string[] = []
    if (!profile.patientName.trim()) errs.push('Patient name is required.')
    if (!profile.primaryCaregiver.name.trim()) errs.push('Primary caregiver name is required.')
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    saveProfile(profile)
    setSaved_(true)
    setTimeout(() => setSaved_(false), 2000)
  }

  // ── Demo persona ──────────────────────────────────────────────────
  function handleLoadDemo() {
    const existing = loadProfile()
    if (existing && (existing.patientName || existing.primaryCaregiver.name)) {
      if (!window.confirm('This will replace your existing profile with demo data. Continue?')) return
    }
    const demo = { ...demoPersona, isDemoPersona: true }
    saveProfile(demo)
    setProfile(demo)
  }

  // ── Photo upload helpers ─────────────────────────────────────────
  const caregiverPhotoRef = useRef<HTMLInputElement>(null)
  async function handleCaregiverPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file)
    updateCaregiver({ photoUrl: url })
  }

  // ── People ───────────────────────────────────────────────────────
  function addPerson() {
    if (profile.people.length >= 20) return
    update({ people: [...profile.people, { name: '', relationship: '', warmSentence: '' }] })
  }
  function updatePerson(i: number, patch: Partial<Person>) {
    const people = [...profile.people]
    people[i] = { ...people[i], ...patch }
    update({ people })
  }
  function removePerson(i: number) {
    update({ people: profile.people.filter((_, idx) => idx !== i) })
  }
  async function handlePersonPhoto(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file)
    updatePerson(i, { photoUrl: url })
  }

  // ── Visitors ─────────────────────────────────────────────────────
  function addVisitor() {
    if (profile.visitors.length >= 10) return
    update({ visitors: [...profile.visitors, { name: '' }] })
  }
  function updateVisitor(i: number, patch: Partial<Visitor>) {
    const visitors = [...profile.visitors]
    visitors[i] = { ...visitors[i], ...patch }
    update({ visitors })
  }
  function removeVisitor(i: number) {
    update({ visitors: profile.visitors.filter((_, idx) => idx !== i) })
  }

  // ── Photo cards ──────────────────────────────────────────────────
  async function handleAddPhotoCard(e: React.ChangeEvent<HTMLInputElement>) {
    if (profile.photoCards.length >= 6) return
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file)
    update({ photoCards: [...profile.photoCards, { imageUrl: url, caption: '' }] })
    e.target.value = ''  // reset input
  }
  function updateCaption(i: number, caption: string) {
    const cards = [...profile.photoCards]
    cards[i] = { ...cards[i], caption }
    update({ photoCards: cards })
  }
  function removePhotoCard(i: number) {
    update({ photoCards: profile.photoCards.filter((_, idx) => idx !== i) })
  }

  // ── Gentle responses ─────────────────────────────────────────────
  function addGentleResponse() {
    if (profile.gentleResponses.length >= 20) return
    update({ gentleResponses: [...profile.gentleResponses, { triggerTopic: '', replyText: '' }] })
  }
  function updateGentleResponse(i: number, patch: Partial<GentleResponse>) {
    const gr = [...profile.gentleResponses]
    gr[i] = { ...gr[i], ...patch }
    update({ gentleResponses: gr })
  }
  function removeGentleResponse(i: number) {
    update({ gentleResponses: profile.gentleResponses.filter((_, idx) => idx !== i) })
  }

  return (
    <div>
      {profile.isDemoPersona && (
        <div className="demo-notice" role="status">
          📋 This is fictional demo data for demonstration purposes only. No real people are represented.
        </div>
      )}

      {errors.length > 0 && (
        <div role="alert" style={{ marginBottom: 'var(--space-md)' }}>
          {errors.map((e) => <p key={e} className="form-error">⚠️ {e}</p>)}
        </div>
      )}

      {/* ── Identity ── */}
      <div className="form-section">
        <h2>Patient &amp; Caregiver</h2>

        <div className="form-group">
          <label className="form-label" htmlFor="patientName">Patient's preferred name *</label>
          <input id="patientName" className="form-input" maxLength={50}
            value={profile.patientName}
            onChange={(e) => update({ patientName: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cgName">Your name *</label>
          <input id="cgName" className="form-input" maxLength={50}
            value={profile.primaryCaregiver.name}
            onChange={(e) => updateCaregiver({ name: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cgRel">Your relationship</label>
          <input id="cgRel" className="form-input" maxLength={30}
            placeholder="e.g. daughter"
            value={profile.primaryCaregiver.relationship}
            onChange={(e) => updateCaregiver({ relationship: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cgPhone">Your phone number</label>
          <input id="cgPhone" className="form-input" type="tel"
            value={profile.primaryCaregiver.phone}
            onChange={(e) => updateCaregiver({ phone: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label">Your photo</label>
          {profile.primaryCaregiver.photoUrl && (
            <img className="photo-preview" src={profile.primaryCaregiver.photoUrl} alt="Caregiver" />
          )}
          <input ref={caregiverPhotoRef} type="file" accept="image/jpeg,image/png"
            style={{ marginTop: 'var(--space-xs)' }}
            onChange={handleCaregiverPhoto} />
        </div>
      </div>

      {/* ── Location ── */}
      <div className="form-section">
        <h2>Home &amp; Reassurance</h2>
        <div className="form-group">
          <label className="form-label" htmlFor="location">Where they live (one sentence)</label>
          <input id="location" className="form-input" maxLength={150}
            placeholder="e.g. You are at home at 42 Oak Street."
            value={profile.locationText}
            onChange={(e) => update({ locationText: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reassurance">Reassurance phrase</label>
          <input id="reassurance" className="form-input" maxLength={150}
            placeholder="e.g. You are safe at home."
            value={profile.reassuranceText}
            onChange={(e) => update({ reassuranceText: e.target.value })} />
        </div>
      </div>

      {/* ── Today Card ── */}
      <div className="form-section">
        <h2>Today</h2>
        <p style={{ fontSize: 22, marginBottom: 'var(--space-sm)', color: 'var(--color-text-muted)' }}>
          📅 {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor="todayPlan">Today's plan</label>
          <textarea id="todayPlan" className="form-textarea" maxLength={280}
            placeholder="e.g. We are having lunch at home and watching TV this afternoon."
            value={profile.todayPlan}
            onChange={(e) => update({ todayPlan: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label">Expected visitors</label>
          {profile.visitors.map((v, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)', alignItems: 'center' }}>
              <input className="form-input" maxLength={50} placeholder="Name"
                value={v.name} onChange={(e) => updateVisitor(i, { name: e.target.value })}
                style={{ flex: 2 }} />
              <input className="form-input" maxLength={20} placeholder="Time (e.g. 2:00 pm)"
                value={v.arrivalTime ?? ''} onChange={(e) => updateVisitor(i, { arrivalTime: e.target.value })}
                style={{ flex: 1 }} />
              <button className="btn btn--small btn--danger" onClick={() => removeVisitor(i)}>Remove</button>
            </div>
          ))}
          {profile.visitors.length < 10 && (
            <button className="btn btn--secondary btn--small" onClick={addVisitor}>+ Add visitor</button>
          )}
        </div>
      </div>

      {/* ── People ── */}
      <div className="form-section">
        <h2>Important people</h2>
        <div className="people-list">
          {profile.people.map((person, i) => (
            <div key={i} className="person-card">
              <div>
                {person.photoUrl
                  ? <img className="person-photo-preview" src={person.photoUrl} alt={person.name} />
                  : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👤</div>
                }
                <input type="file" accept="image/jpeg,image/png"
                  style={{ marginTop: 8, width: 80 }}
                  onChange={(e) => handlePersonPhoto(i, e)} />
              </div>
              <div className="person-fields">
                <input className="form-input" maxLength={50} placeholder="Name"
                  value={person.name} onChange={(e) => updatePerson(i, { name: e.target.value })} />
                <input className="form-input" maxLength={30} placeholder="Relationship"
                  value={person.relationship} onChange={(e) => updatePerson(i, { relationship: e.target.value })} />
                <input className="form-input" maxLength={100} placeholder="One warm sentence about them"
                  value={person.warmSentence} onChange={(e) => updatePerson(i, { warmSentence: e.target.value })} />
                <button className="btn btn--small btn--danger" onClick={() => removePerson(i)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {profile.people.length < 20 && (
          <button className="btn btn--secondary btn--small" style={{ marginTop: 'var(--space-sm)' }} onClick={addPerson}>
            + Add person
          </button>
        )}
      </div>

      {/* ── Comfort Items ── */}
      <div className="form-section">
        <h2>Favourite comfort items</h2>
        {profile.comfortItems.map((item, i) => (
          <div key={i} className="form-group">
            <label className="form-label" htmlFor={`comfort-${i}`}>Item {i + 1}</label>
            <input id={`comfort-${i}`} className="form-input" maxLength={60}
              placeholder="e.g. Cup of tea"
              value={item}
              onChange={(e) => {
                const items = [...profile.comfortItems]
                items[i] = e.target.value
                update({ comfortItems: items })
              }} />
          </div>
        ))}
      </div>

      {/* ── Photo Cards ── */}
      <div className="form-section">
        <h2>Photo cards (0–6)</h2>
        <div className="photo-cards-grid">
          {profile.photoCards.map((card: PhotoCard, i: number) => (
            <div key={i} className="photo-card-item">
              <img className="photo-card-img" src={card.imageUrl} alt={card.caption}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <input className="photo-card-caption-input" maxLength={80}
                placeholder="Caption…"
                value={card.caption}
                onChange={(e) => updateCaption(i, e.target.value)} />
              <button className="btn btn--small btn--danger"
                style={{ margin: 'var(--space-xs)', width: 'calc(100% - 16px)' }}
                onClick={() => removePhotoCard(i)}>Remove</button>
            </div>
          ))}
        </div>
        {profile.photoCards.length < 6 ? (
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <label className="btn btn--secondary btn--small" style={{ cursor: 'pointer', display: 'inline-block' }}>
              + Add photo card
              <input type="file" accept="image/jpeg,image/png" style={{ display: 'none' }}
                onChange={handleAddPhotoCard} />
            </label>
          </div>
        ) : (
          <p className="form-error" style={{ marginTop: 'var(--space-sm)' }}>
            Maximum of 6 photo cards reached.
          </p>
        )}
      </div>

      {/* ── Gentle Responses ── */}
      <div className="form-section">
        <h2>Gentle responses</h2>
        <p style={{ fontSize: 22, color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
          Write the exact reply Anchor will use for painful questions (e.g. asking about a loved one who has passed, or wanting to go home).
        </p>
        <div className="gentle-list">
          {profile.gentleResponses.map((gr, i) => (
            <div key={i} className="gentle-item">
              <input className="form-input" maxLength={60} placeholder='Topic (e.g. "Asking about Mum")'
                value={gr.triggerTopic}
                onChange={(e) => updateGentleResponse(i, { triggerTopic: e.target.value })} />
              <textarea className="form-textarea" maxLength={300} placeholder="Exact reply Anchor will use…"
                value={gr.replyText}
                onChange={(e) => updateGentleResponse(i, { replyText: e.target.value })} />
              <button className="btn btn--small btn--danger" onClick={() => removeGentleResponse(i)}>Remove</button>
            </div>
          ))}
        </div>
        {profile.gentleResponses.length < 20 && (
          <button className="btn btn--secondary btn--small" style={{ marginTop: 'var(--space-sm)' }} onClick={addGentleResponse}>
            + Add gentle response
          </button>
        )}
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-lg)' }}>
        <button className="btn btn--primary" onClick={handleSave}>
          {saved_ ? '✓ Saved!' : 'Save profile'}
        </button>
        <button className="btn btn--secondary" onClick={handleLoadDemo}>
          Load demo persona
        </button>
      </div>
    </div>
  )
}
