'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth, api } from '@/components/AuthProvider';
import DashboardLayout from '@/components/DashboardLayout';
import WidgetCard from '@/components/dashboard/WidgetCard';
import DepartmentDonut from '@/components/dashboard/DepartmentDonut';
import AttendanceBar from '@/components/dashboard/AttendanceBar';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, hydrated } = useAuth();

  const [overview, setOverview] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated (only after auth state is hydrated)
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [hydrated, isAuthenticated, router]);

  // Fetch analytics data (admin only)
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [overviewRes, deptRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/department-headcount'),
        ]);
        setOverview(overviewRes.data);
        setDeptData(deptRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isAdmin]);

  // Render nothing until auth state is hydrated so SSR and client match.
  if (!hydrated || !isAuthenticated) return null;

  // ── Employee-only view ──────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <EmployeeDashboard />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error">{error}</Alert>
      </DashboardLayout>
    );
  }

  const deptVisitsSeries = deptData
    .filter((d) => d.total > 0)
    .map((d) => ({ label: d.department, value: Number(d.total) }));

  return (
    <DashboardLayout>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* ── Stat Cards ── */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WidgetCard
            title="Total Employees"
            percent={0}
            total={overview?.total_employees ?? 0}
            icon={<img alt="Total Employees" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, overview?.total_employees ?? 0],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WidgetCard
            title="Active Employees"
            percent={
              overview ? (Number(overview.active) / (overview.total_employees || 1)) * 100 : 0
            }
            total={Number(overview?.active ?? 0)}
            color="secondary"
            icon={<img alt="Active" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, Number(overview?.active ?? 0)],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WidgetCard
            title="Departments"
            percent={0}
            total={overview?.total_departments ?? 0}
            color="warning"
            icon={<img alt="Departments" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, overview?.total_departments ?? 0],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WidgetCard
            title="Avg Salary (₹)"
            percent={3.6}
            total={Math.round(parseFloat(overview?.avg_salary ?? '0'))}
            color="error"
            icon={<img alt="Avg Salary" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [
                56, 30, 23, 54, 47, 40, 62,
                Math.round(parseFloat(overview?.avg_salary ?? '0')),
              ],
            }}
          />
        </Grid>

        {/* ── Donut chart ── */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <DepartmentDonut
            title="Employees by Department"
            chart={{
              series:
                deptVisitsSeries.length > 0
                  ? deptVisitsSeries
                  : [{ label: 'No Data', value: 1 }],
            }}
          />
        </Grid>

        {/* ── Bar chart ── */}
        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AttendanceBar
            title="Attendance Overview"
            subheader="Active vs On-Leave trends"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                {
                  name: 'Present',
                  data: [43, 33, 22, 37, 67, 68, 37, 24, Number(overview?.active ?? 0)],
                },
                {
                  name: 'On Leave',
                  data: [51, 70, 47, 67, 40, 37, 24, 70, Number(overview?.on_leave ?? 0)],
                },
              ],
            }}
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
