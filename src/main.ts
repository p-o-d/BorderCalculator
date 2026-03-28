import { AppState } from './calculator/types';
import { fromDateStr, toDateStr } from './calculator/engine';
import { renderCalendar } from './calendar/calendar';
import { renderSummary } from './ui/summary';
import { loadSchengenDays, saveSchengenDays } from './storage/persistence';
import './ui/app.css';

function init(): void {
  const app = document.getElementById('app')!;
  const now = new Date();

  const state: AppState = {
    schengenDays: loadSchengenDays(),
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth(),
    referenceDate: null,
  };

  // Build app shell
  app.innerHTML = `
    <header class="app-header">
      <h1>Schengen Stay Calculator</h1>
      <p>90 days in any 180-day rolling window</p>
    </header>
    <div class="calendar-container" id="calendar"></div>
    <div class="legend" id="legend"></div>
    <div class="summary-container" id="summary"></div>
  `;

  renderLegend(document.getElementById('legend')!);

  function update(): void {
    saveSchengenDays(state.schengenDays);
    renderCalendar(
      document.getElementById('calendar')!,
      state.schengenDays,
      state.currentYear,
      state.currentMonth,
      {
        onToggleDay: (dateStr) => {
          if (state.schengenDays.has(dateStr)) {
            state.schengenDays.delete(dateStr);
          } else {
            state.schengenDays.add(dateStr);
          }
          update();
        },
        onRangeToggle: (from, to) => {
          const d1 = fromDateStr(from);
          const d2 = fromDateStr(to);
          const start = d1 < d2 ? d1 : d2;
          const end = d1 < d2 ? d2 : d1;

          // Check if the majority of days in range are already marked
          let markedCount = 0;
          let totalCount = 0;
          const checkCursor = new Date(start);
          while (checkCursor <= end) {
            totalCount++;
            if (state.schengenDays.has(toDateStr(checkCursor))) markedCount++;
            checkCursor.setDate(checkCursor.getDate() + 1);
          }
          // If most days are marked, remove; otherwise add
          const adding = markedCount < totalCount / 2;

          const cursor = new Date(start);
          while (cursor <= end) {
            const s = toDateStr(cursor);
            if (adding) {
              state.schengenDays.add(s);
            } else {
              state.schengenDays.delete(s);
            }
            cursor.setDate(cursor.getDate() + 1);
          }
          update();
        },
        onMonthChange: (year, month) => {
          state.currentYear = year;
          state.currentMonth = month;
          update();
        },
      },
    );
    renderSummary(
      document.getElementById('summary')!,
      state.schengenDays,
      state.referenceDate,
      {
        onReferenceDateChange: (dateStr) => {
          state.referenceDate = dateStr;
          update();
        },
      },
    );
  }

  // Listen for programmatic updates (e.g., "clear all")
  window.addEventListener('schengen-update', () => update());

  update();
}

function renderLegend(container: HTMLElement): void {
  const items = [
    ['schengen', 'In Schengen'],
    ['warning', 'Near limit (80+)'],
    ['overstay', 'Overstay (90+)'],
    ['today', 'Today'],
  ];

  for (const [cls, label] of items) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot legend-dot--${cls}"></span>${label}`;
    container.appendChild(item);
  }
}

init();
