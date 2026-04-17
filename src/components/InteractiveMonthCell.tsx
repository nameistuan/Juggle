'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { updateEvent, createEvent } from '@/lib/undoManager'

export default function InteractiveMonthCell({ 
  dateStr, 
  className, 
  children 
}: { 
  dateStr: string, 
  className: string, 
  children: ReactNode 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleClick = (e: React.MouseEvent) => {
    // Don't open create modal if clicking on an event badge
    let el = e.target as HTMLElement | null
    while (el && el !== e.currentTarget) {
      if (el.tagName === 'A' || el.getAttribute('data-event-block') === 'true') return
      el = el.parentElement
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('create', 'true')
    params.set('createDate', dateStr)
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-hover') // Clean up visual state natively if added
    
    const eventId = e.dataTransfer.getData('eventId')
    const taskId = e.dataTransfer.getData('taskId')
    const taskTitle = e.dataTransfer.getData('taskTitle')
    const eventStartTime = e.dataTransfer.getData('eventStartTime')
    const eventDurationMsRaw = e.dataTransfer.getData('eventDurationMs') // Also bind duration natively for integrity
    
    if (!eventId && !taskId) return
    
    const durationMs = eventDurationMsRaw ? parseInt(eventDurationMsRaw) : 3600000

    // Extract original time components to preserve intra-day fidelity when dragging across months
    const originalDate = eventStartTime ? new Date(eventStartTime) : new Date(new Date().setHours(8, 0, 0, 0))
    const [yyyy, mm, dd] = dateStr.split('-').map(Number)
    
    const dropStartDate = new Date(yyyy, mm - 1, dd, originalDate.getHours(), originalDate.getMinutes(), 0)
    const dropEndDate = new Date(dropStartDate.getTime() + durationMs)

    try {
      if (eventId) {
        const label = await updateEvent(eventId, {
          startTime: dropStartDate.toISOString(),
          endTime: dropEndDate.toISOString()
        })
        if (label) {
          window.dispatchEvent(new CustomEvent('pac-toast', { detail: `Moved "${label}" — Press ⌘Z to undo` }))
        }
      } else if (taskId) {
        const newEventId = await createEvent({
          title: taskTitle || 'Task Block',
          description: null,
          location: null,
          startTime: dropStartDate.toISOString(),
          endTime: dropEndDate.toISOString(),
          projectId: null,
          taskId: taskId,
          isFluid: false
        })
        
        try {
          await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'IN_PROGRESS' })
          });
          window.dispatchEvent(new CustomEvent('pac-task-updated'))
        } catch (err) {
          console.error('Failed to update task status to IN_PROGRESS on drop', err)
        }

        if (newEventId) {
          window.dispatchEvent(new CustomEvent('pac-toast', { detail: `Blocked time for "${taskTitle}" — Press ⌘Z to undo` }))
        }
      }
      await router.refresh()
    } catch (err) {
      console.error("Failed to execute Month DND swap", err)
    }
  }

  // Add subtle native hover feedback
  const handleDragEnter = (e: React.DragEvent) => {
    e.currentTarget.classList.add('drag-hover')
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-hover')
  }

  return (
    <div
      className={className}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      style={{ cursor: 'default' }}
    >
      {children}
    </div>
  )
}
