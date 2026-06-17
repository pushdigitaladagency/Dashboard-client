'use client';

import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha } from '@mui/material/styles';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ─── AttendanceBar ────────────────────────────────────────────────────────────
// Matches AnalyticsWebsiteVisits (bar chart) from the original project.

export default function AttendanceBar({ title, subheader, chart }) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    alpha(theme.palette.primary.dark, 0.8),
    alpha(theme.palette.warning.main, 0.8),
  ];

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
      foreColor: theme.palette.text.disabled,
      animations: { enabled: true, speed: 360 },
    },
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: {
      categories: chart.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { tickAmount: 5 },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      xaxis: { lines: { show: false } },
    },
    legend: {
      show: true,
      position: 'top',
      fontWeight: 500,
      fontSize: '13px',
      horizontalAlign: 'right',
      markers: { shape: 'circle' },
      labels: { colors: theme.palette.text.primary },
      itemMargin: { horizontal: 8, vertical: 8 },
    },
    tooltip: {
      y: { formatter: (val) => `${val} visits` },
    },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: '48%', borderRadiusApplication: 'end' },
    },
    fill: { opacity: 1 },
    dataLabels: { enabled: false },
    states: {
      hover: { filter: { type: 'darken' } },
      active: { filter: { type: 'darken' } },
    },
    responsive: [
      {
        breakpoint: 600,
        options: { plotOptions: { bar: { borderRadius: 3, columnWidth: '80%' } } },
      },
      {
        breakpoint: 900,
        options: { plotOptions: { bar: { columnWidth: '60%' } } },
      },
    ],
  };

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ pl: 1, py: 2.5, pr: 2.5, height: 364 }}>
        <ReactApexChart
          type="bar"
          series={chart.series}
          options={chartOptions}
          width="100%"
          height="100%"
        />
      </Box>
    </Card>
  );
}
