/**
 * Recharts-friendly colors for light vs dark UI.
 * @param {boolean} isDark
 */
export function getChartPalette(isDark) {
  if (isDark) {
    return {
      grid: '#334155',
      tickFill: '#94a3b8',
      axisLabel: '#94a3b8',
      tooltipBg: 'rgba(15, 23, 42, 0.96)',
      tooltipBorder: '#475569',
      tooltipColor: '#e2e8f0',
    }
  }
  return {
    grid: '#e5e7eb',
    tickFill: '#6b7280',
    axisLabel: '#6b7280',
    tooltipBg: 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: '#e5e7eb',
    tooltipColor: '#111827',
  }
}

export function chartTooltipStyle(palette) {
  return {
    backgroundColor: palette.tooltipBg,
    border: `1px solid ${palette.tooltipBorder}`,
    borderRadius: '8px',
    color: palette.tooltipColor,
  }
}
