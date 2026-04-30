import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useThemeMode } from '../../theme/useThemeMode';
import './Header.css';

const navLinks = [
  { label: 'דף הבית', path: '/' },
  { label: 'משרות', path: '/jobs' },
  { label: 'איזור אישי', path: '/personal-area', matchPrefixes: ['/my-applications', '/private-invitations'] },
  { label: 'הריאיונות שלי', path: '/my-interviews' },
  { label: 'פרופילים', path: '/profiles' },
  { label: 'אודות', path: '/about' },
  { label: 'צור קשר', path: '/contact' },
];

function isLinkActive(pathname, link) {
  if (pathname === link.path) return true;
  if (link.matchPrefixes) {
    return link.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }
  return false;
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const { isAuthenticated, user, signOut } = useAuth();
  const hireLinkLogoSrc =
    mode === 'dark' ? '/logo-hirelink-dark.png' : '/logo-hirelink-light.png';

  async function handleSignOut() {
    await signOut();
    setMobileOpen(false);
    navigate('/login');
  }

  return (
    <AppBar
      position="sticky"
      className="header-appbar"
      sx={{
        left: 0,
        right: 0,
        width: '100%',
        bgcolor: (theme) => alpha(theme.palette.background.default, mode === 'dark' ? 0.82 : 0.72),
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
              bgcolor: 'transparent',
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
                filter:
                  mode === 'dark'
                    ? 'brightness(0) saturate(100%) invert(80%) sepia(17%) saturate(248%) hue-rotate(343deg) brightness(90%) contrast(88%)'
                    : 'none',
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
          {navLinks.map((link) => {
            const active = isLinkActive(pathname, link);
            return (
              <Button
                key={link.path}
                component={RouterLink}
                to={link.path}
                className={`header-nav-link btn ${active ? 'btn--secondary' : ''}`}
                color="inherit"
                variant={active ? 'outlined' : 'text'}
              >
                {link.label}
              </Button>
            );
          })}
        </Box>

        <Box className="header-actions">
          <IconButton
            onClick={toggleMode}
            className="header-theme-toggle"
            aria-label={mode === 'dark' ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
          >
            {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                {`שלום, ${user?.email ?? 'משתמשת'}`}
              </Typography>
              <Button
                onClick={handleSignOut}
                className="header-login btn btn--secondary"
                size="small"
                variant="outlined"
              >
                התנתקות
              </Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login" className="header-login btn btn--secondary" size="small" variant="outlined">
                התחברות
              </Button>
              <Button component={RouterLink} to="/signup" className="header-signup btn btn--primary" size="small" variant="contained">
                הרשמה
              </Button>
            </>
          )}
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
          {navLinks.map((link) => {
            const active = isLinkActive(pathname, link);
            return (
              <Button
                key={link.path}
                component={RouterLink}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                fullWidth
                className={`header-mobile-link btn ${active ? 'btn--secondary' : ''}`}
              >
                {link.label}
              </Button>
            );
          })}
          <Button
            onClick={() => {
              toggleMode();
              setMobileOpen(false);
            }}
            fullWidth
            className="header-mobile-link btn btn--secondary"
            variant="outlined"
          >
            מצב תצוגה
          </Button>
          {isAuthenticated ? (
            <>
              <Typography sx={{ px: 2, py: 1.5 }}>{`שלום, ${user?.email ?? 'משתמשת'}`}</Typography>
              <Button
                onClick={handleSignOut}
                fullWidth
                className="header-mobile-link btn btn--secondary"
                variant="outlined"
              >
                התנתקות
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </Box>
      )}
    </AppBar>
  );
}

export default Header;
