import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// page components
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Instructor from './pages/Instructor';
import Class from './pages/Class';
// coming in phase 2
// import Customer from './pages/Customer';
// import Package from './pages/Package';
// import Sale from './pages/Sale';
// import Attendance from './pages/Attendance';
// import Reports from './pages/Reports';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instructor" element={<Instructor />} />
          <Route path="/class" element={<Class />} />
          {/* phase 2 stuff */}
          {/* <Route path="/customer" element={<Customer />} /> */}
          {/* <Route path="/package" element={<Package />} /> */}
          {/* <Route path="/sale" element={<Sale />} /> */}
          {/* <Route path="/attendance" element={<Attendance />} /> */}
          {/* <Route path="/reports" element={<Reports />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
