'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function InteractiveMonthEvent({ 
  event, 
  href, 
  className,
  dotClassName,
  timeClassName,
  titleClassName
}: { 
  event: any, 
  href: string, 
  className: string,
  dotClassName: string,
  timeClassName: string,
  titleClassName: string
}) {
  const badgeRef = useRef<HTMLAnchorElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('eventId', event.id)
    e.dataTransfer.setData('eventStartTime', event.startTime)
    e.dataTransfer.effectAllowed = 'move'
    
    setTimeout(() => {
      if (badgeRef.current) badgeRef.current.style.opacity = '0.3'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (badgeRef.current) badgeRef.current.style.opacity = '1'
  }

  return (
    <Link 
      ref={badgeRef}
      href={href} 
      scroll={false} 
      className={className}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ cursor: 'move' }}
    >
      <div 
        className={dotClassName} 
        style={{ backgroundColor: event.project ? event.project.color : 'var(--text-secondary)' }}
      />
      <span className={timeClassName}>
        {format(new Date(event.startTime), 'h:mma').toLowerCase()}
      </span>
      <span className={titleClassName}>{event.title}</span>
    </Link>
  )
}
