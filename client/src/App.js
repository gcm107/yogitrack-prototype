//  main app that handles all the pages
// uses router to switch between different pages

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Instructor from './pages/Instructor';
import Class from './pages/Class';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/class" element={<Class />} />
      </Routes>
    </Router>
  );
}

export default App;
