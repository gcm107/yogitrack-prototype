// package page - can add, edit, and delete packages
// 


import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Snackbar from '../components/Snackbar';
import styles from './Package.module.css';

function Package() {
  
  const [formMode, setFormMode] = useState('search');
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    packageId: '',
    packageName: '',
    description: '',
    packageCategory: 'General',
    numberOfClasses: '1',
    classType: 'General',
    price: ''
  });

  useEffect(() => {
    if (formMode === 'search') {
      loadPackageDropdown();
    }
  }, [formMode]);

  const loadPackageDropdown = useCallback(async () => {
    try {
      const response = await fetch('/api/package/getPackageIds');
      const data = await response.json();
      setPackages(data);
    } catch (err) {
      showSnackbar('Error loading packages', 'error');
    }
  }, []);

  const handlePackageSelect = async (e) => {
    const packageId = e.target.value;
    if (!packageId) {
      setSelectedPackage(null);
      clearForm();
      return;
    }

    try {
      const response = await fetch(`/api/package/getPackage?packageId=${packageId}`);

      if (!response.ok) throw new Error('Package search failed');


      const data = await response.json();
      if (!data || Object.keys(data).length === 0) {
        showSnackbar('No package found', 'warning');
        return;
      }

      setSelectedPackage(data);

      setFormData({
        packageId: data.packageId || '',
        packageName: data.packageName || '',
        description: data.description || '',
        packageCategory: data.packageCategory || 'General',
        numberOfClasses: data.numberOfClasses || '1',
        classType: data.classType || 'General',
        price: data.price || ''
      });
    } catch (err) {
      showSnackbar(`Error searching package: ${err.message}`, 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setSearchMode = () => {
    setFormMode('search');
    clearForm();
    loadPackageDropdown();
  };

  const setAddMode = () => {
    setFormMode('add');
    clearForm();
  };

  const clearForm = () => {
    setFormData({
      packageId: '',
      packageName: '',
      description: '',
      packageCategory: 'General',
      numberOfClasses: '1',
      classType: 'General',
      price: ''
    });
    setSelectedPackage(null);
  };

  const handleSave = async () => {
    if (formMode === 'add') {
      try {
        if (!formData.packageName || !formData.price) {
          showSnackbar('Please fill in all required fields', 'warning');
          return;
        }

        const checkRes = await fetch(
          `/api/package/search?packageName=${formData.packageName}`
        );
        if (checkRes.ok) {
          const existingData = await checkRes.json();
          if (
            existingData &&
            !window.confirm(`Package "${formData.packageName}" may already exist. Continue anyway?`)
          ) {
            return;
          }
        }

        const idRes = await fetch('/api/package/getNextId');
        const { nextId } = await idRes.json();

        const packageData = {
          packageId: nextId,
          packageName: formData.packageName.trim(),
          description: formData.description.trim(),
          packageCategory: formData.packageCategory,
          numberOfClasses: formData.numberOfClasses,
          classType: formData.classType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          price: parseFloat(formData.price)
        };

        const addRes = await fetch('/api/package/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(packageData),
        });

        const result = await addRes.json();
        if (!addRes.ok) {
          throw new Error(result.message || 'Failed to add package');
        }

        showSnackbar(`Package ${packageData.packageId} added successfully!`, 'success');
        setSearchMode();
      } catch (err) {
        showSnackbar(`Error: ${err.message}`, 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedPackage) {
      showSnackbar('Please select a package to delete', 'warning');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete package ${selectedPackage.packageId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/package/deletePackage?packageId=${selectedPackage.packageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Package delete failed');
      }

      showSnackbar(`Package ${selectedPackage.packageId} successfully deleted`, 'success');
      setSearchMode();
    } catch (err) {
      showSnackbar(`Error deleting package: ${err.message}`, 'error');
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
              <h1 className={styles.title}>Package Details</h1>
              <div className={styles.modeButtons}>
                <Button variant={formMode === 'search' ? 'primary' : 'outlined'} onClick={setSearchMode}>
                  Search
                </Button>
                <Button variant={formMode === 'add' ? 'primary' : 'outlined'} onClick={setAddMode}>
                  Add New
                </Button>
              </div>
            </div>

            {formMode === 'search' ? (
              <Select
                label="Package ID"
                name="packageId"
                value={selectedPackage?.packageId || ''}
                onChange={handlePackageSelect}
              >
                <option value="">-- Choose a package to view --</option>
                {packages.map((pkg) => (
                  <option key={pkg.packageId} value={pkg.packageId}>
                    {pkg.packageId}: {pkg.packageName}
                  </option>
                ))}
              </Select>
            ) : (
              <Input label="Package ID" value="Auto-generated on save" disabled />
            )}

            <Input
              label="Package Name"
              name="packageName"
              value={formData.packageName}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
            />

            <div className={styles.formRow}>
              <Select
                label="Package Category"
                name="packageCategory"
                value={formData.packageCategory}
                onChange={handleInputChange}
                required
              >
                <option value="General">General</option>
                <option value="Senior">Senior</option>
              </Select>

              <Select
                label="Number of Classes"
                name="numberOfClasses"
                value={formData.numberOfClasses}
                onChange={handleInputChange}
                required
              >
                <option value="1">1</option>
                <option value="4">4</option>
                <option value="10">10</option>
                <option value="unlimited">Unlimited</option>
              </Select>
            </div>

            <div className={styles.formRow}>
              <Select
                label="Class Type"
                name="classType"
                value={formData.classType}
                onChange={handleInputChange}
                required
              >
                <option value="General">General</option>
                <option value="Special">Special</option>
              </Select>

              <Input
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.actions}>
              <Button variant="primary" onClick={handleSave}>Save</Button>
              <Button variant="error" onClick={handleDelete}>Delete</Button>
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

export default Package;
