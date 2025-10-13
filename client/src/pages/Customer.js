// customer page - can add, edit, and delete customers
// 

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Snackbar from '../components/Snackbar';
import styles from './Customer.module.css';

function Customer() {
  // tracks if we're searching or adding customers
  const [formMode, setFormMode] = useState('search');

  // list of all customers to show in dropdown
  const [customers, setCustomers] = useState([]);

  // the currently selected customer details
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // for showing popup messages
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  // all the form fields for customer info
  const [formData, setFormData] = useState({
    customerId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    preferredContact: 'phone',
    senior: false
  });

  // when the page loads or mode changes, load the customer list
  useEffect(() => {

    if (formMode === 'search') {

      loadCustomerDropdown();
    }
  }, [formMode]);

  // function to load all customers from the database
  const loadCustomerDropdown = useCallback(async () => {

    try {

      const response = await fetch('/api/customer/getCustomerIds');
      const data = await response.json();
      setCustomers(data);

    } catch (err) {

      showSnackbar('Error loading customers', 'error');
    }
  }, []);

  // when someone picks a customer from the dropdown, load their details
  const handleCustomerSelect = async (e) => {

    const customerId = e.target.value;

    if (!customerId) {

      setSelectedCustomer(null);
      clearForm();
      return;
    }

    try {

      const response = await fetch(`/api/customer/getCustomer?customerId=${customerId}`);
      if (!response.ok) throw new Error('Customer search failed');

      const data = await response.json();

      if (!data || Object.keys(data).length === 0) {

        showSnackbar('No customer found', 'warning');
        return;
      }

      setSelectedCustomer(data);

      setFormData({
        customerId: data.customerId || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        preferredContact: data.preferredContact || 'phone',
        senior: data.senior || false
      });
      
    } catch (err) {
      showSnackbar(`Error searching customer: ${err.message}`, 'error');
    }
  };

  // update form fields when user types something
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle checkbox for senior status
  const handleSeniorChange = (e) => {
    setFormData((prev) => ({ ...prev, senior: e.target.checked }));
  };

  // switch to search mode (viewing existing customers)
  const setSearchMode = () => {
    setFormMode('search');
    clearForm();
    loadCustomerDropdown();
  };

  // switch to add mode (creating new customer)
  const setAddMode = () => {
    setFormMode('add');
    clearForm();
  };

  // reset all form fields to empty
  const clearForm = () => {
    setFormData({
      customerId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      preferredContact: 'phone',
      senior: false
    });
    setSelectedCustomer(null);
  };

  // save a new customer or update existing one
  const handleSave = async () => {
    if (formMode === 'add') {
      try {
        // make sure all important fields are filled in
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          showSnackbar('Please fill in all required fields', 'warning');
          return;
        }

        // check if a customer with this name already exists
        const checkRes = await fetch(
          `/api/customer/search?firstName=${formData.firstName}&lastName=${formData.lastName}`
        );
        if (checkRes.ok) {
          const existingData = await checkRes.json();
          if (
            existingData &&
            !window.confirm(`Customer "${formData.firstName} ${formData.lastName}" may already exist. Continue anyway?`)
          ) {
            return;
          }
        }

        // get the next available customer ID
        const idRes = await fetch('/api/customer/getNextId');
        const { nextId } = await idRes.json();

        // prepare the customer data to send to the server
        const customerData = {
          customerId: nextId,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          preferredContact: formData.preferredContact,
          senior: formData.senior
        };

        // send the new customer to the database
        const addRes = await fetch('/api/customer/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerData),
        });

        const result = await addRes.json();
        if (!addRes.ok) {
          throw new Error(result.message || 'Failed to add customer');
        }

        // show a success message
        showSnackbar(`Customer ${customerData.customerId} added successfully!`, 'success');
        setSearchMode();
      } catch (err) {
        showSnackbar(`Error: ${err.message}`, 'error');
      }
    }
  };

  // delete a customer from the database
  const handleDelete = async () => {
    if (!selectedCustomer) {
      showSnackbar('Please select a customer to delete', 'warning');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete customer ${selectedCustomer.customerId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/deleteCustomer?customerId=${selectedCustomer.customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Customer delete failed');
      }

      showSnackbar(`Customer ${selectedCustomer.customerId} successfully deleted`, 'success');
      setSearchMode();
    } catch (err) {
      showSnackbar(`Error deleting customer: ${err.message}`, 'error');
    }
  };

  // helper function to show popup messages
  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  // the actual page layout that users see
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.container}>
          <Card>
            {/* header with title and mode buttons */}
            <div className={styles.header}>
              <h1 className={styles.title}>Customer Details</h1>
              <div className={styles.modeButtons}>
                <Button variant={formMode === 'search' ? 'primary' : 'outlined'} onClick={setSearchMode}>
                  Search
                </Button>
                <Button variant={formMode === 'add' ? 'primary' : 'outlined'} onClick={setAddMode}>
                  Add New
                </Button>
              </div>
            </div>

            {/* shows select customer when in search mode */}
            {formMode === 'search' ? (
              <Select
                label="Customer ID"
                name="customerId"
                value={selectedCustomer?.customerId || ''}
                onChange={handleCustomerSelect}
              >
                <option value="">-- Choose a customer to view --</option>
                {customers.map((customer) => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.customerId}: {customer.firstName} {customer.lastName}
                  </option>
                ))}

              </Select>
            ) : (
              
              <Input label="Customer ID" value="Auto-generated on save" disabled />
            )}

            {/* name fields */}
            <div className={styles.formRow}>

              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* address field - big bc of multi line  */}
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              multiline
              rows={2}
            />

            {/* contact info fields in a row */}
            <div className={styles.formRow}>
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* radio buttons for prefered contact method */}

            <div className={styles.radioGroup}>

              <label className={styles.radioLabel}>
                Preferred Contact <span className={styles.required}>*</span>
              </label>

              <div className={styles.radioOptions}>

                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="preferredContact"
                    value="phone"
                    checked={formData.preferredContact === 'phone'}
                    onChange={handleInputChange}
                  />
                  <span>Phone</span>
                </label>

                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="preferredContact"
                    value="email"
                    checked={formData.preferredContact === 'email'}
                    onChange={handleInputChange}
                  />
                  <span>Email</span>
                </label>
              </div>
            </div>

            {/* senior citizen checkbox */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="senior"
                  checked={formData.senior}
                  onChange={handleSeniorChange}
                />
                Senior Citizen (eligible for senior discounts)
              </label>
            </div>

            {/* action buttons at the bottom */}
            <div className={styles.actions}>
              <Button variant="primary" onClick={handleSave}>Save</Button>
              <Button variant="error" onClick={handleDelete}>Delete</Button>
              <Button variant="outlined" onClick={clearForm}>Clear</Button>
            </div>
          </Card>
        </div>
      </main>

      {/* popup notification component */}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
}

export default Customer;
