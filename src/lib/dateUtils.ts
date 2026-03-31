import { parseISO, startOfDay, addHours } from 'date-fns'

/**
 * Stabilizes 'Today/Now' for SSR/Hydration parity.
 * Forces a 12:00:00 Noon UTC reference point to prevent timezone-drift jumps.
 */
export function getStableNow(): Date {
  const d = new Date()
  // Create a UTC-absolute noon for the current calendar day
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0))
}

/**
 * Standardized ISO parsing for calendar anchors.
 */
export function parseAnchorDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return getStableNow()
  if (dateStr.includes('T')) return parseISO(dateStr)
  // Ensure we parse simple 'yyyy-MM-dd' as noon UTC to avoid falling into the previous day
  return parseISO(`${dateStr}T12:00:00Z`)
}
