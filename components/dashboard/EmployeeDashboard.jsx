'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { Icon } from '@iconify/react';

import { api, useAuth } from '@/components/AuthProvider';
import WidgetCard from '@/components/dashboard/WidgetCard';

// ─── Employee Dashboard ─────────────────────────────────────────────────────────
// Self-service view for the logged-in employee. Mirrors the admin dashboard look,
// but sources data from the /emp/* self-service endpoints (own data only).

// Returns 'YYYY-MM' for the current month — matches the attendance filter format.
function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMoney(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN')}`;
}

const STATUS_COLOR = {
  active: 'success',
  inactive: 'error',
  on_leave: 'warning',
};

// Small label/value row for the profile card.
function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attSummary, setAttSummary] = useState({});
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState('');

  // Update-phone dialog state
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState(null);

  // Profile image is stored locally (no server upload endpoint exists). Key it by
  // user so different accounts on the same browser don't share an image. Read after
  // mount to avoid a hydration mismatch.
  const avatarKey = user?.id ? `profile_avatar_${user.id}` : 'profile_avatar';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(avatarKey);
    if (stored) setAvatarSrc(stored);
  }, [avatarKey]);

  const openPhoneDialog = () => {
    setPhoneValue(profile?.phone || '');
    setPhoneError(null);
    setPhoneOpen(true);
  };

  const handleSavePhone = async () => {
    const next = phoneValue.trim();
    if (!next) {
      setPhoneError('Phone number is required.');
      return;
    }
    setPhoneSaving(true);
    setPhoneError(null);
    try {
      // Backend allows employees to update only their phone (PUT /emp/profile).
      await api.put('/emp/profile', { phone: next });
      setProfile((prev) => ({ ...prev, phone: next }));
      setPhoneOpen(false);
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : 'Failed to update phone number.');
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setAvatarSrc(dataUrl);
      try {
        localStorage.setItem(avatarKey, dataUrl);
      } catch {
        setError('Image is too large to save locally.');
      }
    };
    reader.readAsDataURL(file);
    // Reset so picking the same file again still fires onChange
    e.target.value = '';
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, attRes, payRes] = await Promise.all([
          api.get('/emp/profile'),
          api.get(`/emp/attendance?month=${currentMonth()}`),
          api.get('/emp/payroll'),
        ]);
        setProfile(profileRes.data);
        setAttendance(attRes.data ?? []);
        setAttSummary(attRes.summary ?? {});
        setPayroll(payRes.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const present = Number(attSummary.present ?? 0);
  const absent = Number(attSummary.absent ?? 0);
  const halfDay = Number(attSummary.half_day ?? 0);
  const leave = Number(attSummary.leave ?? 0);
  const recordedDays = present + absent + halfDay + leave;

  const latestPay = payroll[0] ?? null;
  const displayName = profile?.full_name || 'Employee';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Employee Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* ── Stat cards ── */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WidgetCard
            title="Days Present"
            percent={recordedDays ? (present / recordedDays) * 100 : 0}
            total={present}
            icon={<img alt="Present" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['W1', 'W2', 'W3', 'W4', 'W5'],
              series: [4, 5, 3, 5, present],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WidgetCard
            title="On Leave"
            percent={recordedDays ? (leave / recordedDays) * 100 : 0}
            total={leave}
            color="warning"
            icon={<img alt="On Leave" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['W1', 'W2', 'W3', 'W4', 'W5'],
              series: [1, 0, 2, 0, leave],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WidgetCard
            title="Absent"
            percent={recordedDays ? (absent / recordedDays) * 100 : 0}
            total={absent}
            color="error"
            icon={<img alt="Absent" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['W1', 'W2', 'W3', 'W4', 'W5'],
              series: [0, 1, 0, 1, absent],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <WidgetCard
            title="Latest Net Pay"
            percent={0}
            total={Number(latestPay?.net_pay ?? 0)}
            color="secondary"
            icon={<img alt="Net Pay" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['M1', 'M2', 'M3', 'M4', 'M5'],
              series: payroll
                .slice(0, 5)
                .reverse()
                .map((p) => Number(p.net_pay ?? 0)),
            }}
          />
        </Grid>

        {/* ── Profile card ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {/* Avatar with "add profile image" button */}
              <Box sx={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                <Avatar
                  src={avatarSrc || undefined}
                  sx={{ width: 64, height: 64, fontSize: 24, bgcolor: 'primary.main' }}
                >
                  {avatarLetter}
                </Avatar>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarPick}
                />

                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={avatarSrc ? 'Change profile photo' : 'Add profile photo'}
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 26,
                    height: 26,
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    border: '2px solid',
                    borderColor: 'background.paper',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <Icon icon={avatarSrc ? 'solar:pen-bold' : 'mingcute:add-line'} width={14} />
                </IconButton>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" noWrap>
                  {displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {profile?.designation || 'Employee'}
                </Typography>
                <Chip
                  label={(profile?.status || 'active').replace('_', ' ')}
                  size="small"
                  color={STATUS_COLOR[profile?.status] || 'default'}
                  variant="soft"
                  sx={{ mt: 0.5, textTransform: 'capitalize', fontWeight: 600 }}
                />
              </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />

            <InfoRow label="Employee Code" value={profile?.emp_code} />
            <InfoRow label="Email" value={profile?.email} />
            <InfoRow label="Phone" value={profile?.phone} />
            <InfoRow label="Department" value={profile?.department} />
            <InfoRow label="Designation" value={profile?.designation} />
            <InfoRow label="Joined" value={formatDate(profile?.join_date)} />

            <Button
              size="small"
              variant="outlined"
              startIcon={<Icon icon="solar:phone-bold" width={16} />}
              onClick={openPhoneDialog}
              sx={{ mt: 2 }}
            >
              Update Phone
            </Button>
          </Card>
        </Grid>

        {/* ── Payroll slips ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="My Payslips" subheader="Recent salary disbursements" />
            <TableContainer sx={{ px: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Basic</TableCell>
                    <TableCell align="right">Allowances</TableCell>
                    <TableCell align="right">Deductions</TableCell>
                    <TableCell align="right">Net Pay</TableCell>
                    <TableCell>Paid On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payroll.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No payslips yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payroll.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{p.month}</TableCell>
                        <TableCell align="right">{formatMoney(p.basic)}</TableCell>
                        <TableCell align="right">{formatMoney(p.allowances)}</TableCell>
                        <TableCell align="right">{formatMoney(p.deductions)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatMoney(p.net_pay)}
                        </TableCell>
                        <TableCell>{formatDate(p.paid_on)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* ── Attendance log (current month) ── */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="My Attendance"
              subheader={`This month — ${recordedDays} day(s) recorded`}
            />
            <TableContainer sx={{ px: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ py: 6, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No attendance records this month.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((a) => (
                      <TableRow key={a.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{formatDate(a.date)}</TableCell>
                        <TableCell>{a.check_in || '—'}</TableCell>
                        <TableCell>{a.check_out || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={(a.status || '').replace('_', ' ')}
                            size="small"
                            color={
                              a.status === 'present'
                                ? 'success'
                                : a.status === 'absent'
                                  ? 'error'
                                  : 'warning'
                            }
                            variant="soft"
                            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* ── Update Phone Dialog ── */}
      <Dialog
        open={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle>Update Phone Number</DialogTitle>
        <DialogContent>
          {phoneError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {phoneError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Phone"
            value={phoneValue}
            onChange={(e) => setPhoneValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSavePhone();
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPhoneOpen(false)} color="inherit" disabled={phoneSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePhone}
            variant="contained"
            color="inherit"
            disabled={phoneSaving}
            startIcon={phoneSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {phoneSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
