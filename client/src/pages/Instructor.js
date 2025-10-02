import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

function Instructor() {
  const [formMode, setFormMode] = useState('search');
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  // load instructors when page loads
  useEffect(() => {
    if (formMode === 'search') {
      loadInstructorDropdown();
    }
  }, [formMode]);

  const loadInstructorDropdown = async () => {
    try {
      const response = await fetch('/api/instructor/getInstructorIds');
      const data = await response.json();
      setInstructors(data);
    } catch (err) {
      showSnackbar('Error loading instructors', 'error');
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setSearchMode = () => {
    setFormMode('search');
    clearForm();
    loadInstructorDropdown();
  };

  const setAddMode = () => {
    setFormMode('add');
    clearForm();
  };

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
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          showSnackbar('Please fill in all required fields', 'warning');
          return;
        }

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

        showSnackbar(`Instructor ${instructorData.instructorId} added successfully!`, 'success');
        setSearchMode();
      } catch (err) {
        showSnackbar(`Error: ${err.message}`, 'error');
      }
    }
  };

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
                  Instructor Details
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

              {/* instructor id dropdown or text */}
              {formMode === 'search' ? (
                <TextField
                  select
                  fullWidth
                  label="Instructor ID"
                  value={selectedInstructor?.instructorId || ''}
                  onChange={handleInstructorSelect}
                  sx={{ marginBottom: 3 }}
                >
                  <MenuItem value="">-- Choose an instructor to view --</MenuItem>
                  {instructors.map((instr) => (
                    <MenuItem key={instr.instructorId} value={instr.instructorId}>
                      {instr.instructorId}: {instr.firstName} {instr.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  label="Instructor ID"
                  value="(Auto-generated on save)"
                  disabled
                  sx={{ marginBottom: 3 }}
                />
              )}

              {/* name inputs */}
              <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>

              {/* address */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                sx={{ marginBottom: 3 }}
              />

              {/* contact info */}
              <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>

              {/* preferred contact method */}
              <FormControl component="fieldset" sx={{ marginBottom: 4 }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, marginBottom: 1 }}>
                  Preferred Contact
                </FormLabel>
                <RadioGroup
                  row
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleInputChange}
                >
                  <FormControlLabel value="phone" control={<Radio />} label="Phone" />
                  <FormControlLabel value="email" control={<Radio />} label="Email" />
                </RadioGroup>
              </FormControl>

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

export default Instructor;
