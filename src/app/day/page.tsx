import styles from '../week/page.module.css'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  eachDayOfInterval,
  isToday,
  format,
  startOfWeek,
  parseISO
} from 'date-fns'
import { parseISOString } from '@/lib/dateUtils'
import Link from 'next/link'
import ClientGridWrapper from '@/components/ClientGridWrapper'
import { HOUR_HEIGHT } from '@/lib/constants'

export const dynamic = 'force-dynamic' 

export default async function DayView({
  searchParams
}: {
  searchParams: Promise<{ month?: string, date?: string }>
}) {
  const { date, month } = await searchParams
  const currentDate = parseISOString(date)
  const session = await auth()
  const userId = session?.user?.id
  
  const getEventUrl = (event: any) => {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (month) params.set('month', month)
    if (event.taskId) {
      params.set('editTask', event.taskId)
    } else {
      params.set('editEvent', event.id)
    }
    return `/day?${params.toString()}`
  }
  
  // Standard Block Logic: Target date is Slot 1, showing 4 days total
  const startDate = new Date(currentDate)
  startDate.setHours(0,0,0,0)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 3)
  endDate.setHours(23,59,59,999)
  
  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate })

  // Fetch real events
  const rawEvents = await prisma.event.findMany({
    where: {
      AND: [
        { startTime: { lte: endDate } },
        { endTime: { gte: startDate } },
        ...(userId ? [{ userId }] : []),
      ]
    },
    include: { project: true }
  }) as any[];

  const dayStrs = daysInGrid.map(d => format(d, 'yyyy-MM-dd'))

  return (
    <div className={styles.weekView}>
      <div className={styles.gridBody} style={{ gridTemplateColumns: '60px repeat(4, 1fr)' }}>
        <div className={styles.timeColHeader} />
        {daysInGrid.map(day => (
          <div key={`header-${day.toISOString()}`} className={styles.dayHeader}>
            <span className={styles.dayName}>{format(day, 'E')}</span>
            <span className={`${styles.dayNumber} ${isToday(day) ? styles.todayNum : ''}`}>
              {format(day, 'd')}
            </span>
          </div>
        ))}
      
        <ClientGridWrapper
          rawEvents={rawEvents}
          dayStrs={dayStrs}
          getEventUrl={getEventUrl}
          baseUrl="/day"
          dateParam={date}
          dayColClassName={styles.dayCol}
          eventBlockClassName={styles.eventBlock}
          timeColClassName={styles.timeCol}
          timeLabelClassName={styles.timeLabel}
        />
      </div>
    </div>
  )
}
