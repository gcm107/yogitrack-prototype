// class page - oga class schedules and details. add new classes, edit existing ones, and handle scheduling

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import Snackbar from '../components/Snackbar';
import styles from './Class.module.css';

// all the days of the week for the schedule dropdown
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function Class() {

  // track if we're searching for a class or adding a new one
  const [formMode, setFormMode] = useState('search');

  // list of all classes to show in dropdown
  const [classes, setClasses] = useState([]);

  // list of all instructors for the instructor dropdown
  const [instructors, setInstructors] = useState([]);

  // the currently selected class 
  const [selectedClass, setSelectedClass] = useState(null);

  // for showing popup message notifs
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  // all the form fields for class info
  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    instructorId: '',
    classType: 'General',
    description: '',
    day: '',
    time: '',
    duration: 60,
    payRate: 45,
  });

  // load the data we need when the page loads or mode changes 
  useEffect(() => {
    loadInstructorDropdown();
    if (formMode === 'search') {
      loadClassDropdown();
    }
  }, [formMode]);

  // function to load all classes from the database
  const loadClassDropdown = useCallback(async () => {
    try {
      const response = await fetch('/api/class/getAllClasses');
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      showSnackbar('Error loading classes', 'error');
    }
  }, []);

  // function to load all instructors for the dropdown
  const loadInstructorDropdown = useCallback(async () => {
    try {
      const response = await fetch('/api/instructor/getInstructorIds');
      const data = await response.json();
      setInstructors(data);
    } catch (err) {
      showSnackbar('Error loading instructors', 'error');
    }
  }, []);

  // load  details about the class from the dropdown
  const handleClassSelect = async (e) => {
    const classId = e.target.value;
    if (!classId) {
      setSelectedClass(null);
      clearForm();
      return;
    }

    try {
      const response = await fetch(`/api/class/getClass?classId=${classId}`);
      if (!response.ok) throw new Error('Class search failed');

      const data = await response.json();
      if (!data || Object.keys(data).length === 0) {
        showSnackbar('No class found', 'warning');
        return;
      }

      setSelectedClass(data);
      setFormData({
        classId: data.classId || '',
        className: data.className || '',
        instructorId: data.instructorId || '',
        classType: data.classType || 'General',
        description: data.description || '',
        day: data.daytime && data.daytime.length > 0 ? data.daytime[0].day : '',
        time: data.daytime && data.daytime.length > 0 ? data.daytime[0].time : '',
        duration: data.daytime && data.daytime.length > 0 ? data.daytime[0].duration : 60,
        payRate: data.payRate || 45,
      });
    } catch (err) {
      showSnackbar(`Error searching class: ${err.message}`, 'error');
    }
  };

  // update form fields when user types something
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkScheduleConflict = async (day, time, duration) => {
    try {
      const response = await fetch('/api/class/getAllClasses');
      const allClasses = await response.json();

      const [hours, minutes] = time.split(':').map(Number);
      const startTime = hours * 60 + minutes;
      const endTime = startTime + duration;

      for (const existingClass of allClasses) {
        if (selectedClass && existingClass.classId === selectedClass.classId) {
          continue;
        }

        if (existingClass.daytime && existingClass.daytime.length > 0) {
          const schedule = existingClass.daytime[0];
          if (schedule.day === day) {
            const [existingHours, existingMinutes] = schedule.time.split(':').map(Number);
            const existingStart = existingHours * 60 + existingMinutes;
            const existingEnd = existingStart + (schedule.duration || 60);

            if (startTime < existingEnd && endTime > existingStart) {
              return {
                hasConflict: true,
                message: `Conflicts with ${existingClass.className} (${schedule.day} ${schedule.time})`,
              };
            }
          }
        }
      }

      return { hasConflict: false };
    } catch (err) {
      return { hasConflict: false };
    }
  };

  // switch to search mode -- viewing existing classes
  const setSearchMode = () => {
    setFormMode('search');
    clearForm();
    loadClassDropdown();
  };

  // switch to add mode -- adding a class
  const setAddMode = () => {
    setFormMode('add');
    clearForm();
  };

  // reset all form fields to empty
  const clearForm = () => {
    setFormData({
      classId: '',
      className: '',
      instructorId: '',
      classType: 'General',
      description: '',
      day: '',
      time: '',
      duration: 60,
      payRate: 45,
    });
    setSelectedClass(null);
  };

  // save a new class or update existing one
  const handleSave = async () => {
    if (formMode === 'add') {
      try {


        // make sure all important fields are filled in
        if (!formData.className || !formData.instructorId || !formData.day || !formData.time) {
          showSnackbar('Please fill in all required fields', 'warning');
          return;
        }

        // check if this class time conflicts with existing classes
        const conflictResult = await checkScheduleConflict(formData.day, formData.time, parseInt(formData.duration));
        if (conflictResult.hasConflict) {
          if (!window.confirm(`Schedule conflict detected: ${conflictResult.message}. Continue anyway?`)) {
            return;
          }
        }

        // get the next available class ID
        const idRes = await fetch('/api/class/getNextId');
        const { nextId } = await idRes.json();

        // prepare the data about to be sent
        const classData = {
          classId: nextId,
          className: formData.className.trim(),
          instructorId: formData.instructorId.trim(),
          classType: formData.classType,
          description: formData.description.trim(),
          daytime: [
            {
              day: formData.day,
              time: formData.time,
              duration: parseInt(formData.duration) || 60,
            },
          ],
          payRate: parseFloat(formData.payRate) || 45,
        };

        // send the new class to the database
        const addRes = await fetch('/api/class/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(classData),
        });

        const result = await addRes.json();
        if (!addRes.ok) {
          throw new Error(result.message || 'Failed to add class');
        }

        // show a success message/notif
        showSnackbar(`Class ${classData.classId} added successfully!`, 'success');
        setSearchMode();
      } catch (err) {
        showSnackbar(`Error: ${err.message}`, 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) {
      showSnackbar('Please select a class to delete', 'warning');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete class ${selectedClass.classId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/class/deleteClass?classId=${selectedClass.classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Class delete failed');
      }

      showSnackbar(`Class ${selectedClass.classId} successfully deleted`, 'success');
      setSearchMode();
    } catch (err) {
      showSnackbar(`Error deleting class: ${err.message}`, 'error');
    }
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  // the actual page layout that is seen
  return (

    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.container}>
          <Card>


            {/* header with title and mode buttons */}
            <div className={styles.header}>
              <h1 className={styles.title}>Class Schedule Details</h1>
              <div className={styles.modeButtons}>
                <Button variant={formMode === 'search' ? 'primary' : 'outlined'} onClick={setSearchMode}>
                  Search
                </Button>


                <Button variant={formMode === 'add' ? 'primary' : 'outlined'} onClick={setAddMode}>
                  Add New
                </Button>
              </div>
            </div>

            {/* dropdown to select class */}
            {formMode === 'search' ? (
              <Select
                label="Class ID"
                name="classId"
                value={selectedClass?.classId || ''}
                onChange={handleClassSelect}
              >
                <option value="">-- Choose a class to view --</option>
                {classes.map((cls) => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.classId}: {cls.className}
                  </option>
                ))}
              </Select>
            ) : (
              <Input label="Class ID" value="Auto-generated on save" disabled />
            )}

            {/* class name and instructor fields in a row */}
            <div className={styles.formRow}>

              <Input
                label="Class Name"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                required
              />

              <Select
                label="Instructor"
                name="instructorId"
                value={formData.instructorId}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Choose an instructor --</option>
                {instructors.map((instr) => (
                  <option key={instr.instructorId} value={instr.instructorId}>
                    {instr.instructorId}: {instr.firstName} {instr.lastName}
                  </option>
                ))}
              </Select>

            </div>

            {/* radio buttons for class type */}
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>Class Type</label>
              <div className={styles.radioOptions}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="classType"
                    value="General"
                    checked={formData.classType === 'General'}
                    onChange={handleInputChange}
                  />
                  <span>General</span>
                </label>


                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="classType"
                    value="Special"
                    checked={formData.classType === 'Special'}
                    onChange={handleInputChange}
                  />
                  <span>Special</span>
                </label>
              </div>
            </div>

            {/* description area for the class */}
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
                label="Day"
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Choose a day --</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </Select>
              <Input
                label="Time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* duration and pay rate */}
            <div className={styles.formRow}>
              <Input
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
              />
              <Input
                label="Pay Rate ($)"
                name="payRate"
                type="number"
                value={formData.payRate}
                onChange={handleInputChange}
              />
            </div>

            {/* action buttons */}
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

export default Class;
