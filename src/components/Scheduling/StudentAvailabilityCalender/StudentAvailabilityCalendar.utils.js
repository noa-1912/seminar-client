import { HDate, gematriya, getSedra } from '@hebcal/core';

export const AvailabilityStatus = {
  Available: 0,
  Unavailable: 1,
};

export const AvailabilityReasonKind = {
  Personal: 0,
  Interview: 1,
};

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function toIsoDateKey(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

export function parseIsoDateKey(isoKey) {
  const [y, m, d] = isoKey.split('-').map((x) => Number(x));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function daysInMonth(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return new Date(y, m + 1, 0).getDate();
}

/** Parses "H:mm", "HH:mm", or "HH:mm:ss" to minutes from midnight. */
export function parseTimeToMinutes(timeStr) {
  if (timeStr == null) return NaN;
  const s = typeof timeStr === 'string' ? timeStr.trim() : String(timeStr);
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return NaN;
  return h * 60 + min;
}

export function normalizeTimeString(timeStr) {
  const mins = parseTimeToMinutes(timeStr);
  if (!Number.isFinite(mins)) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export function compareTime(a, b) {
  if (!a || !b) return 0;
  const ma = parseTimeToMinutes(a);
  const mb = parseTimeToMinutes(b);
  if (Number.isFinite(ma) && Number.isFinite(mb)) return ma - mb;
  return String(a).localeCompare(String(b));
}

export function formatHebrewLongDate(date) {
  try {
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function formatHebrewMonthYear(date) {
  try {
    return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

/** Day-of-month as Hebrew letter numerals (e.g. ג׳, י״ד, כ״א), not Arabic digits. */
export function hebrewCalendarDayLetters(dayNum) {
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  if (!Number.isFinite(dayNum) || dayNum < 1 || dayNum > 30) return '';
  if (dayNum <= 10) {
    return dayNum === 10 ? 'י׳' : `${ones[dayNum]}׳`;
  }
  if (dayNum === 15) return 'ט״ו';
  if (dayNum === 16) return 'ט״ז';
  if (dayNum < 20) {
    return `י״${ones[dayNum - 10]}`;
  }
  if (dayNum === 20) return 'כ׳';
  if (dayNum < 30) {
    return `כ״${ones[dayNum - 20]}`;
  }
  return 'ל׳';
}

export function getHebrewCalendarParts(date) {
  try {
    const dtf = new Intl.DateTimeFormat('he-IL', {
      calendar: 'hebrew',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const parts = dtf.formatToParts(date);
    let dayNum = null;
    let month = '';
    let hyear = null;
    for (const p of parts) {
      if (p.type === 'day') dayNum = parseInt(p.value, 10);
      if (p.type === 'month') month = p.value;
      if (p.type === 'year') {
        const digits = p.value.replace(/[^\d]/g, '');
        if (digits) hyear = parseInt(digits, 10);
      }
    }
    return { dayNum, month, hyear };
  } catch {
    return { dayNum: null, month: '', hyear: null };
  }
}

/** Hebrew (lunisolar) calendar — day as letters + month name (e.g. ג׳ אייר). */
export function formatHebrewCalendarDate(date) {
  const { dayNum, month } = getHebrewCalendarParts(date);
  if (dayNum == null || !month) return '';
  const letters = hebrewCalendarDayLetters(dayNum);
  if (!letters) return month;
  return `${letters} ${month}`;
}

/** Same as above plus Hebrew year as letters (via gematriya). */
export function formatHebrewCalendarDateWithYear(date) {
  const { dayNum, month, hyear } = getHebrewCalendarParts(date);
  if (dayNum == null || !month) return '';
  const dLetters = hebrewCalendarDayLetters(dayNum);
  const yLetters = hyear != null && hyear > 0 ? gematriya(hyear) : '';
  if (!dLetters) return [month, yLetters].filter(Boolean).join(' ');
  return [dLetters, month, yLetters].filter(Boolean).join(' ');
}

/** English keys from @hebcal/core sedra — Hebrew labels for UI. */
const PARSHA_EN_TO_HE = {
  Bereshit: 'בראשית',
  Noach: 'נח',
  'Lech-Lecha': 'לך־לך',
  Vayera: 'וירא',
  'Chayei Sara': 'חיי שרה',
  Toldot: 'תולדות',
  Vayetzei: 'ויצא',
  Vayishlach: 'וישלח',
  Vayeshev: 'וישב',
  Miketz: 'מקץ',
  Vayigash: 'ויגש',
  Vayechi: 'ויחי',
  Shemot: 'שמות',
  Vaera: 'וארא',
  Bo: 'בא',
  Beshalach: 'בשלח',
  Yitro: 'יתרו',
  Mishpatim: 'משפטים',
  Terumah: 'תרומה',
  Tetzaveh: 'תצוה',
  'Ki Tisa': 'כי תשא',
  Vayakhel: 'ויקהל',
  Pekudei: 'פקודי',
  Vayikra: 'ויקרא',
  Tzav: 'צו',
  Shmini: 'שמיני',
  Tazria: 'תזריע',
  Metzora: 'מצורע',
  'Achrei Mot': 'אחרי מות',
  Kedoshim: 'קדושים',
  Emor: 'אמור',
  Behar: 'בהר',
  Bechukotai: 'בחוקתי',
  Bamidbar: 'במדבר',
  Nasso: 'נשא',
  "Beha'alotcha": 'בהעלותך',
  "Sh'lach": 'שלח לך',
  Korach: 'קרח',
  Chukat: 'חוקת',
  Balak: 'בלק',
  Pinchas: 'פינחס',
  Matot: 'מטות',
  Masei: 'מסעי',
  Devarim: 'דברים',
  Vaetchanan: 'ואתחנן',
  Eikev: 'עקב',
  "Re'eh": 'ראה',
  Shoftim: 'שופטים',
  'Ki Teitzei': 'כי תצא',
  'Ki Tavo': 'כי תבוא',
  Nitzavim: 'נצבים',
  Vayeilech: 'וילך',
  "Ha'azinu": 'האזינו',
  'Vezot Haberakhah': 'וזאת הברכה',
  'Rosh Hashana': 'ראש השנה',
  'Yom Kippur': 'יום כיפור',
  Sukkot: 'סוכות',
  'Sukkot Shabbat Chol ha-Moed': 'שבת חול המועד סוכות',
  'Shmini Atzeret': 'שמיני עצרת',
  Pesach: 'פסח',
  'Pesach I': 'פסח א׳',
  'Pesach Shabbat Chol ha-Moed': 'שבת חול המועד פסח',
  'Pesach VII': 'שביעי של פסח',
  'Pesach VIII': 'אחרון של פסח',
  Shavuot: 'שבועות',
};

export function formatParshatHashavua(date) {
  try {
    const hd = new HDate(date);
    const sedra = getSedra(hd.getFullYear(), true);
    const r = sedra.lookup(hd);
    const he = r.parsha.map((en) => PARSHA_EN_TO_HE[en] ?? en);
    return `פרשת ${he.join('־')}`;
  } catch {
    return '';
  }
}

/** Local civil Saturday (week starts Sunday=0) — treated as Shabbat for day-level scheduling. */
export function isShabbatDate(date) {
  return date.getDay() === 6;
}

export function weekdayHeadersHe() {
  return ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
}

export function getSundayBasedWeekdayIndex(date) {
  return date.getDay();
}

export function clampToTodayIfNeeded(date, minDate) {
  if (!minDate) return date;
  return date < minDate ? minDate : date;
}

function pickSlotTime(raw, fallbacks) {
  for (const key of fallbacks) {
    const v = raw?.[key];
    if (v != null && v !== '') return typeof v === 'string' ? v : String(v);
  }
  return '';
}

export function normalizeSlots(slots) {
  const safe = Array.isArray(slots) ? slots : [];
  return safe
    .map((s) => {
      if (!s || typeof s !== 'object') return null;
      const startRaw = pickSlotTime(s, ['start', 'Start', 'startTime', 'StartTime', 'from', 'From']);
      const endRaw = pickSlotTime(s, ['end', 'End', 'endTime', 'EndTime', 'to', 'To']);
      const start = normalizeTimeString(startRaw);
      const end = normalizeTimeString(endRaw);
      if (!start || !end) return null;
      const ms = parseTimeToMinutes(start);
      const me = parseTimeToMinutes(end);
      if (!Number.isFinite(ms) || !Number.isFinite(me) || me <= ms) return null;
      return {
        id: s.id ?? s.studentAvailabilityId ?? s.studentAvailabilityID ?? undefined,
        start,
        end,
        status: Number.isFinite(s.status) ? s.status : AvailabilityStatus.Available,
        reasonStudent: typeof s.reasonStudent === 'string' ? s.reasonStudent : '',
        reasonStatus: Number.isFinite(s.reasonStatus) ? s.reasonStatus : AvailabilityReasonKind.Personal,
      };
    })
    .filter(Boolean)
    .sort((a, b) => compareTime(a.start, b.start));
}

export function normalizeDayEntry(entry) {
  if (Array.isArray(entry)) {
    return {
      dayStatus: AvailabilityStatus.Available,
      dayReasonStudent: '',
      dayReasonStatus: AvailabilityReasonKind.Personal,
      slots: normalizeSlots(entry),
    };
  }

  const dayStatus = Number.isFinite(entry?.dayStatus) ? entry.dayStatus : AvailabilityStatus.Available;
  const dayReasonStudent = typeof entry?.dayReasonStudent === 'string' ? entry.dayReasonStudent : '';
  const dayReasonStatus = Number.isFinite(entry?.dayReasonStatus)
    ? entry.dayReasonStatus
    : AvailabilityReasonKind.Personal;
  const slots = normalizeSlots(entry?.slots);

  return { dayStatus, dayReasonStudent, dayReasonStatus, slots };
}

export function slotLabel(slot) {
  return `${slot.start}–${slot.end}`;
}

export function defaultSlot() {
  return { start: '09:00', end: '10:00' };
}

/** When editing today's date, default new exception times from "now" (5-minute steps, same as time inputs). */
export function defaultSlotForDateKey(isoDateKey) {
  const todayKey = toIsoDateKey(new Date());
  if (isoDateKey !== todayKey) return defaultSlot();

  const now = new Date();
  const totalMin = now.getHours() * 60 + now.getMinutes();
  const rounded = Math.floor(totalMin / 5) * 5;
  const lastMin = 24 * 60 - 1;
  let endMin = rounded + 60;
  if (endMin > lastMin) endMin = lastMin;
  if (endMin <= rounded) endMin = Math.min(lastMin, rounded + 5);

  const sh = Math.floor(rounded / 60);
  const sm = rounded % 60;
  const eh = Math.floor(endMin / 60);
  const em = endMin % 60;
  return {
    start: `${pad2(sh)}:${pad2(sm)}`,
    end: `${pad2(eh)}:${pad2(em)}`,
  };
}

export function dayAriaLabel(date, summary, disabled) {
  const day = formatHebrewLongDate(date);
  const hebrewCal = formatHebrewCalendarDate(date);
  const calPart = hebrewCal ? `, ${hebrewCal}` : '';
  const extra = summary?.text ? `, ${summary.text}` : '';
  if (disabled && isShabbatDate(date)) {
    const parsha = formatParshatHashavua(date);
    return `${day}${calPart}${extra}${parsha ? `, ${parsha}` : ''}`;
  }
  const state = disabled ? ', לא ניתן לעריכה' : '';
  return `${day}${calPart}${extra}${state}`;
}

export function isBeforeMinDate(date, minDate) {
  if (!minDate) return false;
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const minStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  return dayStart < minStart;
}

export function getDayDisabled(date, minDate) {
  if (isShabbatDate(date)) return true;
  return isBeforeMinDate(date, minDate);
}
