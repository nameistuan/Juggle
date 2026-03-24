'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function InteractiveEvent({ 
  event, 
  href, 
  top, 
  height,
  className
}: { 
  event: any, 
  href: string, 
  top: number, 
  height: number,
  className: string 
}) {
  const router = useRouter()
  const blockRef = useRef<HTMLDivElement>(null)
  
  const [dragHeight, setDragHeight] = useState(height)
  const isResizing = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(height)

  // Sync internal drag height if server pushes a prop update
  useEffect(() => {
    setDragHeight(height)
  }, [height])

  const handleDragStart = (e: React.DragEvent) => {
    if (isResizing.current) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('eventId', event.id)
    e.dataTransfer.effectAllowed = 'move'
    
    // Make the original temporarily invisible natively during flight
    setTimeout(() => {
      if (blockRef.current) blockRef.current.style.opacity = '0.4'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (blockRef.current) blockRef.current.style.opacity = '1'
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    isResizing.current = true
    startY.current = e.clientY
    startHeight.current = dragHeight
    
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isResizing.current) return
    const deltaY = e.clientY - startY.current
    let newHeight = startHeight.current + deltaY
    if (newHeight < 15) newHeight = 15 // Min visual height
    setDragHeight(newHeight)
  }

  const handlePointerUp = async (e: PointerEvent) => {
    isResizing.current = false
    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
    
    // Calculate new duration natively against the original start time
    const newDurationMins = (dragHeight / 51) * 60
    const newEndTime = new Date(new Date(event.startTime).getTime() + newDurationMins * 60000)

    try {
      await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTime: newEndTime.toISOString() })
      })
      router.refresh()
    } catch (err) {
      console.error("Failed to commit resize", err)
    }
  }

  return (
    <div 
      ref={blockRef}
      className={className}
      style={{
        top: `${top}px`,
        height: `${dragHeight}px`,
        position: 'absolute',
        width: 'calc(100% - 10px)',
        backgroundColor: event.project ? `${event.project.color}33` : 'var(--surface-hover)',
        color: event.project ? event.project.color : 'var(--text-primary)',
        borderLeft: `4px solid ${event.project ? event.project.color : 'var(--border-color)'}`,
        cursor: 'move',
        userSelect: 'none',
        borderRadius: '4px',
        overflow: 'hidden',
        fontSize: '0.75rem',
        lineHeight: 1.2
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Link 
        href={href} 
        scroll={false} 
        style={{ display: 'block', height: '100%', width: '100%', color: 'inherit', textDecoration: 'none', padding: '0.25rem 0.5rem' }}
        draggable={false} // don't trigger native Link ghost drags concurrently
      >
        <div style={{ fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
        <div style={{ opacity: 0.8 }}>
          {format(new Date(event.startTime), 'h:mm a')} 
          {event.endTime && ` - ${format(new Date(event.endTime), 'h:mm a')}`}
        </div>
      </Link>
      
      {/* Structural Resizer Hook */}
      <div 
        onPointerDown={handlePointerDown}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px',
          cursor: 'ns-resize',
          zIndex: 10
        }}
      />
    </div>
  )
}
