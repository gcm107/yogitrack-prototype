import React from 'react';
import { Link } from 'react-router-dom';

// main welcome page
function Welcome() {
  return (
    <div className="layout--center">
      <main className="card card--wide text--center">
        <img src="/images/Logo.png" alt="YogiTrack Logo" className="logo" />
        <h1>Welcome to YogiTrack</h1>
        <p>Your all-in-one studio management companion.</p>
        <Link className="btn btn--primary" to="/dashboard">Log&nbsp;in</Link>
      </main>
    </div>
  );
}

export default Welcome;

