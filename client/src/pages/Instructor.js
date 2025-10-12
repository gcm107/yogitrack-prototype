// instructor page
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Snackbar from '../components/Snackbar';
import styles from './Instructor.module.css';

// instructor functin logic
function Instructor() {
  const [formMode, setFormMode] = useState('search');
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  // form fields
  const [formData, setFormData] = useState({
    instructorId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    preferredContact: 'phone',
  });

  // load instructors when teh page loads
  useEffect(() => {
    if (formMode === 'search') {
      loadInstructorDropdown();
    }
  }, [formMode]);

  // load instructors when the page loads
  const loadInstructorDropdown = useCallback(async () => {
    try {
      const response = await fetch('/api/instructor/getInstructorIds');
      const data = await response.json();
      setInstructors(data);
    } catch (err) {
      showSnackbar('Error loading instructors', 'error');
    }
  }, []);

  const handleInstructorSelect = async (e) => {
    const instructorId = e.target.value;
    if (!instructorId) {
      setSelectedInstructor(null);
      clearForm();
      return;
    }

    try {
      const response = await fetch(`/api/instructor/getInstructor?instructorId=${instructorId}`);
      if (!response.ok) throw new Error('Instructor search failed');

      const data = await response.json();
      if (!data || Object.keys(data).length === 0) {
        showSnackbar('No instructor found', 'warning');
        return;
      }

      setSelectedInstructor(data);
      setFormData({
        instructorId: data.instructorId || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        preferredContact: data.preferredContact || 'phone',
      });
    } catch (err) {
      showSnackbar(`Error searching instructor: ${err.message}`, 'error');
    }
  };

  // handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // set search mode
  const setSearchMode = () => {
    setFormMode('search');
    clearForm();
    loadInstructorDropdown();
  };

  // set add mode
  const setAddMode = () => {
    setFormMode('add');
    clearForm();
  };

  // clear form
  const clearForm = () => {
    setFormData({
      instructorId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      preferredContact: 'phone',
    });
    setSelectedInstructor(null);
  };

  const handleSave = async () => {
    if (formMode === 'add') {
      try {
        // check if all required fields are filled
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          showSnackbar('Please fill in all required fields', 'warning');
          return;
        }

        // check if instructor already exists
        const checkRes = await fetch(
          `/api/instructor/search?firstName=${formData.firstName}&lastName=${formData.lastName}`
        );
        if (checkRes.ok) {
          const existingData = await checkRes.json();
          if (
            existingData &&
            !window.confirm(`Instructor "${formData.firstName} ${formData.lastName}" may already exist. Continue anyway?`)
          ) {
            return;
          }
        }

        const idRes = await fetch('/api/instructor/getNextId');
        const { nextId } = await idRes.json();

        // add instructor data
        const instructorData = {
          instructorId: nextId,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          preferredContact: formData.preferredContact,
        };

        const addRes = await fetch('/api/instructor/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(instructorData),
        });

        const result = await addRes.json();
        if (!addRes.ok) {
          throw new Error(result.message || 'Failed to add instructor');
        }

        // show success message
        showSnackbar(`Instructor ${instructorData.instructorId} added successfully!`, 'success');
        setSearchMode();
      } catch (err) {
        showSnackbar(`Error: ${err.message}`, 'error');
      }
    }
  };

  // handle delete instructor
  const handleDelete = async () => {
    if (!selectedInstructor) {
      showSnackbar('Please select an instructor to delete', 'warning');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete instructor ${selectedInstructor.instructorId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/instructor/deleteInstructor?instructorId=${selectedInstructor.instructorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Instructor delete failed');
      }

      showSnackbar(`Instructor ${selectedInstructor.instructorId} successfully deleted`, 'success');
      setSearchMode();
    } catch (err) {
      showSnackbar(`Error deleting instructor: ${err.message}`, 'error');
    }
  };

  // show snackbar
  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  //return the page
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.container}>
          <Card>
            <div className={styles.header}>
              <h1 className={styles.title}>Instructor Details</h1>
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
                label="Instructor ID"
                name="instructorId"
                value={selectedInstructor?.instructorId || ''}
                onChange={handleInstructorSelect}
              >
                <option value="">-- Choose an instructor to view --</option>
                {instructors.map((instr) => (
                  <option key={instr.instructorId} value={instr.instructorId}>
                    {instr.instructorId}: {instr.firstName} {instr.lastName}
                  </option>
                ))}
              </Select>
            ) : (
              <Input label="Instructor ID" value="(Auto-generated on save)" disabled />
            )}

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

            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              multiline
              rows={2}
            />

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

export default Instructor;
