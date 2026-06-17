'use client';

import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme, alpha } from '@mui/material/styles';

import { Icon } from '@iconify/react';

// Load ApexCharts only on client (no SSR)
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ─── Number formatter ─────────────────────────────────────────────────────────

function fShortenNumber(value) {
  if (value == null) return '';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  })
    .format(Number(value))
    .replace(/[A-Z]/g, (m) => m.toLowerCase());
}

function fPercent(value) {
  if (value == null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(Number(value) / 100);
}

function fNumber(value) {
  if (value == null) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

// ─── WidgetCard ───────────────────────────────────────────────────────────────
// Matches AnalyticsWidgetSummary from the original project.

export default function WidgetCard({ title, total, percent, color = 'primary', icon, chart }) {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    info: theme.palette.info,
    warning: theme.palette.warning,
    error: theme.palette.error,
    success: theme.palette.success,
  };

  const palette = colorMap[color] || colorMap.primary;

  const chartOptions = {
    chart: {
      type: 'line',
      sparkline: { enabled: true },
      toolbar: { show: false },
      animations: { enabled: true, speed: 360 },
    },
    colors: [palette.dark],
    stroke: { width: 2.5, curve: 'smooth' },
    xaxis: { categories: chart.categories },
    tooltip: {
      y: {
        formatter: (val) => fNumber(val),
        title: { formatter: () => '' },
      },
    },
    markers: { strokeWidth: 0 },
    grid: { padding: { top: 6, left: 6, right: 6, bottom: 6 } },
  };

  return (
    <Card
      sx={{
        p: 3,
        boxShadow: 'none',
        position: 'relative',
        overflow: 'hidden',
        color: `${color}.darker`,
        background: `linear-gradient(135deg, ${alpha(palette.lighter || palette.light, 0.48)}, ${alpha(palette.light, 0.48)})`,
      }}
    >
      {/* Icon */}
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      {/* Trending badge */}
      <Box
        sx={{
          top: 16,
          right: 16,
          gap: 0.5,
          display: 'flex',
          position: 'absolute',
          alignItems: 'center',
          color: `${color}.darker`,
        }}
      >
        <Icon
          icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
          width={20}
        />
        <Box component="span" sx={{ typography: 'subtitle2' }}>
          {percent > 0 && '+'}
          {fPercent(percent)}
        </Box>
      </Box>

      {/* Content row */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'subtitle2', color: `${color}.darker` }}>{title}</Box>
          <Box sx={{ typography: 'h4', color: `${color}.darker` }}>{fShortenNumber(total)}</Box>
        </Box>

        <Box sx={{ width: 84, height: 56 }}>
          <ReactApexChart
            type="line"
            series={[{ data: chart.series }]}
            options={chartOptions}
            width="100%"
            height="100%"
          />
        </Box>
      </Box>

      {/* Background shape decoration */}
      <Box
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          background: palette.main,
          WebkitMask: 'url(/assets/background/shape-square.svg) center/contain no-repeat',
          mask: 'url(/assets/background/shape-square.svg) center/contain no-repeat',
        }}
      />
    </Card>
  );
}
