'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/DashboardLayout';
import EmployeeTable from '@/components/employees/EmployeeTable';

// ─── Employees Page ────────────────────────────────────────────────────────────
// Admin only. Non-admins are redirected to the dashboard.

export default function UserPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push('/sign-in');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [hydrated, isAuthenticated, isAdmin, router]);

  if (!hydrated || !isAuthenticated || !isAdmin) return null;

  return (
    <DashboardLayout>
      <EmployeeTable />
    </DashboardLayout>
  );
}
