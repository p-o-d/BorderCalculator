export interface Translations {
  // App
  appTitle: string;
  appSubtitle: string;
  pageTitle: string;

  // Calendar
  months: string[];
  daysShort: string[];
  toggleDay: string;
  addTrip: string;
  removeTrip: string;
  tapEntryDate: string;
  tapFirstDayToRemove: string;
  entryDateSelected: (date: string) => string;
  removingFromSelected: (date: string) => string;
  cancel: string;
  previousMonth: string;
  nextMonth: string;
  today: string;

  // Legend
  legendSchengen: string;
  legendWarning: string;
  legendOverstay: string;
  legendToday: string;

  // Summary
  calculatingAsOf: string;
  referenceDateLabel: string;
  resetToToday: string;
  daysRemaining: string;
  ofNUsed: (n: number) => string;
  overstayAlert: (days: number) => string;
  approachingAlert: (days: number) => string;
  daysUsedLabel: (context: string) => string;
  daysRemainingLabel: string;
  maxStayLabel: (from: string) => string;
  dayCount: (n: number) => string;
  nextDayFreed: string;
  last180Days: string;
  daysBefore: (date: string) => string;
  tomorrow: string;
  clearAllDates: string;
  clearConfirm: string;
}

export type Locale = 'en' | 'es' | 'uk';
