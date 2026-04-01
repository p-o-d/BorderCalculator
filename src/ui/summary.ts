import { SchengenSummary } from '../calculator/types';
import { computeSummary, fromDateStr, todayStr } from '../calculator/engine';
import { t, getLocale } from '../i18n/index';

export interface SummaryCallbacks {
  onReferenceDateChange: (dateStr: string | null) => void;
}

export function renderSummary(
  container: HTMLElement,
  schengenDays: Set<string>,
  referenceDate: string | null,
  callbacks: SummaryCallbacks,
): void {
  const i = t();
  const refDateStr = referenceDate ?? todayStr();
  const refDate = fromDateStr(refDateStr);
  const isToday = !referenceDate;
  const summary = computeSummary(schengenDays, refDate);
  container.innerHTML = '';

  // Reference date selector
  const refSection = document.createElement('div');
  refSection.className = 'summary-ref-date';

  const refLabel = document.createElement('span');
  refLabel.className = 'summary-ref-label';
  refLabel.textContent = i.calculatingAsOf;

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'summary-ref-input';
  dateInput.value = refDateStr;
  dateInput.setAttribute('aria-label', i.referenceDateLabel);
  dateInput.addEventListener('change', () => {
    if (dateInput.value) {
      const picked = dateInput.value;
      if (picked === todayStr()) {
        callbacks.onReferenceDateChange(null);
      } else {
        callbacks.onReferenceDateChange(picked);
      }
    }
  });

  refSection.appendChild(refLabel);
  refSection.appendChild(dateInput);

  if (!isToday) {
    const resetBtn = document.createElement('button');
    resetBtn.className = 'summary-ref-reset';
    resetBtn.textContent = i.resetToToday;
    resetBtn.addEventListener('click', () => {
      callbacks.onReferenceDateChange(null);
    });
    refSection.appendChild(resetBtn);
  }

  container.appendChild(refSection);

  // Main counter: days remaining
  const counter = document.createElement('div');
  counter.className = 'summary-counter';

  const remaining = document.createElement('div');
  remaining.className = 'summary-remaining';
  remaining.classList.add(getStatusClass(summary));

  const num = document.createElement('span');
  num.className = 'summary-remaining-num';
  num.textContent = String(summary.daysRemaining);

  const label = document.createElement('span');
  label.className = 'summary-remaining-label';
  label.textContent = i.daysRemaining;

  remaining.appendChild(num);
  remaining.appendChild(label);
  counter.appendChild(remaining);
  container.appendChild(counter);

  // Progress ring
  const progress = document.createElement('div');
  progress.className = 'summary-progress';
  const pct = Math.min(100, (summary.daysUsed / 90) * 100);
  progress.innerHTML = `
    <svg viewBox="0 0 120 120" class="summary-ring">
      <circle cx="60" cy="60" r="52" class="summary-ring-bg"/>
      <circle cx="60" cy="60" r="52" class="summary-ring-fill ${getStatusClass(summary)}"
        stroke-dasharray="${2 * Math.PI * 52}"
        stroke-dashoffset="${2 * Math.PI * 52 * (1 - pct / 100)}"
      />
    </svg>
    <div class="summary-ring-text">
      <span class="summary-ring-num">${summary.daysUsed}</span>
      <span class="summary-ring-label">${i.ofNUsed(90)}</span>
    </div>
  `;
  container.appendChild(progress);

  // Status warning
  if (summary.isOverstaying) {
    const warn = document.createElement('div');
    warn.className = 'summary-alert summary-alert--danger';
    warn.innerHTML = i.overstayAlert(summary.overstayDays);
    container.appendChild(warn);
  } else if (summary.daysRemaining <= 10 && summary.daysRemaining > 0) {
    const warn = document.createElement('div');
    warn.className = 'summary-alert summary-alert--warning';
    warn.innerHTML = i.approachingAlert(summary.daysRemaining);
    container.appendChild(warn);
  }

  // Details
  const details = document.createElement('div');
  details.className = 'summary-details';

  const refContext = isToday ? i.last180Days : i.daysBefore(formatDate(refDateStr));
  const fromLabel = isToday ? i.tomorrow : formatDate(refDateStr);
  const items: [string, string][] = [
    [i.daysUsedLabel(refContext), String(summary.daysUsed)],
    [i.daysRemainingLabel, String(summary.daysRemaining)],
    [i.maxStayLabel(fromLabel), i.dayCount(summary.maxConsecutiveStay)],
  ];

  if (summary.nextDayFreed) {
    items.push([i.nextDayFreed, formatDate(summary.nextDayFreed)]);
  }

  for (const [lbl, val] of items) {
    const row = document.createElement('div');
    row.className = 'summary-detail-row';
    row.innerHTML = `<span class="summary-detail-label">${lbl}</span><span class="summary-detail-value">${val}</span>`;
    details.appendChild(row);
  }

  container.appendChild(details);

  // Clear all button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'summary-clear-btn';
  clearBtn.textContent = i.clearAllDates;
  clearBtn.addEventListener('click', () => {
    if (confirm(i.clearConfirm)) {
      schengenDays.clear();
      window.dispatchEvent(new CustomEvent('schengen-update'));
    }
  });
  container.appendChild(clearBtn);
}

function getStatusClass(summary: SchengenSummary): string {
  if (summary.isOverstaying) return 'status--danger';
  if (summary.daysRemaining <= 10) return 'status--warning';
  return 'status--ok';
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const locale = getLocale() === 'uk' ? 'uk-UA' : getLocale() === 'es' ? 'es-ES' : 'en-GB';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}