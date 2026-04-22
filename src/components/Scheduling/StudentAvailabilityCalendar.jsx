import { useEffect, useMemo, useState } from 'react';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { HDate, gematriya, getSedra } from '@hebcal/core';

import './StudentAvailabilityCalendar.css';

const AvailabilityStatus = {
  Available: 0,
  Unavailable: 1,
};

const AvailabilityReasonKind = {
  Personal: 0,
  Interview: 1,
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toIsoDateKey(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

function parseIsoDateKey(isoKey) {
  const [y, m, d] = isoKey.split('-').map((x) => Number(x));
  return new Date(y, (m || 1) - 1, d || 1);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function daysInMonth(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return new Date(y, m + 1, 0).getDate();
}

/** Parses "H:mm", "HH:mm", or "HH:mm:ss" to minutes from midnight. */
function parseTimeToMinutes(timeStr) {
  if (timeStr == null) return NaN;
  const s = typeof timeStr === 'string' ? timeStr.trim() : String(timeStr);
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return NaN;
  return h * 60 + min;
}

function normalizeTimeString(timeStr) {
  const mins = parseTimeToMinutes(timeStr);
  if (!Number.isFinite(mins)) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function compareTime(a, b) {
  if (!a || !b) return 0;
  const ma = parseTimeToMinutes(a);
  const mb = parseTimeToMinutes(b);
  if (Number.isFinite(ma) && Number.isFinite(mb)) return ma - mb;
  return String(a).localeCompare(String(b));
}

function formatHebrewLongDate(date) {
  try {
    return new Intl.DateTimeFormat('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(
      date
    );
  } catch {
    return date.toLocaleDateString();
  }
}

function formatHebrewMonthYear(date) {
  try {
    return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

/** Day-of-month as Hebrew letter numerals (e.g. ג׳, י״ד, כ״א), not Arabic digits. */
function hebrewCalendarDayLetters(dayNum) {
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

function getHebrewCalendarParts(date) {
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
function formatHebrewCalendarDate(date) {
  const { dayNum, month } = getHebrewCalendarParts(date);
  if (dayNum == null || !month) return '';
  const letters = hebrewCalendarDayLetters(dayNum);
  if (!letters) return month;
  return `${letters} ${month}`;
}

/** Same as above plus Hebrew year as letters (via gematriya). */
function formatHebrewCalendarDateWithYear(date) {
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

function formatParshatHashavua(date) {
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
function isShabbatDate(date) {
  return date.getDay() === 6;
}

function weekdayHeadersHe() {
  return ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
}

function getSundayBasedWeekdayIndex(date) {
  return date.getDay();
}

function clampToTodayIfNeeded(date, minDate) {
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

function normalizeSlots(slots) {
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

function normalizeDayEntry(entry) {
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
  const dayReasonStatus = Number.isFinite(entry?.dayReasonStatus) ? entry.dayReasonStatus : AvailabilityReasonKind.Personal;
  const slots = normalizeSlots(entry?.slots);

  return { dayStatus, dayReasonStudent, dayReasonStatus, slots };
}

function slotLabel(slot) {
  return `${slot.start}–${slot.end}`;
}

function defaultSlot() {
  return { start: '09:00', end: '10:00' };
}

/** When editing today's date, default new exception times from "now" (5-minute steps, same as time inputs). */
function defaultSlotForDateKey(isoDateKey) {
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

function dayAriaLabel(date, summary, disabled) {
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

function isBeforeMinDate(date, minDate) {
  if (!minDate) return false;
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const minStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  return dayStart < minStart;
}

function getDayDisabled(date, minDate) {
  if (isShabbatDate(date)) return true;
  return isBeforeMinDate(date, minDate);
}

/** MUI Switch: neutral gray track (no green); gentle contrast on / off */
function SlotAvailabilityLineToggle({ available, onChange, dense, ariaLabel }) {
  const theme = useTheme();
  const trackOff = alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.24 : 0.16);
  const trackOn = alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.42 : 0.34);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      spacing={1.25}
      sx={{
        flexWrap: 'wrap',
        rowGap: 0.75,
        columnGap: 1.25,
        direction: 'ltr',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ userSelect: 'none', fontWeight: 500, minWidth: 'fit-content' }}>
        לא זמין
      </Typography>
      <Switch
        checked={available}
        onChange={(e) => onChange(e.target.checked)}
        size={dense ? 'small' : 'medium'}
        inputProps={{ 'aria-label': ariaLabel }}
        sx={{
          mx: 0,
          '& .MuiSwitch-track': {
            borderRadius: 4,
            opacity: 1,
            backgroundColor: trackOff,
          },
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              color: theme.palette.common.white,
            },
            '&.Mui-checked + .MuiSwitch-track': {
              backgroundColor: trackOn,
              opacity: 1,
            },
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ userSelect: 'none', fontWeight: 500, minWidth: 'fit-content' }}>
        זמין
      </Typography>
    </Stack>
  );
}

/**
 * StudentAvailabilityCalendar
 *
 * Props:
 * - value:
 *   - legacy: { [dateKey: string]: Slot[] }
 *   - preferred: {
 *       [dateKey: string]: {
 *         dayStatus?: 0|1,
 *         dayReasonStudent?: string,
 *         dayReasonStatus?: 0|1,
 *         slots?: Slot[]
 *       }
 *     }
 * - onChange(nextValue)
 * - onCommitDay?(dateKey, dayEntry): fired when the day's drawer is closed,
 *   so callers can persist the day's edits. dayEntry matches the preferred value shape.
 * - minDate?: Date (e.g. new Date())
 *
 * Shabbat: civil Saturdays are disabled — availability cannot be set for those days.
 */
export default function StudentAvailabilityCalendar({ value, onChange, onCommitDay, minDate }) {
  const theme = useTheme();
  const availabilityByDate = value || {};
  const [cursorMonth, setCursorMonth] = useState(() => startOfMonth(clampToTodayIfNeeded(new Date(), minDate)));
  const [selectedDateKey, setSelectedDateKey] = useState(() => toIsoDateKey(clampToTodayIfNeeded(new Date(), minDate)));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const todayKey = useMemo(() => toIsoDateKey(new Date()), []);
  const selectedDate = useMemo(() => parseIsoDateKey(selectedDateKey), [selectedDateKey]);
  const selectedDayEntry = useMemo(
    () => normalizeDayEntry(availabilityByDate[selectedDateKey]),
    [availabilityByDate, selectedDateKey]
  );
  const selectedSlots = selectedDayEntry.slots;
  const selectedDayStatus = selectedDayEntry.dayStatus;
  const selectedDayReasonStudent = selectedDayEntry.dayReasonStudent;
  const selectedDayReasonStatus = selectedDayEntry.dayReasonStatus;

  const monthGrid = useMemo(() => {
    const monthStart = startOfMonth(cursorMonth);
    const dim = daysInMonth(monthStart);
    const offset = getSundayBasedWeekdayIndex(monthStart);
    const cells = [];
    for (let i = 0; i < offset; i += 1) cells.push(null);
    for (let day = 1; day <= dim; day += 1) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      cells.push(date);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursorMonth]);

  function openDay(date) {
    if (isShabbatDate(date)) return;
    const key = toIsoDateKey(date);
    if (minDate) {
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const minStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (dayStart < minStart) return;
    }
    setSelectedDateKey(key);
    setDrawerOpen(true);
  }

  function closeDrawerAndCommit() {
    if (!drawerOpen) return;
    setDrawerOpen(false);
    try {
      onCommitDay?.(selectedDateKey, selectedDayEntry);
    } catch {
      /* commit failures are surfaced by the caller's handler; never break UI close */
    }
  }

  function setSelectedDayEntry(patch) {
    const nextEntry = { ...selectedDayEntry, ...patch };
    const next = { ...availabilityByDate, [selectedDateKey]: nextEntry };
    onChange?.(next);
  }

  function removeSlot(idx) {
    const next = selectedSlots.filter((_, i) => i !== idx);
    setSelectedDayEntry({ slots: normalizeSlots(next) });
  }

  function updateSlot(idx, patch) {
    const next = selectedSlots.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    setSelectedDayEntry({ slots: normalizeSlots(next) });
  }

  function addSlot(slot) {
    const next = [...selectedSlots, slot].sort((a, b) => compareTime(a.start, b.start));
    setSelectedDayEntry({ slots: normalizeSlots(next) });
  }

  const [newStart, setNewStart] = useState(defaultSlot().start);
  const [newEnd, setNewEnd] = useState(defaultSlot().end);
  const [newIsAvailable, setNewIsAvailable] = useState(true);
  const [newReasonStudent, setNewReasonStudent] = useState('');
  const [newReasonStatus, setNewReasonStatus] = useState(AvailabilityReasonKind.Personal);

  useEffect(() => {
    if (!drawerOpen) return;
    setNewIsAvailable(selectedDayStatus === AvailabilityStatus.Unavailable);
  }, [selectedDayStatus, selectedDateKey, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    setNewReasonStudent('');
    setNewReasonStatus(AvailabilityReasonKind.Personal);
  }, [selectedDateKey, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (newIsAvailable) {
      setNewReasonStudent('');
      setNewReasonStatus(AvailabilityReasonKind.Personal);
    }
  }, [newIsAvailable, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const d = defaultSlotForDateKey(selectedDateKey);
    setNewStart(d.start);
    setNewEnd(d.end);
  }, [selectedDateKey, drawerOpen]);

  const newSlotError = useMemo(() => {
    if (!newStart?.trim?.() || !newEnd?.trim?.()) return 'בחר/י שעה התחלה וסיום';
    const ms = parseTimeToMinutes(newStart);
    const me = parseTimeToMinutes(newEnd);
    if (!Number.isFinite(ms) || !Number.isFinite(me)) return 'פורמט שעה לא תקין';
    if (me <= ms) return 'שעת סיום חייבת להיות אחרי שעת ההתחלה';
    return '';
  }, [newStart, newEnd]);

  function newSlotMetaFields() {
    const status = newIsAvailable ? AvailabilityStatus.Available : AvailabilityStatus.Unavailable;
    const reasonStatus = newIsAvailable ? AvailabilityReasonKind.Personal : newReasonStatus;
    const reasonStudent =
      !newIsAvailable && newReasonStatus === AvailabilityReasonKind.Personal ? newReasonStudent : '';
    return { status, reasonStudent, reasonStatus };
  }

  function commitAddNewSlot() {
    if (newSlotError) return;
    addSlot({
      ...newSlotMetaFields(),
      start: normalizeTimeString(newStart),
      end: normalizeTimeString(newEnd),
    });
  }

  function quickAdd(range) {
    let start = '09:00';
    let end = '12:00';
    if (range === 'noon') {
      start = '12:00';
      end = '15:00';
    } else if (range === 'evening') {
      start = '15:00';
      end = '18:00';
    } else if (range !== 'morning') {
      return;
    }
    addSlot({
      ...newSlotMetaFields(),
      start,
      end,
    });
  }

  function daySummary(date) {
    if (!date) return null;
    const key = toIsoDateKey(date);
    const entry = normalizeDayEntry(availabilityByDate[key]);
    const slots = entry.slots;
    const dayStatus = entry.dayStatus;

    const availableCount = slots.filter((s) => s.status === AvailabilityStatus.Available).length;
    const unavailableCount = slots.length - availableCount;

    if (dayStatus === AvailabilityStatus.Available) {
      if (slots.length === 0) return { kind: 'some', text: 'זמין כל היום' };
      return { kind: 'some', text: `זמין · ${unavailableCount} חסומים` };
    }

    if (slots.length === 0) return { kind: 'warn', text: 'לא זמין כל היום' };
    return { kind: 'some', text: `לא זמין · ${availableCount} זמינים` };
  }

  const headers = weekdayHeadersHe();
  const monthLabel = formatHebrewMonthYear(cursorMonth);
  const cursorMonthKey = useMemo(() => toIsoDateKey(startOfMonth(cursorMonth)), [cursorMonth]);

  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(cursorMonth);
    const dim = daysInMonth(monthStart);
    let totalDays = 0;
    let daysUnavailable = 0;
    let daysWithExceptions = 0;

    for (let day = 1; day <= dim; day += 1) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      if (isShabbatDate(date)) continue;
      if (minDate) {
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const minStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        if (dayStart < minStart) continue;
      }

      totalDays += 1;
      const entry = normalizeDayEntry(availabilityByDate[toIsoDateKey(date)]);
      if (entry.dayStatus === AvailabilityStatus.Unavailable) daysUnavailable += 1;
      if (entry.slots.length > 0) daysWithExceptions += 1;
    }

    return { totalDays, daysUnavailable, daysWithExceptions };
  }, [availabilityByDate, cursorMonth, minDate]);

  const monthSummaryLabels = useMemo(
    () => ({
      editing:
        monthStats.totalDays === 1 ? 'יום אחד זמין לעריכה' : `${monthStats.totalDays} ימים זמינים לעריכה`,
      exceptions:
        monthStats.daysWithExceptions === 1
          ? 'יום אחד עם חריגות'
          : `${monthStats.daysWithExceptions} ימים עם חריגות`,
      unavailable:
        monthStats.daysUnavailable === 1 ? 'יום אחד לא זמין' : `${monthStats.daysUnavailable} ימים לא זמינים`,
    }),
    [monthStats]
  );

  const subtleHeaderBg = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06);
  const summaryPillRadius = '999px';
  const summaryPanelRadius = '24px';
  const summaryMutedFill = alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.12 : 0.08);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="stretch"
        sx={{ width: '100%' }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 0,
            borderRadius: summaryPanelRadius,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 2,
              bgcolor: subtleHeaderBg,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
              <Stack spacing={0.5} sx={{ textAlign: 'right', alignItems: 'flex-start' }}>
                <Typography variant="body2" color="text.secondary">
                  סיכום לחודש
                </Typography>
                <Typography variant="h5" component="p" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {monthLabel}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap>
                <Tooltip title="חודש קודם">
                  <IconButton
                    aria-label="חודש קודם"
                    onClick={() => setCursorMonth((m) => addMonths(m, -1))}
                    size="small"
                    className="sac-btnSquare"
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="חודש הבא">
                  <IconButton
                    aria-label="חודש הבא"
                    onClick={() => setCursorMonth((m) => addMonths(m, 1))}
                    size="small"
                    className="sac-btnSquare"
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const next = startOfMonth(clampToTodayIfNeeded(new Date(), minDate));
                    if (toIsoDateKey(next) === cursorMonthKey) return;
                    setCursorMonth(next);
                  }}
                  className="sac-btnSquare"
                >
                  חזרה להיום
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2.5 }}>
            <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ justifyContent: 'flex-start' }}>
              <Chip
                size="small"
                label={monthSummaryLabels.editing}
                sx={{
                  borderRadius: summaryPillRadius,
                  height: 32,
                  bgcolor: summaryMutedFill,
                  border: 'none',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
              <Chip
                size="small"
                variant="outlined"
                label={monthSummaryLabels.exceptions}
                sx={{
                  borderRadius: summaryPillRadius,
                  height: 32,
                  fontWeight: 600,
                  bgcolor: 'background.paper',
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
              <Chip
                size="small"
                variant="outlined"
                label={monthSummaryLabels.unavailable}
                sx={{
                  borderRadius: summaryPillRadius,
                  height: 32,
                  fontWeight: 600,
                  color: 'warning.main',
                  borderColor: 'warning.main',
                  bgcolor: 'background.paper',
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ justifyContent: 'flex-end' }}>
              <Chip
                size="small"
                label='טיפ: זמין כל היום ואז חוסמים שעות'
                sx={{
                  borderRadius: summaryPillRadius,
                  height: 32,
                  bgcolor: summaryMutedFill,
                  border: 'none',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
              <Chip
                size="small"
                variant="outlined"
                label='טיפ: לא זמין כל היום ואז מוסיפים שעות זמינות'
                sx={{
                  borderRadius: summaryPillRadius,
                  height: 32,
                  fontWeight: 600,
                  bgcolor: 'background.paper',
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            </Stack>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 280 },
            flexShrink: 0,
            borderRadius: summaryPanelRadius,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            alignSelf: { xs: 'stretch', md: 'flex-start' },
          }}
        >
          <Box sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: subtleHeaderBg }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'right' }}>
              מקרא
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 2 }}>
            <Stack spacing={1.75} sx={{ alignItems: 'stretch' }}>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    flexShrink: 0,
                    boxShadow: `0 0 0 1px ${alpha(theme.palette.success.main, 0.25)}`,
                  }}
                />
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, lineHeight: 1.35 }}>
                  זמין (או רוב היום זמין)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                    flexShrink: 0,
                    boxShadow: `0 0 0 1px ${alpha(theme.palette.warning.main, 0.25)}`,
                  }}
                />
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, lineHeight: 1.35 }}>
                  לא זמין (או רוב היום לא זמין)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'info.main',
                    flexShrink: 0,
                    boxShadow: `0 0 0 1px ${alpha(theme.palette.info.main, 0.25)}`,
                  }}
                />
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, lineHeight: 1.35 }}>
                  יש חריגות לשעות
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.2 : 0.12),
                    flexShrink: 0,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, lineHeight: 1.35 }}>
                  שבת — פרשת השבוע
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Stack>

      <Paper
        elevation={0}
        className="sac-square"
        sx={{
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 1,
            }}
          >
            {headers.map((h) => (
              <Typography key={h} variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontWeight: 600 }}>
                {h}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: { xs: 1, sm: 1.25 },
            }}
          >
            {monthGrid.map((date, idx) => {
              if (!date)
                return (
                  <Box
                    key={`empty-${idx}`}
                    className="sac-square"
                    sx={{
                      aspectRatio: '1 / 1',
                      minHeight: { xs: 72, sm: 88 },
                    }}
                  />
                );

              const key = toIsoDateKey(date);
              const entry = normalizeDayEntry(availabilityByDate[key]);
              const dayStatus = entry.dayStatus;
              const hasExceptions = entry.slots.length > 0;
              const summary = daySummary(date);
              const exceptionsCount = entry.slots.length;

              const disabled = getDayDisabled(date, minDate);
              const isShabbat = isShabbatDate(date);
              const hebrewCalLine = formatHebrewCalendarDate(date);
              const isSelected = drawerOpen && key === selectedDateKey;
              const isToday = key === todayKey;

              const isDayUnavailable = dayStatus === AvailabilityStatus.Unavailable;
              const statusColor = isDayUnavailable ? theme.palette.warning.main : theme.palette.success.main;
              const statusTint = alpha(statusColor, theme.palette.mode === 'dark' ? 0.14 : 0.1);
              const selectedOutline = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.55 : 0.4);
              const exceptionDayBg = alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.1 : 0.06);
              const unavailableDayBg = alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.1 : 0.06);
              const selectedDayBg = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08);
              const exceptionHoverBg = alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.16 : 0.1);
              const unavailableHoverBg = alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.16 : 0.1);

              return (
                <Button
                  key={key}
                  onClick={() => openDay(date)}
                  disabled={disabled}
                  aria-label={dayAriaLabel(date, summary, disabled)}
                  variant="text"
                  className="sac-square"
                  sx={{
                    aspectRatio: '1 / 1',
                    minHeight: { xs: 72, sm: 88 },
                    p: 1.25,
                    textAlign: 'right',
                    justifyContent: 'flex-start',
                    alignItems: 'stretch',
                    border: '1px solid',
                    borderColor: isSelected
                      ? 'primary.main'
                      : isShabbat
                        ? 'divider'
                        : isDayUnavailable
                          ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.32 : 0.22)
                          : hasExceptions
                            ? alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.32 : 0.22)
                            : 'divider',
                    bgcolor: disabled
                      ? 'background.paper'
                      : isSelected
                        ? selectedDayBg
                        : isDayUnavailable
                          ? unavailableDayBg
                          : hasExceptions
                            ? exceptionDayBg
                            : 'background.paper',
                    boxShadow: isSelected ? theme.shadows[1] : 'none',
                    transition: (t) =>
                      t.transitions.create(['background-color', 'box-shadow', 'border-color'], { duration: t.transitions.duration.short }),
                    '&:hover': {
                      bgcolor: disabled
                        ? 'background.paper'
                        : isSelected
                          ? selectedDayBg
                          : isDayUnavailable
                            ? unavailableHoverBg
                            : hasExceptions
                              ? exceptionHoverBg
                              : 'action.hover',
                      borderColor: isSelected
                        ? 'primary.main'
                        : isDayUnavailable
                          ? alpha(theme.palette.error.main, 0.38)
                          : hasExceptions
                            ? alpha(theme.palette.info.main, 0.38)
                            : 'divider',
                      boxShadow: theme.shadows[1],
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${selectedOutline}`,
                      outlineOffset: 2,
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'background.paper',
                      // Shabbat stays fully legible; other disabled days (e.g. before min) stay muted
                      opacity: isShabbat ? 1 : 0.5,
                      ...(isShabbat
                        ? {
                            color: 'text.primary',
                            WebkitTextFillColor: 'currentcolor',
                          }
                        : {}),
                    },
                  }}
                >
                  <Stack spacing={0.75} sx={{ width: '100%' }}>
                    {isShabbat ? (
                      <>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {date.getDate()}
                            </Typography>
                            {hebrewCalLine ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                className="sac-twoLineClamp"
                                sx={{ lineHeight: 1.15, fontSize: '0.72rem' }}
                              >
                                {hebrewCalLine}
                              </Typography>
                            ) : null}
                            {isToday ? (
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                היום
                              </Typography>
                            ) : null}
                          </Stack>
                          <Box
                            className="sac-square"
                            sx={{
                              px: 1,
                              py: 0.25,
                              bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.12 : 0.08),
                              border: '1px solid',
                              borderColor: 'divider',
                              alignSelf: 'flex-start',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              שבת
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.primary"
                          sx={{
                            lineHeight: 1.25,
                            fontWeight: 700,
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {formatParshatHashavua(date) || 'פרשת השבוע'}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {date.getDate()}
                            </Typography>
                            {hebrewCalLine ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ lineHeight: 1.15, fontSize: '0.72rem', display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                              >
                                {hebrewCalLine}
                              </Typography>
                            ) : null}
                            {isToday ? (
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                היום
                              </Typography>
                            ) : null}
                          </Stack>

                          <Box
                            className="sac-square"
                            sx={{
                              px: 1,
                              py: 0.25,
                              bgcolor: statusTint,
                              border: '1px solid',
                              borderColor: alpha(statusColor, theme.palette.mode === 'dark' ? 0.35 : 0.28),
                              alignSelf: 'flex-start',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {dayStatus === AvailabilityStatus.Unavailable ? 'לא זמין/ה' : 'זמינה'}
                            </Typography>
                          </Box>
                        </Stack>

                        {hasExceptions ? (
                          <Chip
                            size="small"
                            color="info"
                            variant="outlined"
                            label={exceptionsCount === 1 ? 'חריגה אחת לשעות' : `${exceptionsCount} חריגות לשעות`}
                            className="sac-chipSquare"
                            sx={{ alignSelf: 'flex-start', fontWeight: 600, maxWidth: '100%' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.25, fontWeight: 500 }}>
                            ללא חריגות
                          </Typography>
                        )}

                        {summary ? (
                          <Typography variant="caption" color="text.secondary" className="sac-twoLineClamp" sx={{ lineHeight: 1.25 }}>
                            {summary.text}
                          </Typography>
                        ) : null}
                      </>
                    )}
                  </Stack>
                </Button>
              );
            })}
          </Box>
        </Box>
      </Paper>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawerAndCommit}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460 },
            p: 2.5,
            borderRadius: 0,
            bgcolor: 'background.paper',
            maxHeight: '100vh',
            height: '100%',
            boxSizing: 'border-box',
            overflowY: 'auto',
          },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                עריכת יום
              </Typography>
              <Typography variant="h6" component="p">
                {formatHebrewLongDate(selectedDate)}
              </Typography>
              {formatHebrewCalendarDateWithYear(selectedDate) ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {formatHebrewCalendarDateWithYear(selectedDate)}
                </Typography>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                בחרי מצב יום והוסיפי חריגות לשעות מיוחדות
              </Typography>
            </Stack>

            <IconButton aria-label="סגירה" onClick={closeDrawerAndCommit} size="small" className="sac-btnSquare">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Card variant="outlined" className="sac-square" sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    מצב יום
                  </Typography>

                  <ToggleButtonGroup
                    exclusive
                    value={selectedDayStatus}
                    onChange={(_, next) => {
                      if (next === null || next === undefined) return;
                      setSelectedDayEntry({ dayStatus: next });
                    }}
                    aria-label="מצב יום"
                    fullWidth
                    className="sac-toggleSquare"
                  >
                    <ToggleButton value={AvailabilityStatus.Available} aria-label="זמין כל היום">
                      זמין/ה כל היום
                    </ToggleButton>
                    <ToggleButton value={AvailabilityStatus.Unavailable} aria-label="לא זמין כל היום">
                      לא זמין/ה כל היום
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Typography variant="body2" color="text.secondary">
                    {selectedDayStatus === AvailabilityStatus.Available
                      ? 'כדי לחסום שעות בודדות, הוסיפי חריגה מסוג "לא זמין"'
                      : 'כדי לאפשר שעות בודדות, הוסיפי חריגה מסוג "זמין"'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {selectedDayStatus === AvailabilityStatus.Unavailable ? (
              <Card variant="outlined" className="sac-square" sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      סיבה ליום
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        clickable
                        onClick={() => setSelectedDayEntry({ dayReasonStatus: AvailabilityReasonKind.Personal })}
                        variant={selectedDayReasonStatus === AvailabilityReasonKind.Personal ? 'filled' : 'outlined'}
                        label="פרטי"
                        className="sac-chipSquare"
                      />
                      <Chip
                        clickable
                        onClick={() =>
                          setSelectedDayEntry({
                            dayReasonStatus: AvailabilityReasonKind.Interview,
                            dayReasonStudent: '',
                          })
                        }
                        variant={selectedDayReasonStatus === AvailabilityReasonKind.Interview ? 'filled' : 'outlined'}
                        label="ראיון"
                        className="sac-chipSquare"
                      />
                    </Stack>
                    {selectedDayReasonStatus === AvailabilityReasonKind.Personal ? (
                      <TextField
                        label="סיבה (אופציונלי)"
                        value={selectedDayReasonStudent}
                        onChange={(e) => setSelectedDayEntry({ dayReasonStudent: e.target.value })}
                        fullWidth
                        className="sac-textFieldSquare"
                      />
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

            <Card variant="outlined" className="sac-square" sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      הוספת חריגה
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {newIsAvailable ? 'חריגה מסוג "זמין" מאפשרת ראיון בשעות האלה' : 'חריגה מסוג "לא זמין" חוסמת ראיון בשעות האלה'}
                    </Typography>
                  </Stack>

                  <SlotAvailabilityLineToggle
                    available={newIsAvailable}
                    onChange={setNewIsAvailable}
                    ariaLabel="סוג חריגה חדשה"
                  />

                  {!newIsAvailable ? (
                    <Stack spacing={1.25}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          clickable
                          onClick={() => setNewReasonStatus(AvailabilityReasonKind.Personal)}
                          variant={newReasonStatus === AvailabilityReasonKind.Personal ? 'filled' : 'outlined'}
                          label="פרטי"
                          className="sac-chipSquare"
                        />
                        <Chip
                          clickable
                          onClick={() => {
                            setNewReasonStatus(AvailabilityReasonKind.Interview);
                            setNewReasonStudent('');
                          }}
                          variant={newReasonStatus === AvailabilityReasonKind.Interview ? 'filled' : 'outlined'}
                          label="ראיון"
                          className="sac-chipSquare"
                        />
                      </Stack>
                      {newReasonStatus === AvailabilityReasonKind.Personal ? (
                        <TextField
                          label="סיבה (אופציונלי)"
                          value={newReasonStudent}
                          onChange={(e) => setNewReasonStudent(e.target.value)}
                          fullWidth
                          className="sac-textFieldSquare"
                        />
                      ) : null}
                    </Stack>
                  ) : null}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label="התחלה"
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      className="sac-textFieldSquare"
                    />
                    <TextField
                      label="סיום"
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      error={Boolean(newSlotError)}
                      helperText={newSlotError || ' '}
                      className="sac-textFieldSquare"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      type="button"
                      startIcon={<AddIcon />}
                      onClick={commitAddNewSlot}
                      disabled={Boolean(newSlotError)}
                      variant="contained"
                      className="sac-btnSquare"
                    >
                      הוספה
                    </Button>
                    <Button onClick={() => quickAdd('morning')} variant="outlined" className="sac-btnSquare">
                      בוקר (09–12)
                    </Button>
                    <Button onClick={() => quickAdd('noon')} variant="outlined" className="sac-btnSquare">
                      צהריים (12–15)
                    </Button>
                    <Button onClick={() => quickAdd('evening')} variant="outlined" className="sac-btnSquare">
                      אחה״צ (15–18)
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Card variant="outlined" className="sac-square" sx={{ bgcolor: 'background.paper' }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: subtleHeaderBg }}>
              {(() => {
                const availableExceptions = selectedSlots.filter((s) => s.status === AvailabilityStatus.Available).length;
                const blockedExceptions = selectedSlots.length - availableExceptions;
                return (
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                    <Stack spacing={0.25}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        החריגות שלי
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        כל חריגה מגדירה טווח שעות שבו את זמין/ה או לא זמין/ה
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip size="small" variant="outlined" label={`${selectedSlots.length} חריגות`} className="sac-chipSquare" />
                      {availableExceptions > 0 ? (
                        <Chip size="small" color="success" variant="outlined" label={`${availableExceptions} זמינות`} className="sac-chipSquare" />
                      ) : null}
                      {blockedExceptions > 0 ? (
                        <Chip size="small" color="error" variant="outlined" label={`${blockedExceptions} חסומות`} className="sac-chipSquare" />
                      ) : null}
                    </Stack>
                  </Stack>
                );
              })()}
            </Box>

            <CardContent sx={{ maxHeight: 'min(360px, 50vh)', overflowY: 'auto' }}>
              {selectedSlots.length === 0 ? (
                <Box
                  className="sac-square"
                  sx={{
                    p: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    אין חריגות ליום הזה
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    אם סימנת "זמין כל היום" אפשר להוסיף חריגה "לא זמין" לשעות ספציפיות. אם סימנת "לא זמין כל היום" אפשר להוסיף חריגה "זמין" לשעות ספציפיות.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {selectedSlots.map((slot, idx) => {
                    const slotStatusColor = slot.status === AvailabilityStatus.Available ? theme.palette.success.main : theme.palette.error.main;
                    const slotTint = alpha(slotStatusColor, theme.palette.mode === 'dark' ? 0.1 : 0.06);

                    return (
                      <Paper
                        key={`${slot.start}-${slot.end}-${idx}`}
                        elevation={0}
                        className="sac-square"
                        sx={{
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: slotTint,
                          borderInlineStart: '3px solid',
                          borderInlineStartColor: alpha(slotStatusColor, theme.palette.mode === 'dark' ? 0.75 : 0.65),
                        }}
                      >
                        <Box sx={{ p: 1.5 }}>
                          <Stack spacing={1.25}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={1}>
                              <Stack spacing={0.25}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {slotLabel(slot)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {slot.status === AvailabilityStatus.Available ? 'זמין/ה לראיון' : 'לא זמין/ה לראיון'}
                                </Typography>
                              </Stack>

                              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
                                <SlotAvailabilityLineToggle
                                  dense
                                  available={slot.status === AvailabilityStatus.Available}
                                  onChange={(isAvail) =>
                                    updateSlot(idx, {
                                      status: isAvail ? AvailabilityStatus.Available : AvailabilityStatus.Unavailable,
                                    })
                                  }
                                  ariaLabel={`זמינות לחריגה ${slotLabel(slot)}`}
                                />

                                <Button
                                  variant="text"
                                  color="inherit"
                                  onClick={() => removeSlot(idx)}
                                  aria-label="מחיקה"
                                  className="sac-btnSquare"
                                  sx={{ fontWeight: 500 }}
                                >
                                  מחיקה
                                </Button>
                              </Stack>
                            </Stack>

                            {slot.status === AvailabilityStatus.Unavailable ? (
                              <Box>
                                <Divider sx={{ mb: 1.5 }} />
                                <Stack spacing={1.25}>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip
                                      clickable
                                      onClick={() => updateSlot(idx, { reasonStatus: AvailabilityReasonKind.Personal })}
                                      variant={slot.reasonStatus === AvailabilityReasonKind.Personal ? 'filled' : 'outlined'}
                                      label="פרטי"
                                      className="sac-chipSquare"
                                    />
                                    <Chip
                                      clickable
                                      onClick={() =>
                                        updateSlot(idx, {
                                          reasonStatus: AvailabilityReasonKind.Interview,
                                          reasonStudent: '',
                                        })
                                      }
                                      variant={slot.reasonStatus === AvailabilityReasonKind.Interview ? 'filled' : 'outlined'}
                                      label="ראיון"
                                      className="sac-chipSquare"
                                    />
                                  </Stack>
                                  {slot.reasonStatus === AvailabilityReasonKind.Personal ? (
                                    <TextField
                                      label="סיבה (אופציונלי)"
                                      value={slot.reasonStudent || ''}
                                      onChange={(e) => updateSlot(idx, { reasonStudent: e.target.value })}
                                      fullWidth
                                      className="sac-textFieldSquare"
                                    />
                                  ) : null}
                                </Stack>
                              </Box>
                            ) : null}
                          </Stack>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              pt: 1.5,
              mt: 'auto',
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button variant="contained" onClick={closeDrawerAndCommit} className="sac-btnSquare">
              סיום
            </Button>
          </Box>
        </Stack>
      </Drawer>
    </Stack>
  );
}
