import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useThemeMode } from '../../theme/useThemeMode';
import './Header.css';

const navLinks = [
  { label: 'דף הבית', path: '/' },
  { label: 'משרות', path: '/jobs' },
  { label: 'פרופילים', path: '/profiles' },
  { label: 'אודות', path: '/about' },
  { label: 'צור קשר', path: '/contact' },
  { label: 'הגדרות', path: '/settings' },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { mode } = useThemeMode();
  const hireLinkLogoSrc =
    mode === 'dark' ? '/logo-hirelink-dark.png' : '/logo-hirelink-light.png';

  return (
    <AppBar
      position="sticky"
      className="header-appbar"
      sx={{
        bgcolor: 'transparent',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar className="header-toolbar">
        <Box
          className="header-brand"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'nowrap',
            flexShrink: 0,
            gap: { xs: 3, sm: 5, md: 8 },
          }}
        >
          <Box
            className="header-logo-figure"
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              height: { xs: 50, sm: 58, md: 64 },
              overflow: 'hidden',
              bgcolor: 'background.headerLogo',
            }}
          >
            <Box
              component="img"
              src={hireLinkLogoSrc}
              alt="HireLink"
              sx={{
                width: 'auto',
                maxWidth: { xs: 'min(200px, 45vw)', sm: 220, md: 260 },
                height: { xs: 58, sm: 68, md: 78 },
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                /* Zoom past empty padding in the source PNG; keep transparent areas only. */
                transform: 'scale(1.12)',
                transformOrigin: 'center center',
              }}
            />
          </Box>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            className="header-logo"
            sx={{
              color: 'text.primary',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            השמה לסמינר
          </Typography>
        </Box>

        <Box className="header-nav" component="nav">
          {navLinks.map(({ label, path }) => (
            <Button
              key={path}
              component={RouterLink}
              to={path}
              className={`header-nav-link btn ${pathname === path ? 'btn--secondary' : ''}`}
              color="inherit"
              variant={pathname === path ? 'outlined' : 'text'}
            >
              {label}
            </Button>
          ))}
        </Box>

        <Box className="header-actions">
          <Button component={RouterLink} to="/login" className="header-login btn btn--secondary" size="small" variant="outlined">
            התחברות
          </Button>
          <Button component={RouterLink} to="/signup" className="header-signup btn btn--primary" size="small" variant="contained">
            הרשמה
          </Button>
        </Box>

        <IconButton
          className="header-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="תפריט"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {mobileOpen && (
        <Box className="header-mobile-nav">
          {navLinks.map(({ label, path }) => (
            <Button
              key={path}
              component={RouterLink}
              to={path}
              onClick={() => setMobileOpen(false)}
              fullWidth
              className={`header-mobile-link btn ${pathname === path ? 'btn--secondary' : ''}`}
            >
              {label}
            </Button>
          ))}
          <Button
            component={RouterLink}
            to="/login"
            onClick={() => setMobileOpen(false)}
            fullWidth
            className="header-mobile-link btn btn--secondary"
            variant="outlined"
          >
            התחברות
          </Button>
          <Button
            component={RouterLink}
            to="/signup"
            onClick={() => setMobileOpen(false)}
            fullWidth
            className="header-signup header-mobile-link btn btn--primary"
            variant="contained"
          >
            הרשמה
          </Button>
        </Box>
      )}
    </AppBar>
  );
}

export default Header;
