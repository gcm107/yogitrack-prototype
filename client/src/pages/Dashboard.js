// dashboard page - overview of the yoga studio with stats and info

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import styles from './Dashboard.module.css';

function Dashboard() {
  // store the stats we get from the database
  const [stats, setStats] = useState([
    { title: 'Total Instructors', value: '-', color: 'rgb(92, 7, 24)' },
    { title: 'Active Classes', value: '-', color: 'rgb(61, 6, 16)' },
    { title: 'Total Customers', value: '-', color: '#C1272D' },
    { title: 'Monthly Revenue', value: '-', color: '#388E3C' },
  ]);

  // load the stats when the page opens
  useEffect(() => {
    loadStats();
  }, []);

  // get the stats from the server
  const loadStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      // update the stats with real data
      setStats([
        { title: 'Total Instructors', value: data.totalInstructors, color: 'rgb(92, 7, 24)' },
        { title: 'Active Classes', value: data.totalClasses, color: 'rgb(61, 6, 16)' },
        { title: 'Total Customers', value: data.totalCustomers, color: '#C1272D' },
        { title: 'Monthly Revenue', value: `$${data.monthlyRevenue}`, color: '#388E3C' },
      ]);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  return (
    // main layout with sidebar on left and content on right
    <div className={styles.layout}>
      <Sidebar />

      
      {/*  main area with background image */}
      <main className={styles.main} style={{
        backgroundImage: `linear-gradient(135deg, rgba(92, 7, 24, 0.05) 0%, rgba(61, 6, 16, 0.05) 100%), url('/images/YogaClass.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Dashboard</h1>

          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Card key={index} className={styles.statCard}>
                <div className={styles.iconBox} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  <span className={styles.statIcon}>{stat.icon}</span>
                </div>
                <h2 className={styles.statValue}>{stat.value}</h2>
                <p className={styles.statTitle}>{stat.title}</p>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className={styles.welcomeTitle}>Management Portal</h2>
            <p className={styles.welcomeText}>
              Add classes, instructors, customers, packages, sales, and attendance.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
