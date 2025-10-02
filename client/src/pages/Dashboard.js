import React from 'react';
import Sidebar from '../components/Sidebar';

// dashboard page
function Dashboard() {
  return (
    <div className="background">
      <div className="overlay">
        <div className="layout--sidebar">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

