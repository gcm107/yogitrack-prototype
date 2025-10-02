import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//  page components
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Instructor from './pages/Instructor';
import Class from './pages/Class';
// will be implemented later
// import Customer from './pages/Customer';
// import Package from './pages/Package';
// import Sale from './pages/Sale';
// import Attendance from './pages/Attendance';
// import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/class" element={<Class />} />
        {/* will be implemented later */}
        {/* <Route path="/customer" element={<Customer />} /> */}
        {/* <Route path="/package" element={<Package />} /> */}
        {/* <Route path="/sale" element={<Sale />} /> */}
        {/* <Route path="/attendance" element={<Attendance />} /> */}
        {/* <Route path="/reports" element={<Reports />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
