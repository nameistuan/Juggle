'use client'

import React, { ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InteractiveDayCol({ dateStr, className, children }: { dateStr: string, className: string, children: ReactNode }) {
  const router = useRouter()
  
  const [previewY, setPreviewY] = useState<number | null>(null)
  const [previewHeight, setPreviewHeight] = useState<number>(51)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    // Extrapolate bounding variables structurally from the global bus for active drag-preview projection
    const dragOffsetY = (window as any).__activeDragOffsetY || 0
    const dragDurationMs = (window as any).__activeDragDuration || 3600000
    
    const colRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    let y = e.clientY - colRect.top - dragOffsetY
    if (y < 0) y = 0
    
    const minutesLayout = (y / 51) * 60
    const totalMinutesSnapped = Math.round(minutesLayout / 15) * 15
    const snappedPixelY = (totalMinutesSnapped / 60) * 51
    const snappedHeight = (dragDurationMs / 3600000) * 51
    
    setPreviewY(snappedPixelY)
    setPreviewHeight(snappedHeight)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // We only want to clear if the mouse truly leaves the column bounding box natively
    setPreviewY(null)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setPreviewY(null) // Clear structural ghost projection instantly
    
    const eventId = e.dataTransfer.getData('eventId')
    const durationMsRaw = e.dataTransfer.getData('eventDurationMs')
    const dragOffsetYRaw = e.dataTransfer.getData('dragOffsetY')
    if (!eventId) return
    
    const durationMs = durationMsRaw ? parseInt(durationMsRaw) : 3600000 // default 1hr fallback
    const dragOffsetY = dragOffsetYRaw ? parseFloat(dragOffsetYRaw) : 0
    
    // Determine accurate drop location visually bound to the exact TOP edge of the element, NOT the cursor!
    const colRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    let y = e.clientY - colRect.top - dragOffsetY
    if (y < 0) y = 0 // Prevent negative top edge mappings
    
    const minutesLayout = (y / 51) * 60
    
    // Mathematically round bounds to nearest 15 mins for intuitive magnetic snapping
    const totalMinutesSnapped = Math.round(minutesLayout / 15) * 15
    const snappedHour = Math.floor(totalMinutesSnapped / 60)
    const snappedMin = totalMinutesSnapped % 60

    const [yyyy, mm, dd] = dateStr.split('-').map(Number)
    const dropStartDate = new Date(yyyy, mm - 1, dd, snappedHour, snappedMin, 0)
    const dropEndDate = new Date(dropStartDate.getTime() + durationMs)

    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startTime: dropStartDate.toISOString(),
          endTime: dropEndDate.toISOString()
        })
      })
      // Server-bound data has shifted! Trigger silent Next.js soft refresh to immediately morph grid visually!
      router.refresh()
    } catch (err) {
      console.error("Failed to execute DND movement mathematically.", err)
    }
  }

  return (
    <div 
      className={className} 
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop}
      style={{ position: 'relative' }} // ensure projection boundary constraint
    >
      {previewY !== null && (
        <div 
          style={{
            position: 'absolute',
            top: `${previewY}px`,
            left: '5px',
            right: '5px',
            height: `${previewHeight}px`,
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            border: '2px solid var(--primary-color)',
            borderRadius: '6px',
            pointerEvents: 'none', // Strictly prevent ghost from bubbling drop logic
            zIndex: 100,
            transition: 'top 0.05s ease-out' // Micro-smoothing filter for the 15m structural jumps
          }}
        />
      )}
      {children}
    </div>
  )
}
