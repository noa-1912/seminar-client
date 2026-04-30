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
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import PageShell from '../../components/PageShell/PageShell';
import { useAuth } from '../../auth/AuthContext';

const signupSchema = z
  .object({
    nationalId: z
      .string()
      .trim()
      .regex(/^\d{9}$/, 'יש להזין תעודת זהות בת 9 ספרות.'),
    email: z.string().trim().email('יש להזין כתובת אימייל תקינה.'),
    role: z.enum(['Student', 'Admin', 'Employer']),
    password: z
      .string()
      .min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים.')
      .max(64, 'הסיסמה ארוכה מדי.'),
    confirmPassword: z.string().min(1, 'יש לאמת את הסיסמה.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'אימות הסיסמה אינו תואם לסיסמה.',
    path: ['confirmPassword'],
  });

export default function Signup() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const isDev = import.meta.env.DEV;
  const { signUp } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nationalId: '',
      email: '',
      role: 'Student',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  async function onSubmit(formValues) {
    setServerError('');
    if (isDev) {
      console.debug('[auth][signup][validation-state]', {
        isValid,
        errors,
      });
      console.debug('[auth][signup][submit-payload]', formValues);
    }

    try {
      await signUp({
        nationalId: formValues.nationalId,
        email: formValues.email,
        password: formValues.password,
        role: formValues.role,
      });

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
            maxWidth: 620,
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
                יצירת חשבון חדש
              </Typography>
              <Typography variant="body1" color="text.secondary">
                הרשמי עכשיו כדי להתחיל להשתמש במערכת בצורה מלאה.
              </Typography>
            </Stack>

            {serverError ? <Alert severity="error">{serverError}</Alert> : null}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="אימייל"
                    type="email"
                    fullWidth
                    autoComplete="email"
                    disabled={isSubmitting}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                  />
                )}
              />
            </Stack>

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="סוג משתמש"
                  fullWidth
                  disabled={isSubmitting}
                  error={Boolean(errors.role)}
                  helperText={errors.role?.message || 'ברירת המחדל מתאימה לסטודנטיות.'}
                  value={field.value ?? 'Student'}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                >
                  <MenuItem value="Student">סטודנטית</MenuItem>
                  <MenuItem value="Employer">מעסיק/ה</MenuItem>
                  <MenuItem value="Admin">מנהלת</MenuItem>
                </TextField>
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="סיסמה"
                    type="password"
                    fullWidth
                    autoComplete="new-password"
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
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="אימות סיסמה"
                    type="password"
                    fullWidth
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword?.message}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                  />
                )}
              />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={
                isSubmitting ? <CircularProgress size={18} color="inherit" /> : <PersonAddAltRoundedIcon />
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? 'יוצרת חשבון...' : 'הרשמה'}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              כבר יש לך חשבון?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                להתחברות
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </PageShell>
  );
}
