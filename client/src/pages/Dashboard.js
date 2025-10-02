import React from 'react';
import Sidebar from '../components/Sidebar';
import { Box, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// dashboard page
function Dashboard() {
  const stats = [
    {
      title: 'Total Instructors',
      value: '-',
      icon: <PersonIcon />,
      color: 'rgb(92, 7, 24)',
    },
    {
      title: 'Active Classes',
      value: '-',
      icon: <ClassIcon />,
      color: 'rgb(61, 6, 16)',
    },
    {
      title: 'Total Customers',
      value: '-',
      icon: <PeopleIcon />,
      color: '#C1272D',
    },
    {
      title: 'Monthly Revenue',
      value: '-',
      icon: <TrendingUpIcon />,
      color: '#388E3C',
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(92, 7, 24, 0.05) 0%, rgba(61, 6, 16, 0.05) 100%)',
          backgroundImage: `
            linear-gradient(135deg, rgba(92, 7, 24, 0.05) 0%, rgba(61, 6, 16, 0.05) 100%),
            url('/images/YogaClass.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <Container maxWidth="lg" sx={{ paddingY: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              marginBottom: 4,
            }}
          >
            Dashboard
          </Typography>

          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ padding: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 2,
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: `${stat.color}15`,
                          borderRadius: 2,
                          padding: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: stat.color,
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        marginBottom: 0.5,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ marginTop: 4 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent sx={{ padding: 4 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 600, color: 'primary.main' }}
                >
                  Welcome to YogiTrack
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your yoga studio with ease. Use the sidebar to navigate between different sections.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Dashboard;
