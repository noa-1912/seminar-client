import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          className="header-logo"
          sx={{ color: 'text.primary' }}
        >
          השמה לסמינר
        </Typography>

        <Box className="header-nav" component="nav">
          {navLinks.map(({ label, path }) => (
            <Button
              key={path}
              component={RouterLink}
              to={path}
              className="header-nav-link"
              color="inherit"
              variant={pathname === path ? 'outlined' : 'text'}
              sx={{ borderRadius: '999px' }}
            >
              {label}
            </Button>
          ))}
        </Box>

        <Box className="header-actions">
          <Button component={RouterLink} to="/login" className="header-login" size="small" variant="outlined">
            התחברות
          </Button>
          <Button component={RouterLink} to="/signup" className="header-signup" size="small" variant="contained">
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
              className="header-mobile-link"
            >
              {label}
            </Button>
          ))}
          <Button component={RouterLink} to="/login" onClick={() => setMobileOpen(false)} fullWidth className="header-mobile-link">
            התחברות
          </Button>
          <Button component={RouterLink} to="/signup" onClick={() => setMobileOpen(false)} fullWidth className="header-signup header-mobile-link">
            הרשמה
          </Button>
        </Box>
      )}
    </AppBar>
  );
}

export default Header;
