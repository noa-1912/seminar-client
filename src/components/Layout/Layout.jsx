import { Box } from '@mui/material';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import './Layout.css';
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
