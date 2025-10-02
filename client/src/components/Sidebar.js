import React from 'react';
import { Link } from 'react-router-dom';

// sidebar like in old version
function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/dashboard" className="logo-wrap">
        <img src="/images/Logo.png" alt="YogiTrack Logo" className="logo" />
      </Link>
      <nav className="nav">
        <Link to="/instructor">Instructors</Link>
        <Link to="/package">Packages</Link>
        <Link to="/class">Class Schedule</Link>
        <Link to="/customer">Customers</Link>
        <Link to="/sale">Sales</Link>
        <Link to="/attendance">Attendance</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/">Log Out</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;

