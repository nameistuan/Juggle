import styles from './page.module.css'
import prisma from '@/lib/prisma'
import {
  eachDayOfInterval,
  isToday,
  format,
  startOfWeek,
  parseISO
} from 'date-fns'
import Link from 'next/link'
import InteractiveDayCol from '@/components/InteractiveDayCol'
import InteractiveEvent from '@/components/InteractiveEvent'
import { calculateEventLayout } from '@/lib/groupEvents'

export const dynamic = 'force-dynamic' 

export default async function WeekView({
  searchParams
}: {
  searchParams: Promise<{ month?: string, date?: string }>
}) {
  const resolvedParams = await searchParams
  
  let currentDate = new Date()
  if (resolvedParams.date) {
    currentDate = parseISO(`${resolvedParams.date}T12:00:00Z`)
  } else if (resolvedParams.month) {
    currentDate = parseISO(`${resolvedParams.month}-01T12:00:00Z`)
  } else {
    currentDate = startOfWeek(new Date())
  }
  
  const getEventUrl = (eventId: string) => {
    const params = new URLSearchParams()
    if (resolvedParams.date) params.set('date', resolvedParams.date)
    if (resolvedParams.month) params.set('month', resolvedParams.month)
    params.set('editEvent', eventId)
    return `/week?${params.toString()}`
  }
  
  const startDate = new Date(currentDate)
  startDate.setHours(0,0,0,0)
  const endDate = new Date(currentDate)
  endDate.setDate(endDate.getDate() + 6)
  endDate.setHours(23,59,59,999)
  
  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate })

  // Fetch real events
  const events = await prisma.event.findMany({
    where: {
      startTime: { gte: startDate, lte: endDate }
    },
    include: { project: true }
  });

  const hours = Array.from({ length: 24 }).map((_, i) => i)

  return (
    <div className={styles.weekView}>
      <div className={styles.headerRow}>
        <div className={styles.timeColHeader} />
        {daysInGrid.map(day => (
          <div key={day.toISOString()} className={styles.dayHeader}>
            <span className={styles.dayName}>{format(day, 'E')}</span>
            <span className={`${styles.dayNumber} ${isToday(day) ? styles.todayNum : ''}`}>
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>
      
      <div className={styles.gridBody}>
        {/* Time Column */}
        <div className={styles.timeCol}>
          {hours.map(hour => (
            <div key={hour} className={styles.timeLabel} style={{ top: `${hour * 51}px` }}>
              {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'ha')}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={styles.daysContainer}>
          {daysInGrid.map(day => {
            const dayStart = new Date(day)
            dayStart.setHours(0,0,0,0)
            const dayEnd = new Date(day)
            dayEnd.setHours(23,59,59,999)

            // Intersection-based filtering: event overlaps day if it starts before day ends AND ends after day starts
            const overlappingEvents = events.filter((e: any) => {
              const eStart = new Date(e.startTime)
              const eEnd = e.endTime ? new Date(e.endTime) : new Date(eStart.getTime() + 3600000)
              return eStart <= dayEnd && eEnd >= dayStart
            })
            
            // Map to 'layout' compatible objects but using clipped boundaries for the current day
            const daySpecificEvents = overlappingEvents.map((e: any) => {
              const eStart = new Date(e.startTime)
              const eEnd = e.endTime ? new Date(e.endTime) : new Date(eStart.getTime() + 3600000)
              
              const clippedStart = eStart < dayStart ? dayStart : eStart
              const clippedEnd = eEnd > dayEnd ? dayEnd : eEnd

              return {
                ...e,
                displayStart: clippedStart,
                displayEnd: clippedEnd,
                // These will be used for layout calculations (overlap detection)
                startTime: clippedStart,
                endTime: clippedEnd
              }
            })

            const layoutEvents = calculateEventLayout(daySpecificEvents)
            const dateStr = format(day, 'yyyy-MM-dd')

            return (
              <InteractiveDayCol key={day.toISOString()} dateStr={dateStr} className={styles.dayCol}>
                {layoutEvents.map((le: any) => {
                  const startHour = le.displayStart.getHours()
                  const startMin = le.displayStart.getMinutes()
                  
                  const durationMs = le.displayEnd.getTime() - le.displayStart.getTime()
                  const top = (startHour * 51) + (startMin * (51 / 60))
                  const height = Math.max((durationMs / 3600000) * 51, 12) // clamp min height

                  return (
                    <InteractiveEvent
                      key={`${le.id}-${dateStr}`}
                      event={le}
                      href={getEventUrl(le.id)}
                      top={top}
                      height={height}
                      assignedLeft={le.assignedLeft}
                      isLayoutIndented={le.isLayoutIndented}
                      zIndex={le.zIndex}
                      className={styles.eventBlock}
                    />
                  )
                })}
              </InteractiveDayCol>
            )
          })}
        </div>
      </div>
    </div>
  )
}
