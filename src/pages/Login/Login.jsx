import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PageShell from '../../components/PageShell/PageShell';
import { useAuth } from '../../auth/AuthContext';

const loginSchema = z.object({
  nationalId: z
    .string()
    .trim()
    .regex(/^\d{9}$/, 'יש להזין תעודת זהות בת 9 ספרות.'),
  password: z.string().min(1, 'יש להזין סיסמה.'),
});

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const isDev = import.meta.env.DEV;
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nationalId: '',
      password: '',
    },
    mode: 'onBlur',
  });

  async function onSubmit(formValues) {
    setServerError('');
    if (isDev) {
      console.debug('[auth][login][validation-state]', {
        isValid,
        errors,
      });
      console.debug('[auth][login][submit-payload]', formValues);
    }

    try {
      await signIn(formValues);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.message || 'אירעה שגיאה לא צפויה.');
    }
  }

  return (
    <PageShell>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 1, md: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 520,
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={1}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                התחברות לחשבון
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ברוכה הבאה! התחברי כדי לצפות במשרות ובאיזור האישי שלך.
              </Typography>
            </Stack>

            {serverError ? <Alert severity="error">{serverError}</Alert> : null}

            <Controller
              name="nationalId"
              control={control}
              render={({ field }) => (
                <TextField
                  label="תעודת זהות"
                  fullWidth
                  autoComplete="username"
                  disabled={isSubmitting}
                  error={Boolean(errors.nationalId)}
                  helperText={errors.nationalId?.message}
                  inputProps={{ maxLength: 9, inputMode: 'numeric', pattern: '\\d*' }}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  label="סיסמה"
                  type="password"
                  fullWidth
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <LoginRoundedIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'מתחברת...' : 'התחברות'}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              עדיין אין חשבון?{' '}
              <Link component={RouterLink} to="/signup" underline="hover">
                להרשמה מהירה
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </PageShell>
  );
}
