import { Translations } from '../types';

function ukDays(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return 'днів';
  if (last === 1) return 'день';
  if (last >= 2 && last <= 4) return 'дні';
  return 'днів';
}

export const uk: Translations = {
  appTitle: 'Калькулятор перебування Шенген',
  appSubtitle: '90 днів у будь-якому періоді 180 днів',
  pageTitle: 'Калькулятор перебування Шенген',

  months: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
  daysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
  toggleDay: 'Один день',
  addTrip: 'Додати поїздку',
  removeTrip: 'Видалити поїздку',
  tapEntryDate: 'Оберіть дату в\'їзду',
  tapFirstDayToRemove: 'Оберіть перший день для видалення',
  entryDateSelected: (date) => `В'їзд: <strong>${date}</strong> — тепер оберіть дату виїзду`,
  removingFromSelected: (date) => `Видалення з: <strong>${date}</strong> — тепер оберіть останній день`,
  cancel: 'Скасувати',
  previousMonth: 'Попередній місяць',
  nextMonth: 'Наступний місяць',
  today: 'Сьогодні',

  legendSchengen: 'У Шенгені',
  legendWarning: 'Близько до ліміту (80+)',
  legendOverstay: 'Перевищення (90+)',
  legendToday: 'Сьогодні',

  calculatingAsOf: 'Розрахунок на дату',
  referenceDateLabel: 'Дата для розрахунку',
  resetToToday: 'Повернути на сьогодні',
  daysRemaining: 'днів залишилось',
  ofNUsed: (n) => `з ${n} використано`,
  overstayAlert: (days) => `<strong>Перевищення!</strong> Ви перевищили ліміт 90 днів на ${days} ${ukDays(days)}.`,
  approachingAlert: (days) => `<strong>Наближення до ліміту!</strong> Залишилось лише ${days} ${ukDays(days)}.`,
  daysUsedLabel: (ctx) => `Використано днів (${ctx})`,
  daysRemainingLabel: 'Днів залишилось',
  maxStayLabel: (from) => `Макс. безперервне перебування від ${from}`,
  dayCount: (n) => `${n} ${ukDays(n)}`,
  nextDayFreed: 'Наступний вільний день',
  last180Days: 'останні 180 днів',
  daysBefore: (date) => `180 днів до ${date}`,
  tomorrow: 'завтра',
  clearAllDates: 'Очистити всі дати',
  clearConfirm: 'Видалити всі позначені дати? Цю дію не можна скасувати.',
};