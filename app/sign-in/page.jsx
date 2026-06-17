'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Icon } from '@iconify/react';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/components/AuthProvider';

// ─── Sign In Page ─────────────────────────────────────────────────────────────

export default function SignInPage() {
  const router = useRouter();
  const { login, isAuthenticated, hydrated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Redirect if already logged in (must be in useEffect to avoid render-phase update warning)
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.push('/');
    }
  }, [hydrated, isAuthenticated, router]);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const loggedInUser = await login(email, password);
      const roleLabel = loggedInUser?.role === 'admin' ? 'Admin' : 'Employee';
      setSuccess(`${roleLabel} login successful`);
      setTimeout(() => router.push('/'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setLoading(false);
    }

  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSignIn();
  };

  return (
    <AuthLayout>
      {/* Title */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5, gap: 1.5 }}>
        <Typography variant="h5">Sign in</Typography>
        <Typography variant="body2" sx={{ color: 'common.black' }}>
          Employee &amp; Admin Dashboard
        </Typography>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Success */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ mb: 3 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          fullWidth
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          type={showPassword ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Icon icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={20} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          onClick={handleSignIn}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>

    </AuthLayout>
  );
}
