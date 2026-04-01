import { AppState } from './calculator/types';
import { fromDateStr, toDateStr } from './calculator/engine';
import { renderCalendar } from './calendar/calendar';
import { renderSummary } from './ui/summary';
import { loadSchengenDays, saveSchengenDays } from './storage/persistence';
import { t, getLocale, setLocale, LOCALES, Locale } from './i18n/index';
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

  function buildShell(): void {
    const i = t();
    document.title = i.pageTitle;

    app.innerHTML = `
      <header class="app-header">
        <div class="lang-switcher" id="lang-switcher"></div>
        <h1>${i.appTitle}</h1>
        <p>${i.appSubtitle}</p>
      </header>
      <div class="calendar-container" id="calendar"></div>
      <div class="legend" id="legend"></div>
      <div class="summary-container" id="summary"></div>
    `;

    renderLangSwitcher(document.getElementById('lang-switcher')!);
    renderLegend(document.getElementById('legend')!);
  }

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

          let markedCount = 0;
          let totalCount = 0;
          const checkCursor = new Date(start);
          while (checkCursor <= end) {
            totalCount++;
            if (state.schengenDays.has(toDateStr(checkCursor))) markedCount++;
            checkCursor.setDate(checkCursor.getDate() + 1);
          }
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

  function renderLangSwitcher(container: HTMLElement): void {
    container.innerHTML = '';
    const current = getLocale();
    for (const { code, label } of LOCALES) {
      const btn = document.createElement('button');
      btn.className = `lang-btn ${code === current ? 'lang-btn--active' : ''}`;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        setLocale(code as Locale);
        buildShell();
        update();
      });
      container.appendChild(btn);
    }
  }

  function renderLegend(container: HTMLElement): void {
    const i = t();
    const items: [string, string][] = [
      ['schengen', i.legendSchengen],
      ['warning', i.legendWarning],
      ['overstay', i.legendOverstay],
      ['today', i.legendToday],
    ];

    for (const [cls, label] of items) {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-dot legend-dot--${cls}"></span>${label}`;
      container.appendChild(item);
    }
  }

  window.addEventListener('schengen-update', () => update());

  buildShell();
  update();
}

init();
