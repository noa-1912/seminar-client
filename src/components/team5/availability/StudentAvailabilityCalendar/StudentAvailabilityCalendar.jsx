import { useEffect, useMemo, useState } from 'react';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
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
import {
  AvailabilityReasonKind,
  AvailabilityStatus,
  addMonths,
  clampToTodayIfNeeded,
  compareTime,
  dayAriaLabel,
  daysInMonth,
  defaultSlot,
  defaultSlotForDateKey,
  formatHebrewCalendarDate,
  formatHebrewCalendarDateWithYear,
  formatHebrewLongDate,
  formatHebrewMonthYear,
  formatParshatHashavua,
  getDayDisabled,
  getSundayBasedWeekdayIndex,
  isShabbatDate,
  normalizeDayEntry,
  normalizeSlots,
  normalizeTimeString,
  parseIsoDateKey,
  parseTimeToMinutes,
  slotLabel,
  startOfMonth,
  toIsoDateKey,
  weekdayHeadersHe,
} from './StudentAvailabilityCalendar.utils';
import {
  btnSquareSx,
  calendarPaperSx,
  chipSquareSx,
  daySummaryTextSx,
  dayHebrewCalSx,
  dayNoExceptionsTextSx,
  dayNumberSx,
  dayTodaySx,
  drawerCardSx,
  drawerFooterSx,
  drawerPaperSx,
  emptyCellSx,
  emptyExceptionsSx,
  exceptionChipSx,
  exceptionsHeaderSx,
  exceptionsListSx,
  getDayButtonSx,
  getSlotCardSx,
  getSlotSwitchSx,
  getThemeTokens,
  legendBodySx,
  legendDotSx,
  legendHeaderSx,
  legendPanelSx,
  legendShabbatDotSx,
  legendTextSx,
  monthGridSx,
  monthGridWrapSx,
  shabbatBadgeSx,
  shabbatBadgeTextSx,
  shabbatParshaSx,
  slotDeleteBtnSx,
  slotToggleLabelSx,
  slotToggleWrapSx,
  statusBadgeSx,
  summaryBodySx,
  summaryChipFilledSx,
  summaryChipOutlinedSx,
  summaryChipWarnSx,
  summaryHeaderSx,
  summaryPanelSx,
  textFieldSquareSx,
  toggleGroupSx,
  weekdayHeaderCellSx,
  weekdayHeaderGridSx,
  weekdayHeaderWrapSx,
} from './StudentAvailabilityCalendar.styles';

