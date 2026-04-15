import { Box, Divider, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const quickLinks = [
  { label: 'דף הבית', to: '/' },
  { label: 'משרות', to: '/jobs' },
  { label: 'פרופילים', to: '/profiles' },
  { label: 'אודות', to: '/about' },
];

const legalLinks = [
  { label: 'צור קשר', to: '/contact' },
  { label: 'מדיניות פרטיות', to: '/about' },
];

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 3.5 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Stack spacing={0.75} sx={{ maxWidth: 360 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'var(--font-family-heading)' }}>
                השמה לסמינר
              </Typography>
              <Typography variant="body2" color="text.secondary">
                פלטפורמה חכמה לחיבור בוגרות למשרות טכנולוגיות.
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Stack spacing={0.75} component="nav" aria-label="קישורי ניווט">
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                ניווט
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', rowGap: 0.5, columnGap: 1 }}>
                {quickLinks.map(({ label, to }, index) => (
                  <Box key={to} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Link
                      component={RouterLink}
                      to={to}
                      underline="none"
                      color="text.secondary"
                      sx={{
                        width: 'fit-content',
                        fontSize: '0.875rem',
                        transition: 'color 0.2s ease',
                        '&:hover': { color: 'text.primary' },
                      }}
                    >
                      {label}
                    </Link>
                    {index < quickLinks.length - 1 && (
                      <Typography component="span" color="text.disabled" sx={{ fontSize: '0.8rem' }}>
                        |
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Stack spacing={0.75}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                קשר
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  contact@seminar.co.il
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  03-1234567
                </Typography>
                {legalLinks.map(({ label, to }, index) => (
                  <Box key={label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Link
                      component={RouterLink}
                      to={to}
                      underline="none"
                      color="text.secondary"
                      sx={{
                        width: 'fit-content',
                        fontSize: '0.875rem',
                        transition: 'color 0.2s ease',
                        '&:hover': { color: 'text.primary' },
                      }}
                    >
                      {label}
                    </Link>
                    {index < legalLinks.length - 1 && (
                      <Typography component="span" color="text.disabled" sx={{ fontSize: '0.8rem' }}>
                        |
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'divider' }} />

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} השמה לסמינר. כל הזכויות שמורות.
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;
