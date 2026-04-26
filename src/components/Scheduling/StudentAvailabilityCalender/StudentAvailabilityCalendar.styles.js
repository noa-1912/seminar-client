import { alpha } from '@mui/material';

/** Square-first UI: only subtle corners, no pills or circles */
export const SQ = 4;

export const SUMMARY_PILL_RADIUS = '999px';
export const SUMMARY_PANEL_RADIUS = '24px';

export const textFieldSquareSx = {
  '& .MuiOutlinedInput-root': { borderRadius: `${SQ}px` },
};

export const chipSquareSx = { borderRadius: `${SQ}px` };

export const btnSquareSx = { borderRadius: `${SQ}px` };

export const getThemeTokens = (theme) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    isDark,
    subtleHeaderBg: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06),
    summaryMutedFill: alpha(theme.palette.text.primary, isDark ? 0.12 : 0.08),
  };
};

export const summaryPanelSx = {
  flex: 1,
  minWidth: 0,
  borderRadius: SUMMARY_PANEL_RADIUS,
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
};

export const summaryHeaderSx = (subtleHeaderBg) => ({
  px: { xs: 2, sm: 2.5 },
  py: 2,
  bgcolor: subtleHeaderBg,
  borderBottom: '1px solid',
  borderColor: 'divider',
});

export const summaryBodySx = { px: { xs: 2, sm: 2.5 }, py: 2.5 };

export const summaryChipFilledSx = (summaryMutedFill) => ({
  ...chipSquareSx,
  borderRadius: SUMMARY_PILL_RADIUS,
  height: 32,
  bgcolor: summaryMutedFill,
  border: 'none',
  fontWeight: 600,
  '& .MuiChip-label': { px: 1.5 },
});

export const summaryChipOutlinedSx = {
  ...chipSquareSx,
  borderRadius: SUMMARY_PILL_RADIUS,
  height: 32,
  fontWeight: 600,
  bgcolor: 'background.paper',
  '& .MuiChip-label': { px: 1.5 },
};

export const summaryChipWarnSx = {
  ...summaryChipOutlinedSx,
  color: 'warning.main',
  borderColor: 'warning.main',
};

export const legendPanelSx = {
  width: { xs: '100%', md: 280 },
  flexShrink: 0,
  borderRadius: SUMMARY_PANEL_RADIUS,
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  alignSelf: { xs: 'stretch', md: 'flex-start' },
};

export const legendHeaderSx = (subtleHeaderBg) => ({
  px: 2,
  py: 2,
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: subtleHeaderBg,
});

export const legendBodySx = { px: 2, py: 2 };

export const legendTextSx = { fontWeight: 500, lineHeight: 1.35 };

export const legendDotSx = (color) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  bgcolor: color,
  flexShrink: 0,
  boxShadow: `0 0 0 1px ${alpha(color, 0.25)}`,
});

export const legendShabbatDotSx = (theme) => ({
  width: 12,
  height: 12,
  borderRadius: `${SQ}px`,
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.2 : 0.12),
  flexShrink: 0,
  border: '1px solid',
  borderColor: 'divider',
});

export const calendarPaperSx = {
  borderRadius: `${SQ}px`,
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
};

export const weekdayHeaderWrapSx = {
  px: { xs: 1.5, sm: 2 },
  py: 1.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.default',
};

export const weekdayHeaderGridSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 1,
};

export const weekdayHeaderCellSx = { textAlign: 'center', fontWeight: 600 };

export const monthGridWrapSx = { p: { xs: 1.5, sm: 2 } };

export const monthGridSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: { xs: 1, sm: 1.25 },
};

export const emptyCellSx = {
  aspectRatio: '1 / 1',
  minHeight: { xs: 72, sm: 88 },
  borderRadius: `${SQ}px`,
};

export const getDayButtonSx = (theme, flags) => {
  const { disabled, isSelected, isShabbat, isDayUnavailable, hasExceptions } = flags;
  const isDark = theme.palette.mode === 'dark';
  const selectedOutline = alpha(theme.palette.primary.main, isDark ? 0.55 : 0.4);
  const exceptionDayBg = alpha(theme.palette.info.main, isDark ? 0.1 : 0.06);
  const unavailableDayBg = alpha(theme.palette.error.main, isDark ? 0.1 : 0.06);
  const selectedDayBg = alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08);
  const exceptionHoverBg = alpha(theme.palette.info.main, isDark ? 0.16 : 0.1);
  const unavailableHoverBg = alpha(theme.palette.error.main, isDark ? 0.16 : 0.1);

  const borderColor = isSelected
    ? 'primary.main'
    : isShabbat
      ? 'divider'
      : isDayUnavailable
        ? alpha(theme.palette.error.main, isDark ? 0.32 : 0.22)
        : hasExceptions
          ? alpha(theme.palette.info.main, isDark ? 0.32 : 0.22)
          : 'divider';

  const bgcolor = disabled
    ? 'background.paper'
    : isSelected
      ? selectedDayBg
      : isDayUnavailable
        ? unavailableDayBg
        : hasExceptions
          ? exceptionDayBg
          : 'background.paper';

  const hoverBg = disabled
    ? 'background.paper'
    : isSelected
      ? selectedDayBg
      : isDayUnavailable
        ? unavailableHoverBg
        : hasExceptions
          ? exceptionHoverBg
          : 'action.hover';

  const hoverBorder = isSelected
    ? 'primary.main'
    : isDayUnavailable
      ? alpha(theme.palette.error.main, 0.38)
      : hasExceptions
        ? alpha(theme.palette.info.main, 0.38)
        : 'divider';

  return {
    aspectRatio: '1 / 1',
    minHeight: { xs: 72, sm: 88 },
    borderRadius: `${SQ}px`,
    p: 1.25,
    textAlign: 'right',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    border: '1px solid',
    borderColor,
    bgcolor,
    boxShadow: isSelected ? theme.shadows[1] : 'none',
    transition: (t) =>
      t.transitions.create(['background-color', 'box-shadow', 'border-color'], {
        duration: t.transitions.duration.short,
      }),
    '&:hover': {
      bgcolor: hoverBg,
      borderColor: hoverBorder,
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
        ? { color: 'text.primary', WebkitTextFillColor: 'currentcolor' }
        : {}),
    },
  };
};

