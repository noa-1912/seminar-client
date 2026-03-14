import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { colors } from "../../theme/colors";
import './Header.css';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Profiles', path: '/profiles' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppBar position="sticky" className="header-appbar" elevation={0}>
      <Toolbar className="header-toolbar">
        <Typography variant="h6" component="a" href="/" className="header-logo">
          השמה לסמינר
        </Typography>

        <Box className="header-nav" component="nav">
          {navLinks.map(({ label, path }) => (
            <Button
              key={path}
              href={path}
              className="header-nav-link"
              sx={{ color: colors.textPrimary, '&:hover': { color: colors.grayDark } }}
            >
              {label}
            </Button>
          ))}
        </Box>

        <Box className="header-actions">
          <Button href="/login" className="header-login" size="small">
            Login
          </Button>
          <Button href="/signup" className="header-signup" size="small" variant="contained">
            Sign Up
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
            <Button key={path} href={path} fullWidth className="header-mobile-link">
              {label}
            </Button>
          ))}
          <Button href="/login" fullWidth className="header-mobile-link">
            Login
          </Button>
          <Button href="/signup" fullWidth className="header-signup header-mobile-link">
            Sign Up
          </Button>
        </Box>
      )}
    </AppBar>
  );
}

export default Header;
