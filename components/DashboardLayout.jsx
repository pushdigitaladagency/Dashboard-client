'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, alpha } from '@mui/material/styles';

import { Icon } from '@iconify/react';
import { api, useAuth } from '@/components/AuthProvider';

// ─── Nav items ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    title: 'Dashboard',
    path: '/',
    icon: 'mdi:view-dashboard-outline',
    roles: null, // visible to everyone
  },
  {
    title: 'Employees',
    path: '/user',
    icon: 'mdi:account-group-outline',
    roles: ['admin'], // admin only
  },
];

const NAV_WIDTH = 280;

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({ onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const theme = useTheme();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2.5, px: 2.5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {user?.role === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
        </Typography>
      </Box>

      {/* Workspace label */}
      <Box
        sx={{
          mb: 2,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.grey[500], 0.08),
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Icon icon="mdi:office-building-outline" width={18} color={theme.palette.text.secondary} />
        <Typography variant="body2" color="text.secondary" noWrap>
          {user?.email?.split('@')[0] ?? 'User'}
        </Typography>
      </Box>

      {/* Nav list */}
      <List disablePadding sx={{ flex: 1 }}>
        {visibleItems.map((item) => {
          const isActive = item.path === pathname;
          return (
            <ListItemButton
              key={item.title}
              component="a"
              href={item.path}
              onClick={onClose}
              sx={{
                pl: 2,
                py: 1,
                gap: 2,
                pr: 1.5,
                mb: 0.5,
                borderRadius: 1,
                typography: 'body2',
                fontWeight: 500,
                color: isActive ? 'primary.main' : 'text.secondary',
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, 0.16)
                    : alpha(theme.palette.grey[500], 0.08),
                },
                minHeight: 44,
              }}
            >
              <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center' }}>
                <Icon
                  icon={item.icon}
                  width={22}
                  color={isActive ? theme.palette.primary.main : theme.palette.text.secondary}
                />
              </Box>
              <Box component="span" sx={{ flexGrow: 1 }}>
                {item.title}
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

// ─── Account popover ─────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function AccountPopover() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const [anchor, setAnchor] = useState(null);
  const displayName = user?.email?.split('@')[0] ?? 'User';

  // Profile dialog state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const handleOpenProfile = async () => {
    setAnchor(null);
    setProfileOpen(true);
    setProfileData(null);
    setProfileError(null);
    setProfileLoading(true);
    try {
      const res = await api.get('/emp/profile');
      setProfileData(res.data);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to load your profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: `conic-gradient(${theme.palette.primary.light}, ${theme.palette.warning.light}, ${theme.palette.primary.light})`,
        }}
      >
        <Avatar src="" alt={displayName} sx={{ width: 1, height: 1, fontSize: 14 }}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 200 } } }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email ?? ''}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList disablePadding sx={{ p: 1 }}>
          <MenuItem
            onClick={handleOpenProfile}
            sx={{ borderRadius: 0.75, gap: 2, color: 'text.secondary' }}
          >
            <Icon icon="solar:user-circle-outline" width={20} />
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              router.push('/');
            }}
            sx={{ borderRadius: 0.75, gap: 2, color: 'text.secondary' }}
          >
            <Icon icon="mdi:view-dashboard-outline" width={20} />
            Dashboard
          </MenuItem>
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            color="error"
            size="medium"
            variant="text"
            onClick={() => {
              logout();
              router.push('/sign-in');
            }}
          >
            Logout
          </Button>
        </Box>
      </Popover>

      {/* ── My Profile Dialog ── */}
      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle>My Profile</DialogTitle>
        <DialogContent>
          {profileLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : profileError ? (
            <Alert severity="error">{profileError}</Alert>
          ) : profileData ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, fontSize: 24, bgcolor: 'primary.main' }}>
                  {(profileData.full_name || '?').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" noWrap>
                    {profileData.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {profileData.designation || 'Employee'}
                  </Typography>
                  <Chip
                    label={(profileData.status || 'active').replace('_', ' ')}
                    size="small"
                    color={
                      profileData.status === 'active'
                        ? 'success'
                        : profileData.status === 'on_leave'
                          ? 'warning'
                          : 'error'
                    }
                    variant="soft"
                    sx={{ mt: 0.5, textTransform: 'capitalize', fontWeight: 600 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ borderStyle: 'dashed', mb: 1 }} />

              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                {[
                  ['Employee Code', profileData.emp_code],
                  ['Email', profileData.email],
                  ['Phone', profileData.phone],
                  ['Department', profileData.department],
                  ['Designation', profileData.designation],
                  ['Joined', formatDate(profileData.join_date)],
                  ['Status', profileData.status],
                ].map(([label, value]) => (
                  <Grid key={label} size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, textTransform: label === 'Status' ? 'capitalize' : 'none' }}
                    >
                      {value || '—'}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setProfileOpen(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Main DashboardLayout ─────────────────────────────────────────────────────

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Desktop sidebar ── */}
      <Box
        component="nav"
        sx={{
          width: NAV_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <Box
          sx={{
            top: 0,
            left: 0,
            height: '100vh',
            width: NAV_WIDTH,
            position: 'fixed',
            overflowY: 'auto',
            borderRight: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            bgcolor: 'background.paper',
          }}
        >
          <SidebarContent onClose={() => {}} />
        </Box>
      </Box>

      {/* ── Mobile drawer ── */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { width: NAV_WIDTH },
        }}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </Drawer>

      {/* ── Main area ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(6px)',
            borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 1 }}>
            {/* Hamburger — mobile only */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'inline-flex', lg: 'none' }, mr: 1 }}
            >
              <Icon icon="mdi:menu" width={24} color={theme.palette.text.primary} />
            </IconButton>

            <Box sx={{ flex: 1 }} />

            {/* Account avatar */}
            <AccountPopover />
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3 },
            py: { xs: 3, sm: 4 },
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
