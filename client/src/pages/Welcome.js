import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from './Welcome.module.css';

// welcome page - login form
// user enters username and password to access the app

function Welcome() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // handle login button
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // validation
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    try {
      // sending login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // go to dashb oard if login was correct 
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');

    } catch (err) {
      setError('Error connecting to server');
    }
  };

  return (
    //  main container 
    <div className={styles.container}>
      
      <Card className={styles.card}>
      
        <img src="/images/Logo.png" alt="YogiTrack Logo" className={styles.logo} />

        {/* the main title */}
        <h1 className={styles.title}>Welcome to YogiTrack</h1>


        {/* login form */}
        <form onSubmit={handleLogin} className={styles.form}>
          <Input
            label="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* show error message if login fails */}
          {error && <p className={styles.error}>{error}</p>}


          {/* login button */}
          <Button type="submit" variant="primary">
            Log In
          </Button>

          
          {/* only fortesting */}
          <p className={styles.hint}>Default: username='manager', password='password123'</p>
        </form>
      </Card>
    </div>
  );
}

export default Welcome;
