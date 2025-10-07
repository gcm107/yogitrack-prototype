import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent 
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

// welcome page
function Welcome() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgb(92, 7, 24) 0%, rgb(61, 6, 16) 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardContent sx={{ padding: 6, textAlign: 'center' }}>
            <Box
              component="img"
              src="/images/Logo.png"
              alt="YogiTrack Logo"
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto 24px',
                display: 'block',
              }}
            />
            
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                marginBottom: 2,
              }}
            >
              Currently in development
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
              sx={{ marginBottom: 4 }}
            >
              Currently in development
            </Typography>
            
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{
                paddingX: 6,
                paddingY: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(92, 7, 24, 0.3)',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(92, 7, 24, 0.4)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Welcome;
