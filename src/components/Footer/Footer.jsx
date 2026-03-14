import { Box, Container, Typography, Link } from '@mui/material';
import './Footer.css';

const quickLinks = [
  { label: 'דף הבית', href: '/' },
  { label: 'משרות', href: '/jobs' },
  { label: 'פרופילים', href: '/profiles' },
  { label: 'אודות', href: '/about' },
  { label: 'צור קשר', href: '/contact' },
];

function Footer() {
  return (
    <Box component="footer" className="footer">
      <Container maxWidth="lg" className="footer-container">
        <Box className="footer-grid">
          <Box className="footer-section footer-about">
            <Typography variant="h6" className="footer-title">
              השמה לסמינר טכנולוגי
            </Typography>
            <Typography variant="body2" className="footer-desc">
              מערכת השמה מתקדמת המחברת בין בוגרות הסמינר לבין משרות טכנולוגיות מובילות.
              שיבוץ ראיונות, מעקב אחר מועמדות ותמיכה לאורך כל התהליך.
            </Typography>
          </Box>

          <Box className="footer-section">
            <Typography variant="h6" className="footer-title">
              קישורים מהירים
            </Typography>
            <Box component="nav" className="footer-links">
              {quickLinks.map(({ label, href }) => (
                <Link key={href} href={href} className="footer-link">
                  {label}
                </Link>
              ))}
            </Box>
          </Box>

          <Box className="footer-section">
            <Typography variant="h6" className="footer-title">
              פרטי קשר
            </Typography>
            <Typography variant="body2" className="footer-contact">
              דוא״ל: contact@seminar.co.il
            </Typography>
            <Typography variant="body2" className="footer-contact">
              טלפון: 03-1234567
            </Typography>
          </Box>
        </Box>

        <Box className="footer-bottom">
          <Typography variant="body2" className="footer-copyright">
            © {new Date().getFullYear()} השמה לסמינר. כל הזכויות שמורות.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
