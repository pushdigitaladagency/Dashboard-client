'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

// ─── AuthLayout ───────────────────────────────────────────────────────────────
// Centered card layout with background overlay, used on the sign-in page.

export default function AuthLayout({ children }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&::before': {
          content: "''",
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.24,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundImage: 'url(/assets/background/overlay.jpg)',
        },
      }}
    >
      {/* Header */}
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          zIndex: 1,
          bgcolor: 'transparent',
          borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'common.black' }}>
              Employee &amp; Admin Dashboard
            </Typography>
          </Box>

          <Link href="#" underline="hover" color="inherit" sx={{ typography: 'subtitle2' }}>
            Need help?
          </Link>
        </Toolbar>
      </AppBar>

      {/* Centered content card */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          position: 'relative',
          p: { xs: 2, md: 0 },
        }}
      >
        <Box
          sx={{
            p: { xs: 4, sm: 5 },
            width: '100%',
            maxWidth: 420,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 24px 48px 0 rgba(0,0,0,0.12)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
