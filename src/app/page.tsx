import styles from './page.module.css'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  parseISO
} from 'date-fns'
import ClientMonthGrid from '@/components/ClientMonthGrid'

export const dynamic = 'force-dynamic' 

export default async function MonthView({
  searchParams
}: {
  searchParams: Promise<{ month?: string, date?: string }>
}) {
  const resolvedParams = await searchParams
  const session = await auth()
  const userId = session?.user?.id
  
  // 1. Determine current month interval structure
  let currentDate = new Date()
  if (resolvedParams.date) {
    currentDate = parseISO(`${resolvedParams.date}T12:00:00Z`)
  } else if (resolvedParams.month) {
    currentDate = parseISO(`${resolvedParams.month}-01T12:00:00Z`)
  }
  
  const getEventUrl = (event: any) => {
    const params = new URLSearchParams()
    if (resolvedParams.date) params.set('date', resolvedParams.date)
    if (resolvedParams.month) params.set('month', resolvedParams.month)
    if (event.taskId) {
      params.set('editTask', event.taskId)
    } else {
      params.set('editEvent', event.id)
    }
    return `/?${params.toString()}`
  }
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  
  const daysInGrid = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  // 3. Fetch real events
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

  const dayStrs = daysInGrid.map(d => format(d, 'yyyy-MM-dd'));
  const monthStartStr = format(monthStart, 'yyyy-MM-dd');

  return (
    <div className={styles.monthView}>
      <div className={styles.calendarGrid}>
        <ClientMonthGrid 
          rawEvents={rawEvents}
          dayStrs={dayStrs}
          monthStartStr={monthStartStr}
          getEventUrl={getEventUrl}
          styles={styles}
        />
      </div>
    </div>
  )
}
