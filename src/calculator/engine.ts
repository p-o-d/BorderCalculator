import { DayStatus, SchengenSummary } from './types';

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  return result;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

/**
 * Count Schengen days in the 180-day window ending on `date` (inclusive).
 * Window: [date - 179, date] = 180 days.
 */
export function countDaysInWindow(schengenDays: Set<string>, date: Date): number {
  const windowStart = addDays(date, -179);
  let count = 0;
  const cursor = new Date(windowStart);
  while (cursor <= date) {
    if (schengenDays.has(toDateStr(cursor))) {
      count++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/**
 * Compute status for a single day.
 */
export function computeDayStatus(
  schengenDays: Set<string>,
  date: Date,
  today: Date,
  currentMonth: number,
): DayStatus {
  const dateStr = toDateStr(date);
  const daysUsed = countDaysInWindow(schengenDays, date);
  return {
    date: dateStr,
    isSchengen: schengenDays.has(dateStr),
    daysUsedInWindow: daysUsed,
    daysRemaining: Math.max(0, 90 - daysUsed),
    isOverstay: daysUsed > 90,
    isToday: toDateStr(date) === toDateStr(today),
    isCurrentMonth: date.getMonth() === currentMonth,
  };
}

/**
 * Compute statuses for all visible days in a month view (including
 * leading/trailing days from adjacent months to fill the grid).
 */
export function computeMonthGrid(
  schengenDays: Set<string>,
  year: number,
  month: number, // 0-11
): DayStatus[] {
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  // Monday = 0 in our grid. JS: 0=Sun,1=Mon,...6=Sat
  let startDow = firstOfMonth.getDay() - 1;
  if (startDow < 0) startDow = 6; // Sunday becomes 6

  const gridStart = addDays(firstOfMonth, -startDow);
  const statuses: DayStatus[] = [];

  // Always render 6 weeks (42 days) for consistent grid height
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    statuses.push(computeDayStatus(schengenDays, d, today, month));
  }

  return statuses;
}

/**
 * Compute summary as of a reference date (typically today).
 */
export function computeSummary(
  schengenDays: Set<string>,
  referenceDate: Date,
): SchengenSummary {
  const daysUsed = countDaysInWindow(schengenDays, referenceDate);
  const daysRemaining = Math.max(0, 90 - daysUsed);
  const isOverstaying = daysUsed > 90;
  const overstayDays = Math.max(0, daysUsed - 90);

  // Find next day freed: earliest Schengen day in current window + 180
  let nextDayFreed: string | null = null;
  const windowStart = addDays(referenceDate, -179);
  const cursor = new Date(windowStart);
  while (cursor <= referenceDate) {
    if (schengenDays.has(toDateStr(cursor))) {
      const freedDate = addDays(cursor, 180);
      if (freedDate > referenceDate) {
        nextDayFreed = toDateStr(freedDate);
        break;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  // Max consecutive stay starting from tomorrow
  let maxConsecutiveStay = 0;
  if (daysRemaining > 0) {
    let simDays = new Set(schengenDays);
    let simDate = addDays(referenceDate, 1);
    let simUsed = daysUsed;
    while (true) {
      // Day falling off the back of the window
      const dropDay = addDays(simDate, -180);
      if (simDays.has(toDateStr(dropDay))) {
        simUsed--;
      }
      // Add new day
      simUsed++;
      if (simUsed > 90) break;
      maxConsecutiveStay++;
      simDate = addDays(simDate, 1);
    }
  }

  return {
    daysUsed,
    daysRemaining,
    isOverstaying,
    overstayDays,
    nextDayFreed,
    maxConsecutiveStay,
  };
}
