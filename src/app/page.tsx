import styles from './page.module.css'

export default function MonthView() {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Static placeholder data for UI demonstration to prove layout logic
  const calendarDays = Array.from({ length: 35 }).map((_, i) => ({
    date: i + 1,
    isToday: i === 14,
    isOtherMonth: i > 30,
    events: i === 12 ? ['Q1 Planning', 'Design Sync'] : i === 14 ? ['Lunch with Alex'] : []
  }))

  return (
    <div className={styles.monthView}>
      <div className={styles.daysHeader}>
        {daysOfWeek.map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
      
      <div className={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`
              ${styles.dayCell} 
              ${day.isToday ? styles.today : ''} 
              ${day.isOtherMonth ? styles.otherMonth : ''}
            `}
          >
            <div className={styles.dateNumber}>
              {day.isOtherMonth ? (day.date % 31) + 1 : day.date}
            </div>
            
            <div className={styles.eventsContainer}>
              {day.events.map((event, eventIdx) => (
                <div key={eventIdx} className={styles.eventBadge}>
                  {event}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
