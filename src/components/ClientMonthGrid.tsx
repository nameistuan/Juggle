'use client'

import React, { useMemo } from 'react'
import { format, isToday, isSameMonth } from 'date-fns'
import { prepareEventsForGrid } from '@/lib/calendarEngine'
import InteractiveMonthCell from './InteractiveMonthCell'
import InteractiveMonthEvent from './InteractiveMonthEvent'

export default function ClientMonthGrid({
  rawEvents,
  dayStrs,
  monthStartStr,
  getEventUrl,
  styles
}: {
  rawEvents: any[]
  dayStrs: string[]
  monthStartStr: string
  getEventUrl: (event: any) => string
  styles: any
}) {
  const daySegmentsMap = useMemo(() => {
    if (dayStrs.length === 0) return new Map()
    const [sy, sm, sd] = dayStrs[0].split('-').map(Number)
    const startDate = new Date(sy, sm - 1, sd, 0, 0, 0, 0)
    
    const endStr = dayStrs[dayStrs.length - 1]
    const [ey, em, ed] = endStr.split('-').map(Number)
    const endDate = new Date(ey, em - 1, ed, 23, 59, 59, 999)

    return prepareEventsForGrid(rawEvents, startDate, endDate)
  }, [rawEvents, dayStrs])

  const [msy, msm, msd] = monthStartStr.split('-').map(Number)
  const monthStart = new Date(msy, msm - 1, msd)

  return (
    <>
      {dayStrs.map((dateStr, index) => {
        const [y, m, d] = dateStr.split('-').map(Number)
        const dayDate = new Date(y, m - 1, d)

        const daySegments = daySegmentsMap.get(dateStr) || [];
        daySegments.sort((a: any, b: any) => a.fullStartTime.getTime() - b.fullStartTime.getTime());

        const isTodayCell = isToday(dayDate)
        const isOtherMonthCell = !isSameMonth(dayDate, monthStart)

        return (
          <InteractiveMonthCell 
            key={index} 
            dateStr={dateStr}
            className={`${styles.dayCell} ${isTodayCell ? styles.today : ''} ${isOtherMonthCell ? styles.otherMonth : ''}`}
          >
            {index < 7 && (
              <div className={styles.dayName}>{format(dayDate, 'EEE')}</div>
            )}
            <div className={styles.dateNumberWrapper}>
              <div className={styles.dateNumber}>
                {dayDate.getDate()}
              </div>
            </div>
            
            <div className={styles.eventsContainer}>
              {daySegments.map((event: any) => (
                <InteractiveMonthEvent
                  key={event.id}
                  event={event}
                  href={getEventUrl(event)}
                  className={styles.eventBadge}
                  dotClassName={styles.eventDot}
                  timeClassName={styles.eventTime}
                  titleClassName={styles.eventTitle}
                />
              ))}
            </div>
          </InteractiveMonthCell>
        )
      })}
    </>
  )
}
