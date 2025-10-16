//  main app that handles all the pages
// uses router to switch between different pages

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PublicSchedule from './pages/PublicSchedule';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Instructor from './pages/Instructor';
import Class from './pages/Class';
import Customer from './pages/Customer';
import Package from './pages/Package';
import Sale from './pages/Sale';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        {/* routes to the different pages */}
        <Route path="/" element={<PublicSchedule />} />
        <Route path="/login" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/class" element={<Class />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/package" element={<Package />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
