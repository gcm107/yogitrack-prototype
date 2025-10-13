// attendance page - instructors mark who showed up to classes
// when someone attends, their class balance goes down by 1

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Snackbar from '../components/Snackbar';
import styles from './Attendance.module.css';

function Attendance() {


  const [classes, setClasses] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({

    classId: ''
  });

  useEffect(() => {

    loadClasses();
    loadCustomers();
  }, []);

  const loadClasses = useCallback(async () => {

    try {
   
      const response = await fetch('/api/class/getAllClasses');
      const data = await response.json();
      setClasses(data);
   
    } catch (err) {

      showSnackbar('Error loading classes', 'error');
    }
  }, []);

  const loadCustomers = useCallback(async () => {
   
    try {
   

        const response = await fetch('/api/customer/getCustomerIds');
        const data = await response.json();

        setCustomers(data);

    } catch (err) {

      showSnackbar('Error loading customers', 'error');
    }
  }, []);

  const handleInputChange = (e) => {

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // add a customer to the attendance list
  const addCustomer = () => {

    const customerId = document.querySelector('[name="customerSelect"]').value;
    if (!customerId) return;

    const customer = customers.find(c => c.customerId === customerId);
    
    if (customer && !selectedCustomers.find(c => c.customerId === customerId)) {

      setSelectedCustomers(prev => [...prev, customer]);
    }
  };

  // remove a customer from the attendance list
  const removeCustomer = (customerId) => {
    setSelectedCustomers(prev => prev.filter(c => c.customerId !== customerId));
  };

  const clearForm = () => {
    setFormData({ classId: '' });
    setSelectedCustomers([]);
  };

  // record attendance for all selected customers
  const handleSave = async () => {

    try {

      if (!formData.classId || selectedCustomers.length === 0) {

        showSnackbar('Please select a class and at least one customer', 'warning');
        return;
      }

      const attendanceData = {
        classId: formData.classId,
        customerIds: selectedCustomers.map(c => c.customerId)
      };

      const response = await fetch('/api/attendance/recordAttendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });

      const result = await response.json();

      if (!response.ok) {

        throw new Error(result.message || 'Failed to record attendance');
      }

      // show results for  customers
      const successCount = result.successful?.length || 0;
      const errorCount = result.errors?.length || 0;

      if (successCount > 0) {

        showSnackbar(`Attendance recorded for ${successCount} customer(s)`, 'success');
      }

      if (errorCount > 0) {

        showSnackbar(`${errorCount} attendance record(s) had errors`, 'warning');
      }

      clearForm();

    } catch (err) {

      showSnackbar(`Error: ${err.message}`, 'error');
    }
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.container}>
          <Card>
            <div className={styles.header}>
              <h1 className={styles.title}>Record Class Attendance</h1>
            </div>

            <Select
              label="Select Class"
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Choose a class --</option>
              {classes.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.classId}: {cls.className}
                </option>
              ))}
            </Select>

            {/* add customers section */}
            <div className={styles.customerSection}>

              <h3>Add Customers Who Attended</h3>

              <div className={styles.customerSelector}>
                <Select name="customerSelect">
                  <option value="">-- Choose a customer --</option>
                  {customers
                    .filter(c => !selectedCustomers.find(sc => sc.customerId === c.customerId))
                    .map((customer) => (
                      <option key={customer.customerId} value={customer.customerId}>
                        {customer.customerId}: {customer.firstName} {customer.lastName}
                      </option>
                    ))}
                </Select>

                <Button variant="outlined" onClick={addCustomer}>Add Customer</Button>
              </div>

            </div>

            {/* selected customr list */}
            {selectedCustomers.length > 0 && (
              <div className={styles.selectedCustomers}>

                <h3>Customers Attending:</h3>

                <div className={styles.customerList}>
                  {selectedCustomers.map((customer) => (

                    <div key={customer.customerId} className={styles.customerItem}>

                      <span>{customer.customerId}: {customer.firstName} {customer.lastName}</span>
                      
                      <Button
                        variant="error"
                        size="small"
                        onClick={() => removeCustomer(customer.customerId)}
                      >
                        Remove
                      </Button>

                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actions}>

              <Button variant="primary" onClick={handleSave}>Record Attendance</Button>
              <Button variant="outlined" onClick={clearForm}>Clear</Button>

            </div>

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
}

export default Attendance;