export const clampLinesSx = (lines) => ({
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
});

export const dayNumberSx = { fontWeight: 600, lineHeight: 1.2 };

export const dayHebrewCalSx = {
  lineHeight: 1.15,
  fontSize: '0.72rem',
  ...clampLinesSx(2),
};

export const dayTodaySx = { lineHeight: 1 };

export const shabbatBadgeSx = (theme) => ({
  px: 1,
  py: 0.25,
  borderRadius: `${SQ}px`,
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.12 : 0.08),
  border: '1px solid',
  borderColor: 'divider',
  alignSelf: 'flex-start',
});

export const shabbatBadgeTextSx = { fontWeight: 600, lineHeight: 1.2 };

export const shabbatParshaSx = {
  lineHeight: 1.25,
  fontWeight: 700,
  ...clampLinesSx(3),
};

export const statusBadgeSx = (theme, statusColor) => ({
  px: 1,
  py: 0.25,
  borderRadius: `${SQ}px`,
  bgcolor: alpha(statusColor, theme.palette.mode === 'dark' ? 0.14 : 0.1),
  border: '1px solid',
  borderColor: alpha(statusColor, theme.palette.mode === 'dark' ? 0.35 : 0.28),
  alignSelf: 'flex-start',
});

export const exceptionChipSx = {
  ...chipSquareSx,
  alignSelf: 'flex-start',
  fontWeight: 600,
  maxWidth: '100%',
};

export const daySummaryTextSx = { lineHeight: 1.25, ...clampLinesSx(2) };

export const dayNoExceptionsTextSx = { lineHeight: 1.25, fontWeight: 500 };

export const drawerPaperSx = {
  width: { xs: '100%', sm: 460 },
  p: 2.5,
  borderRadius: 0,
  bgcolor: 'background.paper',
  maxHeight: '100vh',
  height: '100%',
  boxSizing: 'border-box',
  overflowY: 'auto',
};

export const drawerCardSx = {
  borderRadius: `${SQ}px`,
  bgcolor: 'background.paper',
};

export const toggleGroupSx = {
  '& .MuiToggleButtonGroup-grouped': { borderRadius: `${SQ}px` },
  '& .MuiToggleButton-root': { flex: 1, py: 1, borderRadius: `${SQ}px` },
};

export const exceptionsListSx = { maxHeight: 'min(360px, 50vh)', overflowY: 'auto' };

export const exceptionsHeaderSx = (subtleHeaderBg) => ({
  px: 2,
  py: 1.5,
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: subtleHeaderBg,
});

export const emptyExceptionsSx = {
  p: 2,
  borderRadius: `${SQ}px`,
  border: '1px dashed',
  borderColor: 'divider',
  bgcolor: 'background.default',
};

export const getSlotCardSx = (theme, statusColor) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: `${SQ}px`,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: alpha(statusColor, isDark ? 0.1 : 0.06),
    borderInlineStart: '3px solid',
    borderInlineStartColor: alpha(statusColor, isDark ? 0.75 : 0.65),
  };
};

export const slotDeleteBtnSx = { fontWeight: 500, ...btnSquareSx };

export const drawerFooterSx = {
  position: 'sticky',
  bottom: 0,
  pt: 1.5,
  mt: 'auto',
  bgcolor: 'background.paper',
  borderTop: '1px solid',
  borderColor: 'divider',
};

export const getSlotSwitchSx = (theme) => {
  const isDark = theme.palette.mode === 'dark';
  const trackOff = alpha(theme.palette.text.primary, isDark ? 0.24 : 0.16);
  const trackOn = alpha(theme.palette.text.primary, isDark ? 0.42 : 0.34);
  return {
    mx: 0,
    '& .MuiSwitch-track': {
      borderRadius: `${SQ}px`,
      opacity: 1,
      backgroundColor: trackOff,
    },
    '& .MuiSwitch-switchBase': {
      '&.Mui-checked': { color: theme.palette.common.white },
      '&.Mui-checked + .MuiSwitch-track': {
        backgroundColor: trackOn,
        opacity: 1,
      },
    },
  };
};

export const slotToggleWrapSx = {
  flexWrap: 'wrap',
  rowGap: 0.75,
  columnGap: 1.25,
  direction: 'ltr',
};

export const slotToggleLabelSx = {
  userSelect: 'none',
  fontWeight: 500,
  minWidth: 'fit-content',
};
