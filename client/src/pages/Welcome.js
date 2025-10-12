import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import styles from './Welcome.module.css';

// welcome page - (landing page)
// button to log in to the main dashboard.
//  log in functionality not implemented yet.

function Welcome() {
  return (
    // the main container 
    <div className={styles.container}>
      {/* card so everything is together. */}
      <Card className={styles.card}>
        {/*company logo*/}
        <img src="/images/Logo.png" alt="YogiTrack Logo" className={styles.logo} />
        {/* the main title displayed below statgs */}
        <h1 className={styles.title}>Welcome to YogiTrack</h1>
        {/* message about the app status */}
        <p className={styles.subtitle}>Currently under development</p>
        {/* button to go to the main dashboard */}
        <Link to="/dashboard">
          <Button variant="primary">
            Log In
          </Button>
        </Link>
      </Card>
    </div>
  );
}

export default Welcome;
