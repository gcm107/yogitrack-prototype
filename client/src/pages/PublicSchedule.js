// public schedule page - public page to show classes
// shows all the yoga classes organized by day

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import styles from './PublicSchedule.module.css';

// days of the week in order
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function PublicSchedule() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // load all classes
  useEffect(() => {
    loadClasses();
  }, []);

  // get all classes 
  const loadClasses = async () => {
    try {
      const response = await fetch('/api/class/getAllClasses');
      if (!response.ok) throw new Error('Failed to load classes');
      
      const data = await response.json();
      setClasses(data);
      setLoading(false);
    } catch (err) {
      setError('Could not load class schedule');
      setLoading(false);
    }
  };

  // group classes by day of the week

  const classesByDay = {};
  daysOfWeek.forEach(day => {
    classesByDay[day] = [];
  });
  
  // expand each class 
  classes.forEach(cls => {
    if (cls.daytime && Array.isArray(cls.daytime)) {
      cls.daytime.forEach(schedule => {
        // normalize day names 
        const dayMap = {
          'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday',
          'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
        };
        const fullDay = dayMap[schedule.day] || schedule.day;
        
        if (classesByDay[fullDay]) {
          classesByDay[fullDay].push({
            ...cls,
            time: schedule.time,
            duration: schedule.duration,
            day: fullDay
          });
        }
      });
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/images/Logo.png" alt="YogiTrack Logo" className={styles.logo} />
        <h1 className={styles.title}>YogiTrack Class Schedule</h1>
        <p className={styles.subtitle}>Join us for yoga classes throughout the week</p>
        <Link to="/login">
          <Button variant="primary">Staff Login</Button>
        </Link>
      </div>

      <div className={styles.scheduleContainer}>
        {loading && <p className={styles.message}>Loading schedule...</p>}
        {error && <p className={styles.error}>{error}</p>}
        
        {!loading && !error && (
          <div className={styles.weekGrid}>
            {daysOfWeek.map(day => (
              <Card key={day} className={styles.dayCard}>
                <h2 className={styles.dayTitle}>{day}</h2>
                {classesByDay[day].length === 0 ? (
                  <p className={styles.noClasses}>No classes scheduled</p>
                ) : (
                  <div className={styles.classList}>
                    {classesByDay[day]
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map(cls => (
                        <div key={cls.classId} className={styles.classItem}>
                          <div className={styles.classTime}>{cls.time}</div>
                          <div className={styles.classInfo}>
                            <h3 className={styles.className}>{cls.className}</h3>
                            <p className={styles.classType}>{cls.classType} Class</p>
                            {cls.description && (
                              <p className={styles.classDesc}>{cls.description}</p>
                            )}
                            <p className={styles.classDuration}>{cls.duration} minutes</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicSchedule;

