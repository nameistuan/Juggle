'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-hover') // Clean up visual state natively if added
    
    const eventId = e.dataTransfer.getData('eventId')
    const eventStartTime = e.dataTransfer.getData('eventStartTime')
    if (!eventId || !eventStartTime) return
    
    // Extract original time components to preserve intra-day fidelity when dragging across months
    const originalDate = new Date(eventStartTime)
    const [yyyy, mm, dd] = dateStr.split('-').map(Number)
    
    const dropDate = new Date(yyyy, mm - 1, dd, originalDate.getHours(), originalDate.getMinutes(), 0)

    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: dropDate.toISOString() })
      })
      router.refresh()
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
      onDragOver={handleDragOver} 
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {children}
    </div>
  )
}
