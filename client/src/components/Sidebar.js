
// this is the sidebar that shows on the left side
// it has the logo and all the menu links

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const menuItems = [
  { text: 'Dashboard', path: '/dashboard'},
  { text: 'Instructors', path: '/instructor'},
  { text: 'Class Schedule', path: '/class'},
  { text: 'Customers', path: '/customer'},
  { text: 'Packages', path: '/package'},
  { text: 'Sales', path: '/sale'},
  { text: 'Attendance', path: '/attendance'},
  { text: 'Reports', path: '/reports'},
];

function Sidebar() {
  // gets the current page locaton to highlight the active mnu item
  const location = useLocation();

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logoSection}>
        <Link to="/dashboard" className={styles.logoLink}>
          <img src="/images/Logo.png" alt="YogiTrack Logo" className={styles.logo} />
          <h1 className={styles.title}>YogiTrack</h1>
        </Link>
      </div>

      <ul className={styles.menu}>
        {menuItems.map((item) => {
          // check if this item is the current page
          const isActive = location.pathname === item.path;
          return (
            <li key={item.text}>
              <Link
                to={item.path}
                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.text}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.divider}></div>

      <ul className={styles.menu}>
        <li>
          <Link to="/" className={`${styles.menuItem} ${styles.logout}`}>
            <span className={styles.icon}>🚪</span>
            <span>Log Out</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
