import { Box } from '@mui/material';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import './Layout.css';

/**
 * Layout – עוטף את כל דפי האתר
 * כולל Header גלובלי, אזור תוכן, Footer גלובלי
 */
function Layout({ children }) {
  return (
    <Box className="layout">
      <Header />
      <Box component="main" className="layout-main">
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;
