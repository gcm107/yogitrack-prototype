import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {Box, Container, Card, CardContent, Typography, TextField, Button, MenuItem, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Grid, Alert, Snackbar} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

function Class() {

  // setting states
  const [formMode, setFormMode] = useState('search');
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadInstructorDropdown();
    if (formMode === 'search') {
      loadClassDropdown();
    }
  }, [formMode]);

  const loadClassDropdown = async () => {
    try {
      const response = await fetch('/api/class/getAllClasses');
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      showSnackbar('Error loading classes', 'error');
    }
  };

  const loadInstructorDropdown = async () => {
    try {
      const response = await fetch('/api/instructor/getInstructorIds');
      const data = await response.json();
      setInstructors(data);
    } catch (err) {
      showSnackbar('Error loading instructors', 'error');
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  // search mode
  const setSearchMode = () => {
    setFormMode('search');
    clearForm();
    loadClassDropdown();
  };

  // add mode
  const setAddMode = () => {
    setFormMode('add');
    clearForm();
  };

  // clears the form
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

  // saves the class
  const handleSave = async () => {
    if (formMode === 'add') {
      try {
        if (!formData.className || !formData.instructorId || !formData.day || !formData.time) {
          showSnackbar('Please fill in all required fields', 'warning');
          return;
        }

        const conflictResult = await checkScheduleConflict(formData.day, formData.time, parseInt(formData.duration));
        if (conflictResult.hasConflict) {
          if (!window.confirm(`Schedule conflict detected: ${conflictResult.message}. Continue anyway?`)) {
            return;
          }
        }

        const idRes = await fetch('/api/class/getNextId');
        const { nextId } = await idRes.json();

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

        const addRes = await fetch('/api/class/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(classData),
        });

        const result = await addRes.json();
        if (!addRes.ok) {
          throw new Error(result.message || 'Failed to add class');
        }

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

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          backgroundColor: 'background.default',
          padding: 4,
        }}
      >
        <Container maxWidth="md">
          <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <CardContent sx={{ padding: 4 }}>
              {/* header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Class Schedule Details
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={formMode === 'search' ? 'contained' : 'outlined'}
                    startIcon={<SearchIcon />}
                    onClick={setSearchMode}
                  >
                    Search
                  </Button>
                  <Button
                    variant={formMode === 'add' ? 'contained' : 'outlined'}
                    startIcon={<AddIcon />}
                    onClick={setAddMode}
                  >
                    Add New
                  </Button>
                </Box>
              </Box>

              {/* class id dropdown or text */}
              {formMode === 'search' ? (
                <TextField
                  select
                  fullWidth
                  label="Class ID"
                  value={selectedClass?.classId || ''}
                  onChange={handleClassSelect}
                  sx={{ marginBottom: 3 }}
                >
                  <MenuItem value="">-- Choose a class to view --</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.classId} value={cls.classId}>
                      {cls.classId}: {cls.className}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField fullWidth label="Class ID" value="(Auto-generated on save)" disabled sx={{ marginBottom: 3 }} />
              )}

              {/* class name and instructor */}
              <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Class Name"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Instructor"
                    name="instructorId"
                    value={formData.instructorId}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">-- Choose an instructor --</MenuItem>
                    {instructors.map((instr) => (
                      <MenuItem key={instr.instructorId} value={instr.instructorId}>
                        {instr.instructorId}: {instr.firstName} {instr.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              {/* general or special class */}
              <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, marginBottom: 1 }}>
                  Class Type
                </FormLabel>
                <RadioGroup row name="classType" value={formData.classType} onChange={handleInputChange}>
                  <FormControlLabel value="General" control={<Radio />} label="General" />
                  <FormControlLabel value="Special" control={<Radio />} label="Special" />
                </RadioGroup>
              </FormControl>

              {/* description */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                sx={{ marginBottom: 3 }}
              />

              {/* day and time */}
              <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Day"
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">-- Choose a day --</MenuItem>
                    {days.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ marginBottom: 4 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    inputProps={{ min: 30, max: 120 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pay Rate ($)"
                    name="payRate"
                    type="number"
                    value={formData.payRate}
                    onChange={handleInputChange}
                    inputProps={{ min: 20, max: 100, step: 5 }}
                  />
                </Grid>
              </Grid>

              {/* action buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
                  Delete
                </Button>
                <Button variant="outlined" startIcon={<ClearIcon />} onClick={clearForm}>
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* notification popup */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Class;
