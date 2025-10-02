import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';

const drawerWidth = 280;

// sidebar nav
function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Instructors', path: '/instructor', icon: <PersonIcon /> },
    { text: 'Class Schedule', path: '/class', icon: <ClassIcon /> },
    { text: 'Customers', path: '/customer', icon: <PeopleIcon /> },
    { text: 'Packages', path: '/package', icon: <CardGiftcardIcon /> },
    { text: 'Sales', path: '/sale', icon: <ShoppingCartIcon /> },
    { text: 'Attendance', path: '/attendance', icon: <CheckCircleIcon /> },
    { text: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* logo */}
      <Box
        sx={{
          padding: 3,
          textAlign: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <RouterLink to="/dashboard" style={{ textDecoration: 'none' }}>
          <Box
            component="img"
            src="/images/Logo.png"
            alt="YogiTrack Logo"
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto 12px',
              display: 'block',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
            }}
          >
            YogiTrack
          </Typography>
        </RouterLink>
      </Box>

      {/* nav links */}
      <List sx={{ padding: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ marginBottom: 1 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive
                      ? 'primary.dark'
                      : 'action.hover',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'primary.main',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ marginX: 2 }} />

      {/* logout */}
      <List sx={{ padding: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={RouterLink}
            to="/"
            sx={{
              borderRadius: 2,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.main',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Log Out"
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;