/** MUI Switch: neutral gray track (no green); gentle contrast on / off */
function SlotAvailabilityLineToggle({ available, onChange, dense, ariaLabel }) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      spacing={1.25}
      sx={slotToggleWrapSx}
    >
      <Typography variant="caption" color="text.secondary" sx={slotToggleLabelSx}>
        לא זמין
      </Typography>
      <Switch
        checked={available}
        onChange={(e) => onChange(e.target.checked)}
        size={dense ? 'small' : 'medium'}
        inputProps={{ 'aria-label': ariaLabel }}
        sx={getSlotSwitchSx(theme)}
      />
      <Typography variant="caption" color="text.secondary" sx={slotToggleLabelSx}>
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

  const { subtleHeaderBg, summaryMutedFill } = getThemeTokens(theme);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="stretch"
        sx={{ width: '100%' }}
      >
        <Paper elevation={0} sx={summaryPanelSx}>
          <Box sx={summaryHeaderSx(subtleHeaderBg)}>
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
                    sx={btnSquareSx}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="חודש הבא">
                  <IconButton
                    aria-label="חודש הבא"
                    onClick={() => setCursorMonth((m) => addMonths(m, 1))}
                    size="small"
                    sx={btnSquareSx}
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
                  sx={btnSquareSx}
                >
                  חזרה להיום
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Box sx={summaryBodySx}>
            <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ justifyContent: 'flex-start' }}>
              <Chip size="small" label={monthSummaryLabels.editing} sx={summaryChipFilledSx(summaryMutedFill)} />
              <Chip size="small" variant="outlined" label={monthSummaryLabels.exceptions} sx={summaryChipOutlinedSx} />
              <Chip size="small" variant="outlined" label={monthSummaryLabels.unavailable} sx={summaryChipWarnSx} />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ justifyContent: 'flex-end' }}>
              <Chip
                size="small"
                label="טיפ: זמין כל היום ואז חוסמים שעות"
                sx={summaryChipFilledSx(summaryMutedFill)}
              />
              <Chip
                size="small"
                variant="outlined"
                label="טיפ: לא זמין כל היום ואז מוסיפים שעות זמינות"
                sx={summaryChipOutlinedSx}
              />
            </Stack>
          </Box>
        </Paper>

        <Paper elevation={0} sx={legendPanelSx}>
          <Box sx={legendHeaderSx(subtleHeaderBg)}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'right' }}>
              מקרא
            </Typography>
          </Box>
          <Box sx={legendBodySx}>
            <Stack spacing={1.75} sx={{ alignItems: 'stretch' }}>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
                <Box sx={legendDotSx(theme.palette.success.main)} />
                <Typography variant="body2" color="text.primary" sx={legendTextSx}>
                  זמין (או רוב היום זמין)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
                <Box sx={legendDotSx(theme.palette.warning.main)} />
                <Typography variant="body2" color="text.primary" sx={legendTextSx}>
                  לא זמין (או רוב היום לא זמין)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
                <Box sx={legendDotSx(theme.palette.info.main)} />
                <Typography variant="body2" color="text.primary" sx={legendTextSx}>
                  יש חריגות לשעות
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ justifyContent: 'flex-start' }}>
                <Box sx={legendShabbatDotSx(theme)} />
                <Typography variant="body2" color="text.primary" sx={legendTextSx}>
                  שבת — פרשת השבוע
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Stack>

      <Paper elevation={0} sx={calendarPaperSx}>
        <Box sx={weekdayHeaderWrapSx}>
          <Box sx={weekdayHeaderGridSx}>
            {headers.map((h) => (
              <Typography key={h} variant="caption" color="text.secondary" sx={weekdayHeaderCellSx}>
                {h}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box sx={monthGridWrapSx}>
          <Box sx={monthGridSx}>
            {monthGrid.map((date, idx) => {
              if (!date) return <Box key={`empty-${idx}`} sx={emptyCellSx} />;

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

              return (
                <Button
                  key={key}
                  onClick={() => openDay(date)}
                  disabled={disabled}
                  aria-label={dayAriaLabel(date, summary, disabled)}
                  variant="text"
                  sx={getDayButtonSx(theme, {
                    disabled,
                    isSelected,
                    isShabbat,
                    isDayUnavailable,
                    hasExceptions,
                  })}
                >
                  <Stack spacing={0.75} sx={{ width: '100%' }}>
                    {isShabbat ? (
                      <>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle1" sx={dayNumberSx}>
                              {date.getDate()}
                            </Typography>
                            {hebrewCalLine ? (
                              <Typography variant="caption" color="text.secondary" sx={dayHebrewCalSx}>
                                {hebrewCalLine}
                              </Typography>
                            ) : null}
                            {isToday ? (
                              <Typography variant="caption" color="text.secondary" sx={dayTodaySx}>
                                היום
                              </Typography>
                            ) : null}
                          </Stack>
                          <Box sx={shabbatBadgeSx(theme)}>
                            <Typography variant="caption" sx={shabbatBadgeTextSx}>
                              שבת
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography variant="caption" color="text.primary" sx={shabbatParshaSx}>
                          {formatParshatHashavua(date) || 'פרשת השבוע'}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle1" sx={dayNumberSx}>
                              {date.getDate()}
                            </Typography>
                            {hebrewCalLine ? (
                              <Typography variant="caption" color="text.secondary" sx={dayHebrewCalSx}>
                                {hebrewCalLine}
                              </Typography>
                            ) : null}
                            {isToday ? (
                              <Typography variant="caption" color="text.secondary" sx={dayTodaySx}>
                                היום
                              </Typography>
                            ) : null}
                          </Stack>

                          <Box sx={statusBadgeSx(theme, statusColor)}>
                            <Typography variant="caption" sx={shabbatBadgeTextSx}>
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
                            sx={exceptionChipSx}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={dayNoExceptionsTextSx}>
                            ללא חריגות
                          </Typography>
                        )}

                        {summary ? (
                          <Typography variant="caption" color="text.secondary" sx={daySummaryTextSx}>
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
        PaperProps={{ sx: drawerPaperSx }}
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

            <IconButton aria-label="סגירה" onClick={closeDrawerAndCommit} size="small" sx={btnSquareSx}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Card variant="outlined" sx={drawerCardSx}>
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
                    sx={toggleGroupSx}
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
              <Card variant="outlined" sx={drawerCardSx}>
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
                        sx={chipSquareSx}
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
                        sx={chipSquareSx}
                      />
                    </Stack>
                    {selectedDayReasonStatus === AvailabilityReasonKind.Personal ? (
                      <TextField
                        label="סיבה (אופציונלי)"
                        value={selectedDayReasonStudent}
                        onChange={(e) => setSelectedDayEntry({ dayReasonStudent: e.target.value })}
                        fullWidth
                        sx={textFieldSquareSx}
                      />
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            ) : null}

            <Card variant="outlined" sx={drawerCardSx}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      הוספת חריגה
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {newIsAvailable
                        ? 'חריגה מסוג "זמין" מאפשרת ראיון בשעות האלה'
                        : 'חריגה מסוג "לא זמין" חוסמת ראיון בשעות האלה'}
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
                          sx={chipSquareSx}
                        />
                        <Chip
                          clickable
                          onClick={() => {
                            setNewReasonStatus(AvailabilityReasonKind.Interview);
                            setNewReasonStudent('');
                          }}
                          variant={newReasonStatus === AvailabilityReasonKind.Interview ? 'filled' : 'outlined'}
                          label="ראיון"
                          sx={chipSquareSx}
                        />
                      </Stack>
                      {newReasonStatus === AvailabilityReasonKind.Personal ? (
                        <TextField
                          label="סיבה (אופציונלי)"
                          value={newReasonStudent}
                          onChange={(e) => setNewReasonStudent(e.target.value)}
                          fullWidth
                          sx={textFieldSquareSx}
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
                      sx={textFieldSquareSx}
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
                      sx={textFieldSquareSx}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      type="button"
                      startIcon={<AddIcon />}
                      onClick={commitAddNewSlot}
                      disabled={Boolean(newSlotError)}
                      variant="contained"
                      sx={btnSquareSx}
                    >
                      הוספה
                    </Button>
                    <Button onClick={() => quickAdd('morning')} variant="outlined" sx={btnSquareSx}>
                      בוקר (09–12)
                    </Button>
                    <Button onClick={() => quickAdd('noon')} variant="outlined" sx={btnSquareSx}>
                      צהריים (12–15)
                    </Button>
                    <Button onClick={() => quickAdd('evening')} variant="outlined" sx={btnSquareSx}>
                      אחה״צ (15–18)
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Card variant="outlined" sx={drawerCardSx}>
            <Box sx={exceptionsHeaderSx(subtleHeaderBg)}>
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
                      <Chip size="small" variant="outlined" label={`${selectedSlots.length} חריגות`} sx={chipSquareSx} />
                      {availableExceptions > 0 ? (
                        <Chip size="small" color="success" variant="outlined" label={`${availableExceptions} זמינות`} sx={chipSquareSx} />
                      ) : null}
                      {blockedExceptions > 0 ? (
                        <Chip size="small" color="error" variant="outlined" label={`${blockedExceptions} חסומות`} sx={chipSquareSx} />
                      ) : null}
                    </Stack>
                  </Stack>
                );
              })()}
            </Box>

            <CardContent sx={exceptionsListSx}>
              {selectedSlots.length === 0 ? (
                <Box sx={emptyExceptionsSx}>
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
                    const slotStatusColor =
                      slot.status === AvailabilityStatus.Available ? theme.palette.success.main : theme.palette.error.main;

                    return (
                      <Paper
                        key={`${slot.start}-${slot.end}-${idx}`}
                        elevation={0}
                        sx={getSlotCardSx(theme, slotStatusColor)}
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
                                  sx={slotDeleteBtnSx}
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
                                      sx={chipSquareSx}
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
                                      sx={chipSquareSx}
                                    />
                                  </Stack>
                                  {slot.reasonStatus === AvailabilityReasonKind.Personal ? (
                                    <TextField
                                      label="סיבה (אופציונלי)"
                                      value={slot.reasonStudent || ''}
                                      onChange={(e) => updateSlot(idx, { reasonStudent: e.target.value })}
                                      fullWidth
                                      sx={textFieldSquareSx}
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

          <Box sx={drawerFooterSx}>
            <Button variant="contained" onClick={closeDrawerAndCommit} sx={btnSquareSx}>
              סיום
            </Button>
          </Box>
        </Stack>
      </Drawer>
    </Stack>
  );
}
