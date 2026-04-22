'use client'

import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { prepareEventsForGrid } from '@/lib/calendarEngine'
import { calculateEventLayout } from '@/lib/groupEvents'
import InteractiveDayCol from './InteractiveDayCol'
import InteractiveEvent from './InteractiveEvent'
import AllDayRow from './AllDayRow'

export default function ClientGridWrapper({
  rawEvents,
  dayStrs,

  getEventUrl,
  baseUrl,
  dateParam
}: {
  rawEvents: any[]
  dayStrs: string[]
  getEventUrl: (event: any) => string
  baseUrl: string
  dateParam?: string
  dayColClassName?: string
  eventBlockClassName?: string
  timeColClassName?: string
  timeLabelClassName?: string
}) {
  const { daySegmentsMap, allDayByDate } = useMemo(() => {
    const map = new Map()
    const allDay: Record<string, any[]> = {}
    
    if (dayStrs.length === 0) return { daySegmentsMap: map, allDayByDate: allDay }
    
    const [sy, sm, sd] = dayStrs[0].split('-').map(Number)
    const startDate = new Date(sy, sm - 1, sd, 0, 0, 0, 0)
    
    const endStr = dayStrs[dayStrs.length - 1]
    const [ey, em, ed] = endStr.split('-').map(Number)
    const endDate = new Date(ey, em - 1, ed, 23, 59, 59, 999)

    const engineMap = prepareEventsForGrid(rawEvents, startDate, endDate)
    
    dayStrs.forEach(dateStr => {
      const segs = engineMap.get(dateStr) || []
      allDay[dateStr] = segs.filter((s: any) => s.isFluid).map((s: any) => ({ id: s.id, title: s.title, project: s.project }))
    })

    return { daySegmentsMap: engineMap, allDayByDate: allDay }
  }, [rawEvents, dayStrs])

  const hours = Array.from({ length: 24 }).map((_, i) => i)

  return (
    <>
      {/* All-day row needs to span the same layout */}
      <AllDayRow
        days={dayStrs}
        eventsByDate={allDayByDate}
        baseUrl={baseUrl}
        dateParam={dateParam}
      />

      {/* Time Column Placeholder is outside this wrapper in the layout */}
      <div className={timeColClassName || ''}>
        {hours.map(hour => (
          <div key={hour} className={timeLabelClassName || ''} style={{ top: `calc(var(--hour-height) * ${hour})` }}>
            {hour === 0 ? '' : `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`}
          </div>
        ))}
      </div>
      
      {/* Days Grid */}
      {dayStrs.map(dateStr => {
        const daySegments = (daySegmentsMap.get(dateStr) || []).filter((s: any) => !s.isFluid)
        const layoutEvents = calculateEventLayout(daySegments)

        return (
          <InteractiveDayCol key={dateStr} dateStr={dateStr} className={dayColClassName || ''}>
            {layoutEvents.map((le) => {
              const startHour = le.displayStart.getHours()
              const startMin = le.displayStart.getMinutes()
              
              const durationMs = le.displayEnd.getTime() - le.displayStart.getTime()
              const topFraction = startHour + (startMin / 60)
              const heightFraction = durationMs / 3600000

              return (
                <InteractiveEvent
                  key={`${le.id}-${dateStr}`}
                  event={le}
                  href={getEventUrl(le)}
                  dateStr={dateStr}
                  topFraction={topFraction}
                  heightFraction={heightFraction}
                  assignedLeft={le.assignedLeft}
                  isLayoutIndented={le.isLayoutIndented}
                  zIndex={le.zIndex}
                  isStartClipped={le.isStartClipped}
                  isEndClipped={le.isEndClipped}
                  className={eventBlockClassName || ''}
                />
              )
            })}
          </InteractiveDayCol>
        )
      })}
    </>
  )
}
