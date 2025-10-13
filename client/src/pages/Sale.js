// sale page - record package sales to customers
// when someone buys a package, their class balance goes up

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Snackbar from '../components/Snackbar';
import styles from './Sale.module.css';

// sale component
function Sale() {
  const [customers, setCustomers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    saleId: '',
    customerId: '',
    packageId: '',
    amountPaid: '',
    modeOfPayment: 'Cash'
  });

  useEffect(() => {
    loadCustomers();
    loadPackages();
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

  const loadPackages = useCallback(async () => {

    try {

      const response = await fetch('/api/package/getPackageIds');
      const data = await response.json();
      setPackages(data);

    } catch (err) {
      showSnackbar('Error loading packages', 'error');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setFormData({
      saleId: '',
      customerId: '',
      packageId: '',
      amountPaid: '',
      modeOfPayment: 'Cash'
    });
  };

  const handleSave = async () => {

    try {

      if (!formData.customerId || !formData.packageId || !formData.amountPaid) {

        showSnackbar('Please fill in all required fields', 'warning');
        return;

      }

      const saleData = {
        customerId: formData.customerId,
        packageId: formData.packageId,
        amountPaid: formData.amountPaid,
        modeOfPayment: formData.modeOfPayment
      };

      const response = await fetch('/api/sale/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (!response.ok) {

        throw new Error(result.message || 'Failed to record sale');
      }

      showSnackbar(result.message, 'success');
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
              <h1 className={styles.title}>Record Sale</h1>
            </div>

            <Input label="Sale ID" value="Auto-generated on save" disabled />

            <Select
              label="Customer"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Choose a customer --</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.customerId}: {customer.firstName} {customer.lastName}
                </option>
              ))}
            </Select>

            <Select
              label="Package"
              name="packageId"
              value={formData.packageId}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Choose a package --</option>
              {packages.map((pkg) => (
                <option key={pkg.packageId} value={pkg.packageId}>
                  {pkg.packageId}: {pkg.packageName}
                </option>
              ))}
            </Select>

            <div className={styles.formRow}>
              <Input
                label="Amount Paid ($)"
                name="amountPaid"
                type="number"
                value={formData.amountPaid}
                onChange={handleInputChange}
                required
              />

              <Select
                label="Payment Method"
                name="modeOfPayment"
                value={formData.modeOfPayment}
                onChange={handleInputChange}
                required
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Check">Check</option>
                <option value="Online">Online</option>
              </Select>
            </div>

            <div className={styles.actions}>
              <Button variant="primary" onClick={handleSave}>Record Sale</Button>
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

export default Sale;
