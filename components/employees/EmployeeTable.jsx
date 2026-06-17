'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';

import { Icon } from '@iconify/react';

import { api } from '@/components/AuthProvider';
import EmployeeTableRow from './EmployeeTableRow';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  { id: 1, name: 'Management' },
  { id: 2, name: 'Development' },
  { id: 3, name: 'Design' },
  { id: 4, name: 'Sales' },
  { id: 5, name: 'Digital Marketing' },
  { id: 8, name: 'QA Testing' },
];

const ROLES = [
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'Admin' },
];

const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  role: 'employee',
  phone: '',
  designation: '',
  department_id: '',
  salary: '',
  join_date: '',
  emp_code: '',
  status: 'active',
};

const HEAD_LABELS = [
  { id: 'name', label: 'Name' },
  { id: 'company', label: 'Department' },
  { id: 'role', label: 'Designation' },
  { id: 'isVerified', label: 'Active', align: 'center' },
  { id: 'status', label: 'Status' },
  { id: '' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapEmployee(emp) {
  const avatarIndex = ((emp.id - 1) % 24) + 1;
  return {
    id: String(emp.id),
    name: emp.full_name,
    company: emp.department || 'Unassigned',
    role: emp.designation || emp.role || 'Employee',
    isVerified: emp.status === 'active',
    status: emp.status === 'active' ? 'active' : 'banned',
    accountRole: emp.role || 'employee',
    avatarUrl: `/assets/images/avatar/avatar-${avatarIndex}.webp`,
    email: emp.email,
    phone: emp.phone,
    salary: emp.salary,
    empCode: emp.emp_code,
    joinDate: emp.join_date,
  };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ─── EmployeeTable ────────────────────────────────────────────────────────────

export default function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');

  // Dialog state
  const [dialogMode, setDialogMode] = useState(null); // 'add' | 'edit' | null
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/employees?limit=100');
      setEmployees(res.data.map(mapEmployee));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ── Sorting ──────────────────────────────────────────────────────────────

  const handleSort = (id) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  // ── Selection ────────────────────────────────────────────────────────────

  const handleSelectAll = (checked) => {
    setSelected(checked ? employees.map((e) => e.id) : []);
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // ── Filter ───────────────────────────────────────────────────────────────

  const dataFiltered = employees
    .filter((emp) =>
      filterName
        ? emp.name.toLowerCase().includes(filterName.toLowerCase()) ||
          emp.email?.toLowerCase().includes(filterName.toLowerCase())
        : true
    )
    .sort(getComparator(order, orderBy));

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - dataFiltered.length) : 0;
  const notFound = !dataFiltered.length && !!filterName;

  // ── View ─────────────────────────────────────────────────────────────────

  const handleOpenView = async (row) => {
    setViewOpen(true);
    setViewData(null);
    setViewError(null);
    setViewLoading(true);
    try {
      const res = await api.get(`/admin/employees/${row.id}`);
      setViewData(res.data);
    } catch (err) {
      setViewError(err instanceof Error ? err.message : 'Failed to load employee details.');
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setViewData(null);
    setViewError(null);
  };

  // ── Add / Edit ───────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setFormState(EMPTY_FORM);
    setFormError(null);
    setEditingId(null);
    setDialogMode('add');
  };

  const handleOpenEdit = (row) => {
    const deptName = row.company !== 'Unassigned' ? row.company : '';
    const matched = DEPARTMENTS.find((d) => d.name === deptName);
    setFormState({
      full_name: row.name,
      email: row.email || '',
      password: '',
      role: row.accountRole || 'employee',
      phone: row.phone || '',
      designation: row.role,
      department_id: matched ? String(matched.id) : '',
      salary: String(row.salary || ''),
      join_date: row.joinDate ? String(row.joinDate).slice(0, 10) : '',
      emp_code: row.empCode || '',
      status: row.isVerified ? 'active' : 'inactive',
    });
    setFormError(null);
    setEditingId(row.id);
    setDialogMode('edit');
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setFormError(null);
    setEditingId(null);
  };

  const handleFormChange = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!formState.full_name || !formState.email) {
      setFormError('Full name and email are required.');
      return;
    }
    if (dialogMode === 'add' && !formState.password) {
      setFormError('Password is required when adding a new employee.');
      return;
    }

    setFormLoading(true);
    try {
      if (dialogMode === 'add') {
        await api.post('/auth/register', {
          email: formState.email,
          password: formState.password,
          role: formState.role,
          full_name: formState.full_name,
          phone: formState.phone || undefined,
          department_id: formState.department_id ? Number(formState.department_id) : undefined,
          designation: formState.designation || undefined,
          salary: formState.salary ? Number(formState.salary) : undefined,
          join_date: formState.join_date || undefined,
          emp_code: formState.emp_code || undefined,
        });
      } else if (dialogMode === 'edit' && editingId) {
        await api.put(`/admin/employees/${editingId}`, {
          full_name: formState.full_name,
          phone: formState.phone || undefined,
          department_id: formState.department_id ? Number(formState.department_id) : undefined,
          designation: formState.designation || undefined,
          salary: formState.salary ? Number(formState.salary) : undefined,
          status: formState.status,
          email: formState.email,
          password: formState.password || undefined,
          role: formState.role,
        });
      }
      handleCloseDialog();
      fetchEmployees();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/employees/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Employees
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Icon icon="mingcute:add-line" width={20} />}
          onClick={handleOpenAdd}
        >
          Add Employee
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          {/* Toolbar / search */}
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center' }}>
            {selected.length > 0 && (
              <Typography variant="subtitle1" sx={{ flex: 1, color: 'primary.main' }}>
                {selected.length} selected
              </Typography>
            )}
            <OutlinedInput
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setPage(0);
              }}
              placeholder="Search employee..."
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <Icon icon="eva:search-fill" width={20} color="#919EAB" />
                </InputAdornment>
              }
              sx={{ maxWidth: 320 }}
            />
          </Box>

          <TableContainer
            sx={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: { xs: 'x proximity', md: 'none' },
              // Slim scrollbar so the horizontal "slider" reads as a swipe area on mobile
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: 3,
                backgroundColor: 'rgba(145, 158, 171, 0.4)',
              },
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              {/* Head */}
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selected.length > 0 && selected.length < employees.length
                      }
                      checked={employees.length > 0 && selected.length === employees.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  {HEAD_LABELS.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      {col.id ? (
                        <TableSortLabel
                          active={orderBy === col.id}
                          direction={orderBy === col.id ? order : 'asc'}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        ''
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {/* Body */}
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <EmployeeTableRow
                      key={row.id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => handleSelectRow(row.id)}
                      onView={handleOpenView}
                      onEdit={handleOpenEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}

                {emptyRows > 0 && (
                  <TableRow sx={{ height: 68 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}

                {notFound && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        Not found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No results for &ldquo;{filterName}&rdquo;
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            page={page}
            count={dataFiltered.length}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={dialogMode !== null}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {dialogMode === 'add' ? 'Add New Employee' : 'Edit Employee'}
        </DialogTitle>

        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formState.full_name}
                onChange={handleFormChange('full_name')}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formState.email}
                onChange={handleFormChange('email')}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formState.password}
                onChange={handleFormChange('password')}
                required={dialogMode === 'add'}
                helperText={dialogMode === 'edit' ? 'Leave blank to keep current password' : ''}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={formState.role}
                  onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={formState.phone}
                onChange={handleFormChange('phone')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Designation"
                value={formState.designation}
                onChange={handleFormChange('designation')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  value={formState.department_id}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, department_id: e.target.value }))
                  }
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Salary (₹)"
                type="number"
                value={formState.salary}
                onChange={handleFormChange('salary')}
              />
            </Grid>

            {dialogMode === 'add' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Employee Code"
                  value={formState.emp_code}
                  onChange={handleFormChange('emp_code')}
                  helperText="Optional — auto-generated if left blank"
                />
              </Grid>
            )}

            {dialogMode === 'add' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Join Date"
                  type="date"
                  value={formState.join_date}
                  onChange={handleFormChange('join_date')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            {dialogMode === 'edit' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={formState.status}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="on_leave">On Leave</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit" disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="inherit"
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {formLoading
              ? dialogMode === 'add'
                ? 'Adding...'
                : 'Saving...'
              : dialogMode === 'add'
                ? 'Add Employee'
                : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.name}</strong>? This will deactivate their account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit" disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Details Dialog ── */}
      <Dialog
        open={viewOpen}
        onClose={handleCloseView}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {viewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : viewError ? (
            <Alert severity="error">{viewError}</Alert>
          ) : viewData ? (
            <>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, fontSize: 24, bgcolor: 'primary.main' }}>
                  {(viewData.full_name || '?').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" noWrap>
                    {viewData.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {viewData.designation || 'Employee'}
                  </Typography>
                  <Chip
                    label={(viewData.status || 'active').replace('_', ' ')}
                    size="small"
                    color={
                      viewData.status === 'active'
                        ? 'success'
                        : viewData.status === 'on_leave'
                          ? 'warning'
                          : 'error'
                    }
                    variant="soft"
                    sx={{ mt: 0.5, textTransform: 'capitalize', fontWeight: 600 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />

              {/* Detail grid */}
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                {[
                  ['Employee Code', viewData.emp_code],
                  ['Account Role', viewData.role],
                  ['Email', viewData.email],
                  ['Login Email', viewData.login_email],
                  ['Phone', viewData.phone],
                  ['Department', viewData.department],
                  ['Designation', viewData.designation],
                  [
                    'Salary',
                    viewData.salary != null
                      ? `₹${Number(viewData.salary).toLocaleString('en-IN')}`
                      : null,
                  ],
                  [
                    'Join Date',
                    viewData.join_date
                      ? new Date(viewData.join_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : null,
                  ],
                  ['Status', viewData.status],
                ].map(([label, value]) => (
                  <Grid key={label} size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: label === 'Account Role' || label === 'Status' ? 'capitalize' : 'none' }}>
                      {value || '—'}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseView} color="inherit">
            Close
          </Button>
          {viewData && (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Icon icon="solar:pen-bold" width={18} />}
              onClick={() => {
                const row = employees.find((e) => e.id === String(viewData.id));
                handleCloseView();
                if (row) handleOpenEdit(row);
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
