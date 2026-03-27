'use client'

import { useState, useEffect, useRef, startTransition, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './EventModal.module.css'
import { deleteEvent, updateEvent, pushCreate } from '@/lib/undoManager'

interface Project {
  id: string;
  name: string;
  color: string;
}

export default function EventModal({ 
  eventId, 
  onClose,
  initialDate,
  initialStartTime,
  initialEndTime
}: { 
  eventId?: string, 
  onClose: () => void,
  initialDate?: string,
  initialStartTime?: string,
  initialEndTime?: string
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(initialDate || new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState(initialStartTime || '09:00')
  const [endTime, setEndTime] = useState(initialEndTime || '10:00')
  const [projectId, setProjectId] = useState('')
  
  const [projects, setProjects] = useState<Project[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!eventId
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  const [modalPos, setModalPos] = useState<{ top: number; left: number } | null>(null)

  // Position the modal next to the clicked event
  useLayoutEffect(() => {
    const anchor = (window as any).__modalAnchor as { top: number; left: number; right: number; bottom: number; width: number; height: number } | undefined
    if (anchor && modalRef.current) {
      const modalW = 360
      const gap = 8
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Prefer right side, fallback to left
      let left: number
      if (anchor.right + gap + modalW < vw) {
        left = anchor.right + gap
      } else if (anchor.left - gap - modalW > 0) {
        left = anchor.left - gap - modalW
      } else {
        left = Math.max(8, (vw - modalW) / 2)
      }

      // Vertically align to top of event, clamped to viewport
      let top = anchor.top
      const modalH = modalRef.current.offsetHeight || 400
      if (top + modalH > vh - 16) {
        top = vh - modalH - 16
      }
      if (top < 8) top = 8

      setModalPos({ top, left })
    } else {
      // Centered fallback (for drag-to-create)
      const vw = window.innerWidth
      const vh = window.innerHeight
      setModalPos({ top: Math.max(100, vh * 0.15), left: Math.max(8, (vw - 360) / 2) })
    }

    // Clear anchor after use
    ;(window as any).__modalAnchor = undefined
  }, [])

  // Focus the modal container when editing so Delete key works
  useEffect(() => {
    if (isEditing && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error("Failed to fetch projects", err))
      
    if (eventId) {
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then(data => {
          const start = new Date(data.startTime)
          const end = new Date(data.endTime)
          setTitle(data.title)
          setDescription(data.description || '')
          setLocation(data.location || '')
          setDate(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`)
          setStartTime(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`)
          setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`)
          setProjectId(data.projectId || '')
        })
        .catch(err => console.error("Failed to load focal event", err))
    } else {
      if (initialDate) setDate(initialDate)
      if (initialStartTime) setStartTime(initialStartTime)
      if (initialEndTime) setEndTime(initialEndTime)
    }
  }, [eventId, initialDate, initialStartTime, initialEndTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const start = new Date(`${date}T${startTime}:00`).toISOString()
    const end = new Date(`${date}T${endTime}:00`).toISOString()

    try {
      if (isEditing && eventId) {
        const label = await updateEvent(eventId, {
          title,
          description,
          location,
          startTime: start,
          endTime: end,
          projectId: projectId || null,
        })
        if (label) {
          window.dispatchEvent(new CustomEvent('pac-toast', { detail: `Edited "${title}" — Press ⌘Z to undo` }))
        }
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            location: location || undefined,
            startTime: start,
            endTime: end,
            projectId: projectId || undefined
          })
        })
        const created = await res.json()
        pushCreate({
          id: created.id,
          title: created.title,
          description: created.description,
          location: created.location,
          startTime: created.startTime,
          endTime: created.endTime,
          projectId: created.projectId,
          taskId: created.taskId,
          isFluid: created.isFluid ?? false,
        })
      }
      
      onClose()
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!eventId) return
    setIsSubmitting(true)
    const success = await deleteEvent(eventId)
    if (success) {
      window.dispatchEvent(new CustomEvent('pac-toast', { detail: `Deleted "${title}" — Press ⌘Z to undo` }))
      onClose()
      startTransition(() => {
        router.refresh()
      })
    } else {
      setIsSubmitting(false)
    }
  }

  // SVG icons as inline elements
  const ClockIcon = () => (
    <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  )
  const MapPinIcon = () => (
    <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
  const NotesIcon = () => (
    <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
  const TagIcon = () => (
    <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div 
        className={styles.modalContent} 
        onMouseDown={(e) => e.stopPropagation()}
        tabIndex={-1}
        onKeyDown={(e) => {
          const tag = document.activeElement?.tagName
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
          if ((e.key === 'Delete' || e.key === 'Backspace') && isEditing) {
            e.preventDefault()
            handleDelete()
          }
        }}
        ref={modalRef}
        style={modalPos ? { top: modalPos.top, left: modalPos.left } : { top: '15%', left: '50%', transform: 'translateX(-50%)' }}
      >
        <form onSubmit={handleSubmit}>
          {/* Header: inline title */}
          <div className={styles.modalHeader}>
            <input
              className={styles.titleInput}
              type="text"
              required
              placeholder="Add title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus={!isEditing}
            />
            <button type="button" className={styles.closeButton} onClick={onClose}>&times;</button>
          </div>

          <div className={styles.modalBody}>
            {/* Time row */}
            <div className={styles.fieldRow}>
              <ClockIcon />
              <div className={styles.timeRow}>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                <span className={styles.timeSeparator}>–</span>
                <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>

            {/* Location */}
            <div className={styles.fieldRow}>
              <MapPinIcon />
              <input 
                type="text" 
                placeholder="Add location" 
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            {/* Notes / Description */}
            <div className={styles.fieldRow}>
              <NotesIcon />
              <textarea 
                className={styles.notesArea}
                placeholder="Add description or notes…" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Project tag pills */}
            <div className={styles.tagSection}>
              <TagIcon />
              <div className={styles.tagRow}>
                <button
                  type="button"
                  className={`${styles.tagPill} ${!projectId ? styles.tagPillActive : ''}`}
                  onClick={() => setProjectId('')}
                  style={!projectId ? { borderColor: 'var(--text-secondary)', color: 'var(--text-primary)' } : undefined}
                >
                  None
                </button>
                {projects.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    className={`${styles.tagPill} ${projectId === p.id ? styles.tagPillActive : ''}`}
                    onClick={() => setProjectId(p.id)}
                    style={projectId === p.id ? { borderColor: p.color, color: p.color } : undefined}
                  >
                    <span className={styles.tagDot} style={{ backgroundColor: p.color }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            {isEditing && (
              <button 
                type="button" 
                className={`${styles.cancelBtn} ${styles.deleteBtn}`} 
                onClick={handleDelete} 
                disabled={isSubmitting}
              >
                Delete
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
