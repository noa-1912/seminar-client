import { useState, useEffect } from 'react'
import { Box, Typography, Chip, Alert } from '@mui/material'
import Layout from './components/Layout/Layout';
import './App.css';
function App() {
  const [gatewayStatus, setGatewayStatus] = useState(null)
  const [gatewayError, setGatewayError] = useState(null)

  useEffect(() => {
    fetch('/gateway', { method: 'GET' })
      .then((res) => res.text())
      .then(() => setGatewayStatus('connected'))
      .catch((err) => setGatewayError(err.message))
  }, [])

  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        ברוכים הבאים
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
        תוכן העמוד הראשי יופיע כאן
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
        {gatewayStatus && (
          <Chip label="מחובר ל-Gateway" color="success" size="small" />
        )}
        {gatewayError && (
          <Alert severity="warning" sx={{ maxWidth: 400 }}>
            Gateway לא זמין (ודא שהוא רץ על פורט 7000). שגיאה: {gatewayError}
          </Alert>
        )}
      </Box>
    </Layout>
  )
}

export default App
