// reports page - reports about the yoga studio
// like sales data, instructor stats, and customer info

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Snackbar from '../components/Snackbar';
import styles from './Reports.module.css';

// reports component
function Reports() {

  const [activeReport, setActiveReport] = useState('packageSales');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const handleFilterChange = (e) => {

    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // generate the selected report
  const generateReport = async () => {

    setLoading(true);
    setReportData(null);

    try {

      let url = `/api/reports/${activeReport}?`;

      //  filters based on report type
      if (activeReport === 'packageSales') {

        if (filters.startDate) url += `startDate=${filters.startDate}&`;

        if (filters.endDate) url += `endDate=${filters.endDate}&`;

      } else if (activeReport === 'instructorPerformance' || activeReport === 'teacherPayments') {

        url += `month=${filters.month}&year=${filters.year}&`;

      }

      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();
      setReportData(data);

    } catch (err) {
      showSnackbar(`Error generating report: ${err.message}`, 'error');

    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, type = 'success') => {

    setSnackbar({ open: true, message, type });

  };

  const reportTabs = [

    { id: 'packageSales', label: 'Package Sales', description: 'Sales data by package type' },
    { id: 'instructorPerformance', label: 'Instructor Performance', description: 'Classes and attendance by instructor' },
    { id: 'customerPackages', label: 'Customer Packages', description: 'Active, future, and expired packages' },
    { id: 'teacherPayments', label: 'Teacher Payments', description: 'Monthly instructor payment calculations' }
  ];

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.container}>
          <Card>
            <div className={styles.header}>
              <h1 className={styles.title}>Studio Reports</h1>
            </div>

            {/* report type tabs */}
            <div className={styles.tabs}>
              {reportTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeReport === tab.id ? styles.active : ''}`}
                  onClick={() => setActiveReport(tab.id)}
                >
                  <div className={styles.tabLabel}>{tab.label}</div>
                  <div className={styles.tabDescription}>{tab.description}</div>
                </button>
              ))}
            </div>

            {/* filters section */}
            <div className={styles.filters}>

              <h3>Report Filters</h3>

              <div className={styles.filterInputs}>

                {(activeReport === 'packageSales') && (
                  <>
                    <Input
                      label="Start Date"
                      name="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />

                    <Input
                      label="End Date"
                      name="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </>
                )}

                {(activeReport === 'instructorPerformance' || activeReport === 'teacherPayments') && (
                  <>
                    <Input
                      label="Month"
                      name="month"
                      type="number"
                      min="1"
                      max="12"
                      value={filters.month}
                      onChange={handleFilterChange}
                    />

                    <Input
                      label="Year"
                      name="year"
                      type="number"
                      value={filters.year}
                      onChange={handleFilterChange}
                    />
                  </>
                )}

              </div>

              <Button
                variant="primary"
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>

            </div>

            {/* report results */}
            {reportData && (

              <div className={styles.results}>

                <h3>Report Results</h3>

                <div className={styles.reportContent}>

                  {renderReportContent()}

                </div>

              </div>

            )}

          </Card>

        </div>
      </main>

      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );

  // rrender specific report 
  function renderReportContent() {
    if (!reportData) return null;

    switch (activeReport) {

      case 'packageSales':
        return (
          <div>

            <div className={styles.summary}>
              <p><strong>Total Sales:</strong> {reportData.totalSales}</p>
              <p><strong>Total Revenue:</strong> ${reportData.totalRevenue?.toFixed(2)}</p>
              <p><strong>Period:</strong> {reportData.period?.startDate || 'All time'} to {reportData.period?.endDate || 'Present'}</p>
            </div>

            <div className={styles.table}>
              <table>

                <thead>
                  <tr>
                    <th>Package ID</th>
                    <th>Package Name</th>
                    <th>Total Sales</th>
                    <th>Total Revenue</th>
                    <th>Customer Count</th>
                  </tr>
                </thead>

                <tbody>
                  {reportData.packages?.map(pkg => (
                    <tr key={pkg.packageId}>
                      <td>{pkg.packageId}</td>
                      <td>{pkg.packageName}</td>
                      <td>{pkg.totalSales}</td>
                      <td>${pkg.totalRevenue?.toFixed(2)}</td>
                      <td>{pkg.customers?.length}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        );

      case 'instructorPerformance':
        return (

          <div>

            <div className={styles.summary}>
              <p><strong>Period:</strong> {reportData.period?.month}/{reportData.period?.year}</p>
              <p><strong>Total Instructors:</strong> {reportData.instructors?.length}</p>
            </div>

            <div className={styles.table}>
              <table>

                <thead>
                  <tr>
                    <th>Instructor ID</th>
                    <th>Instructor Name</th>
                    <th>Total Classes</th>
                    <th>Total Check-ins</th>
                    <th>Average per Class</th>
                  </tr>

                </thead>

                <tbody>
                  {reportData.instructors?.map(inst => (
                    <tr key={inst.instructorId}>
                      <td>{inst.instructorId}</td>
                      <td>{inst.instructorName}</td>
                      <td>{inst.totalClasses}</td>
                      <td>{inst.totalCheckIns}</td>
                      <td>{inst.totalClasses > 0 ? (inst.totalCheckIns / inst.totalClasses).toFixed(1) : 0}</td>
                    </tr>

                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'customerPackages':
        return (
          <div>

            <div className={styles.summary}>
              <p><strong>Total Customers:</strong> {reportData.totalCustomers}</p>
              <p><strong>Active Packages:</strong> {reportData.summary?.totalActivePackages}</p>
            </div>

            <div className={styles.customerList}>
              {reportData.customers?.map(customer => (

                <div key={customer.customerId} className={styles.customerCard}>

                  <h4>{customer.customerName} ({customer.customerId})</h4>
                  <p><strong>Class Balance:</strong> {customer.classBalance}</p>

                  <div className={styles.packages}>
                    <strong>Packages:</strong>
                    {customer.packages?.length > 0 ? (

                      <ul>
                        {customer.packages.map((pkg, idx) => (
                          <li key={idx} className={styles[pkg.status]}>
                            {pkg.packageName} - {pkg.status} (ends: {new Date(pkg.endDate).toLocaleDateString()})
                          </li>
                        ))}
                      </ul>

                    ) : (
                      <span> No packages</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'teacherPayments':
        return (
          <div>
            <div className={styles.summary}>

              <p><strong>Period:</strong> {reportData.period?.monthName} {reportData.period?.year}</p>
              <p><strong>Total Payroll:</strong> ${reportData.totalPayroll?.toFixed(2)}</p>
            </div>

            <div className={styles.table}>

              <table>
                <thead>

                  <tr>
                    <th>Instructor ID</th>
                    <th>Instructor Name</th>
                    <th>Total Classes</th>
                    <th>Total Check-ins</th>
                    <th>Payment Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {reportData.instructors?.map(inst => (
                    <tr key={inst.instructorId}>

                      <td>{inst.instructorId}</td>
                      <td>{inst.instructorName}</td>
                      <td>{inst.classes?.length}</td>
                      <td>{inst.classes?.reduce((sum, cls) => sum + cls.checkIns, 0)}</td>
                      <td>${inst.totalPayment?.toFixed(2)}</td>
                    </tr>

                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <p>No report data available</p>;
    }
  }
}

export default Reports;
