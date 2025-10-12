import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import styles from './Welcome.module.css';

// welcome page
function Welcome() {
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <img src="/images/Logo.png" alt="YogiTrack Logo" className={styles.logo} />
        <h1 className={styles.title}>Welcome to YogiTrack</h1>
        <p className={styles.subtitle}>Currently under development</p>
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
