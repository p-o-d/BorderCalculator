export interface DayStatus {
  date: string;              // "YYYY-MM-DD"
  isSchengen: boolean;       // marked by user
  daysUsedInWindow: number;  // Schengen days in trailing 180-day window
  daysRemaining: number;     // max(0, 90 - daysUsedInWindow)
  isOverstay: boolean;       // daysUsedInWindow > 90
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface SchengenSummary {
  daysUsed: number;
  daysRemaining: number;
  isOverstaying: boolean;
  overstayDays: number;
  nextDayFreed: string | null;
  maxConsecutiveStay: number;
}

export interface AppState {
  schengenDays: Set<string>;
  currentYear: number;
  currentMonth: number; // 0-11
  referenceDate: string | null; // null = today, otherwise "YYYY-MM-DD"
}
