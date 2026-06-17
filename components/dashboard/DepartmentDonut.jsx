'use client';

import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ─── Legend ───────────────────────────────────────────────────────────────────

function ChartLegend({ labels, colors }) {
  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center',
      }}
    >
      {labels?.map((label, i) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: colors?.[i] ?? '#ccc',
              flexShrink: 0,
            }}
          />
          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>{label}</Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── DepartmentDonut ──────────────────────────────────────────────────────────
// Matches AnalyticsCurrentVisits (pie chart) from the original project.

export default function DepartmentDonut({ title, subheader, chart }) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.light,
    theme.palette.info.dark,
    theme.palette.error.main,
    theme.palette.success.main,
    theme.palette.secondary.main,
  ];

  const chartSeries = chart.series.map((item) => item.value);
  const chartLabels = chart.series.map((item) => item.label);

  const chartOptions = {
    chart: {
      type: 'pie',
      sparkline: { enabled: true },
      toolbar: { show: false },
      animations: { enabled: true, speed: 360 },
    },
    colors: chartColors,
    labels: chartLabels,
    stroke: { width: 0 },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      y: {
        formatter: (val) =>
          new Intl.NumberFormat('en-US').format(val),
        title: { formatter: (name) => name },
      },
    },
    plotOptions: {
      pie: { donut: { labels: { show: false } } },
    },
    legend: { show: false },
  };

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />

      <Box
        sx={{
          my: 6,
          mx: 'auto',
          width: { xs: 240, xl: 260 },
          height: { xs: 240, xl: 260 },
        }}
      >
        <ReactApexChart
          type="pie"
          series={chartSeries}
          options={chartOptions}
          width="100%"
          height="100%"
        />
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegend labels={chartLabels} colors={chartColors} />
    </Card>
  );
}
