// import components
import React from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import styles from './Dashboard.module.css';

// stats on the dashboard page, like total instructors, active classes etc
const stats = [
  { title: 'Total Instructors', value: '-', color: 'rgb(92, 7, 24)' },
  { title: 'Active Classes', value: '-', color: 'rgb(61, 6, 16)' },
  { title: 'Total Customers', value: '-', color: '#C1272D' },
  { title: 'Monthly Revenue', value: '-', color: '#388E3C' },
];

function Dashboard() {
  return (
    <div className={styles.layout}>
      <Sidebar />
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
            <h2 className={styles.welcomeTitle}>YogiTrack is currently under development</h2>
            <p className={styles.welcomeText}>
              Use the sidebar to navigate between different sections.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
