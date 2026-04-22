import { Box, Container, Paper } from '@mui/material';

export default function PageShell({ children }) {
  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ borderRadius: '24px', px: 4, py: 3, bgcolor: 'background.paper' }}>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}

