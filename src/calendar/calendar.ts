import { DayStatus } from '../calculator/types';
import { computeMonthGrid, fromDateStr } from '../calculator/engine';
import { t, getLocale } from '../i18n/index';
import './calendar.css';

export type SelectionMode = 'single' | 'trip' | 'remove';

export interface CalendarCallbacks {
  onToggleDay: (dateStr: string) => void;
  onRangeToggle: (from: string, to: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

// Module-level state that persists across re-renders
let selectionMode: SelectionMode = 'single';
let tripStartDate: string | null = null;

export function renderCalendar(
  container: HTMLElement,
  schengenDays: Set<string>,
  year: number,
  month: number,
  callbacks: CalendarCallbacks,
): void {
  const i = t();
  const grid = computeMonthGrid(schengenDays, year, month);
  container.innerHTML = '';

  // Mode toggle bar
  const modeBar = document.createElement('div');
  modeBar.className = 'cal-mode-bar';

  const singleBtn = document.createElement('button');
  singleBtn.className = `cal-mode-btn ${selectionMode === 'single' ? 'cal-mode-btn--active' : ''}`;
  singleBtn.textContent = i.toggleDay;
  singleBtn.addEventListener('click', () => {
    selectionMode = 'single';
    tripStartDate = null;
    rerender();
  });

  const tripBtn = document.createElement('button');
  tripBtn.className = `cal-mode-btn ${selectionMode === 'trip' ? 'cal-mode-btn--active' : ''}`;
  tripBtn.textContent = i.addTrip;
  tripBtn.addEventListener('click', () => {
    selectionMode = 'trip';
    tripStartDate = null;
    rerender();
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = `cal-mode-btn ${selectionMode === 'remove' ? 'cal-mode-btn--active' : ''}`;
  removeBtn.textContent = i.removeTrip;
  removeBtn.addEventListener('click', () => {
    selectionMode = 'remove';
    tripStartDate = null;
    rerender();
  });

  modeBar.appendChild(singleBtn);
  modeBar.appendChild(tripBtn);
  modeBar.appendChild(removeBtn);
  container.appendChild(modeBar);

  // Trip mode hint banner
  if (selectionMode === 'trip' || selectionMode === 'remove') {
    const hint = document.createElement('div');
    hint.className = 'cal-hint';
    const isRemove = selectionMode === 'remove';
    if (!tripStartDate) {
      hint.textContent = isRemove ? i.tapFirstDayToRemove : i.tapEntryDate;
    } else {
      const formatted = formatShortDate(tripStartDate);
      hint.innerHTML = isRemove ? i.removingFromSelected(formatted) : i.entryDateSelected(formatted);
      // Cancel button
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'cal-hint-cancel';
      cancelBtn.textContent = i.cancel;
      cancelBtn.addEventListener('click', () => {
        tripStartDate = null;
        rerender();
      });
      hint.appendChild(cancelBtn);
    }
    container.appendChild(hint);
  }

  function rerender() {
    renderCalendar(container, schengenDays, year, month, callbacks);
  }

  // Header with navigation
  const header = document.createElement('div');
  header.className = 'cal-header';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'cal-nav-btn';
  prevBtn.textContent = '\u2039';
  prevBtn.setAttribute('aria-label', i.previousMonth);
  prevBtn.addEventListener('click', () => {
    let m = month - 1, y = year;
    if (m < 0) { m = 11; y--; }
    callbacks.onMonthChange(y, m);
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'cal-nav-btn';
  nextBtn.textContent = '\u203A';
  nextBtn.setAttribute('aria-label', i.nextMonth);
  nextBtn.addEventListener('click', () => {
    let m = month + 1, y = year;
    if (m > 11) { m = 0; y++; }
    callbacks.onMonthChange(y, m);
  });

  const title = document.createElement('h2');
  title.className = 'cal-title';
  title.textContent = `${i.months[month]} ${year}`;

  const todayBtn = document.createElement('button');
  todayBtn.className = 'cal-today-btn';
  todayBtn.textContent = i.today;
  todayBtn.addEventListener('click', () => {
    const now = new Date();
    callbacks.onMonthChange(now.getFullYear(), now.getMonth());
  });

  header.appendChild(prevBtn);
  header.appendChild(title);
  header.appendChild(todayBtn);
  header.appendChild(nextBtn);
  container.appendChild(header);

  // Day-of-week labels
  const dowRow = document.createElement('div');
  dowRow.className = 'cal-dow-row';
  for (const label of i.daysShort) {
    const el = document.createElement('div');
    el.className = 'cal-dow';
    el.textContent = label;
    dowRow.appendChild(el);
  }
  container.appendChild(dowRow);

  // Day grid
  const gridEl = document.createElement('div');
  gridEl.className = 'cal-grid';

  // Compute preview range for trip mode
  const previewRange = getPreviewRange();

  for (const status of grid) {
    const cell = createDayCell(status, previewRange);

    cell.addEventListener('click', () => {
      handleDayClick(status.date, callbacks, rerender);
    });

    gridEl.appendChild(cell);
  }

  container.appendChild(gridEl);
}

function handleDayClick(
  dateStr: string,
  callbacks: CalendarCallbacks,
  rerender: () => void,
): void {
  if (selectionMode === 'single') {
    callbacks.onToggleDay(dateStr);
    return;
  }

  // Trip or remove mode
  if (!tripStartDate) {
    tripStartDate = dateStr;
    rerender();
  } else {
    if (selectionMode === 'remove') {
      const d1 = fromDateStr(tripStartDate);
      const d2 = fromDateStr(dateStr);
      const start = d1 < d2 ? tripStartDate : dateStr;
      const end = d1 < d2 ? dateStr : tripStartDate;
      callbacks.onRangeToggle(start, end);
    } else {
      callbacks.onRangeToggle(tripStartDate, dateStr);
    }
    tripStartDate = null;
  }
}

function getPreviewRange(): Set<string> | null {
  if ((selectionMode !== 'trip' && selectionMode !== 'remove') || !tripStartDate) {
    return null;
  }
  return new Set([tripStartDate]);
}

function createDayCell(status: DayStatus, previewRange: Set<string> | null): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'cal-day';
  cell.dataset.date = status.date;

  const classes: string[] = [];
  if (!status.isCurrentMonth) classes.push('cal-day--outside');
  if (status.isToday) classes.push('cal-day--today');
  if (status.isSchengen) classes.push('cal-day--schengen');
  if (status.isOverstay && status.isSchengen) classes.push('cal-day--overstay');
  else if (status.daysUsedInWindow >= 80 && status.isSchengen) classes.push('cal-day--warning');

  if (previewRange?.has(status.date)) {
    classes.push('cal-day--trip-start');
  }

  cell.classList.add(...classes);

  const dayNum = document.createElement('span');
  dayNum.className = 'cal-day-num';
  dayNum.textContent = String(parseInt(status.date.split('-')[2], 10));
  cell.appendChild(dayNum);

  if (status.isSchengen && status.isCurrentMonth) {
    const badge = document.createElement('span');
    badge.className = 'cal-day-badge';
    badge.textContent = String(status.daysRemaining);
    cell.appendChild(badge);
  }

  return cell;
}

function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const locale = getLocale() === 'uk' ? 'uk-UA' : getLocale() === 'es' ? 'es-ES' : 'en-GB';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}
