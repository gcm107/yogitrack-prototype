import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

// new instructor page using react
function Instructor() {
  const [formMode, setFormMode] = useState('search');
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  
  // form state
  const [formData, setFormData] = useState({
    instructorId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    preferredContact: 'phone'
  });

  // load instructor dropdown
  useEffect(() => {
    if (formMode === 'search') {
      loadInstructorDropdown();
    }
  }, [formMode]);

  // fetch  instructors for dropdown
  const loadInstructorDropdown = async () => {
    try {
      const response = await fetch('/api/instructor/getInstructorIds');
      const data = await response.json();
      setInstructors(data);
    } catch (err) {
      console.error('Failed to load instructors:', err);
      alert('Error loading instructors: ' + err.message);
    }
  };

  // handle instructor select from dropdown
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
        alert('No instructor found');
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
        preferredContact: data.preferredContact || 'phone'
      });
    } catch (err) {
      alert(`Error searching instructor: ${instructorId} - ${err.message}`);
    }
  };

  // handling form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // handling radio button change
  const handleRadioChange = (e) => {
    setFormData(prev => ({
      ...prev,
      preferredContact: e.target.value
    }));
  };

  // switch to search mode
  const setSearchMode = () => {
    setFormMode('search');
    clearForm();
    loadInstructorDropdown();
  };

  // switch to add mode
  const setAddMode = () => {
    setFormMode('add');
    clearForm();
  };

  // clear the form
  const clearForm = () => {
    setFormData({
      instructorId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      preferredContact: 'phone'
    });
    setSelectedInstructor(null);
  };

  //  save instructor
  const handleSave = async () => {
    if (formMode === 'add') {
      try {
        // validation - check required fields
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          alert('Please fill in all required fields: First Name, Last Name, Email, Phone');
          return;
        }

        // check if instructor name already exists
        const checkRes = await fetch(`/api/instructor/search?firstName=${formData.firstName}&lastName=${formData.lastName}`);
        if (checkRes.ok) {
          const existingData = await checkRes.json();
          if (existingData && !window.confirm(`Instructor "${formData.firstName} ${formData.lastName}" may already exist. Continue anyway?`)) {
            return;
          }
        }

        // get the next instructor ID
        const idRes = await fetch('/api/instructor/getNextId');
        const { nextId } = await idRes.json();

        const instructorData = {
          instructorId: nextId,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          preferredContact: formData.preferredContact
        };

        console.log('Instructor data:', instructorData);

        const addRes = await fetch('/api/instructor/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(instructorData)
        });

        const result = await addRes.json();
        if (!addRes.ok) {
          throw new Error(result.message || 'Failed to add instructor');
        }

        alert(`Instructor ${instructorData.instructorId} added successfully!`);
        setSearchMode();
      } catch (err) {
        console.error('Error in save operation:', err);
        alert('Error: ' + err.message);
      }
    }
  };

  // felete instructor
  const handleDelete = async () => {
    if (!selectedInstructor) {
      alert('Please select an instructor to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete instructor ${selectedInstructor.instructorId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/instructor/deleteInstructor?instructorId=${selectedInstructor.instructorId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Instructor delete failed');
      }

      alert(`Instructor with id ${selectedInstructor.instructorId} successfully deleted`);
      setSearchMode();
    } catch (err) {
      alert('Error deleting instructor: ' + err.message);
    }
  };

  return (
    <div className="layout--sidebar">
      <Sidebar />
      <main className="layout--center">
        <form className="card" onSubmit={(e) => e.preventDefault()}>
          <div className="form-header">
            <h2>Instructor Details</h2>
            <div className="top-actions">
              <button type="button" className="btn" onClick={setSearchMode}>Search</button>
              <button type="button" className="btn btn--primary" onClick={setAddMode}>Add New</button>
            </div>
          </div>

          {/* instructor ID dropdown for seach */}
          {formMode === 'search' && (
            <label htmlFor="instructorIdSelect">Instructor ID
              <select 
                name="instructorId" 
                id="instructorIdSelect" 
                className="form-input"
                onChange={handleInstructorSelect}
                value={selectedInstructor?.instructorId || ''}
              >
                <option value="">-- Choose an instructor to view --</option>
                {instructors.map((instr) => (
                  <option key={instr.instructorId} value={instr.instructorId}>
                    {instr.instructorId}: {instr.firstName} {instr.lastName}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* instructor ID text for add */}
          {formMode === 'add' && (
            <label>Instructor ID
              <input 
                type="text" 
                value="(Auto-generated on save)" 
                readOnly 
                style={{ background: '#f5f5f5' }}
              />
            </label>
          )}

          {/* name fields */}
          <div className="grid-2">
            <label>First Name
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>Last Name
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          {/* address */}
          <label>Address
            <textarea 
              name="address" 
              rows="2"
              value={formData.address}
              onChange={handleInputChange}
            />
          </label>

          {/* phone and email */}
          <div className="grid-2">
            <label>Phone
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>Email
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          {/* preferred contact */}
          <fieldset>
            <legend>Preferred Contact</legend>
            <div className="radio-row">
              <label>
                <input 
                  type="radio" 
                  name="preferredContact" 
                  value="phone"
                  checked={formData.preferredContact === 'phone'}
                  onChange={handleRadioChange}
                />
                Phone
              </label>
              <label>
                <input 
                  type="radio" 
                  name="preferredContact" 
                  value="email"
                  checked={formData.preferredContact === 'email'}
                  onChange={handleRadioChange}
                />
                Email
              </label>
            </div>
          </fieldset>

          {/* action buttons */}
          <div className="btn-row">
            <button type="button" className="btn" onClick={handleSave}>Save</button>
            <button type="button" className="btn btn--danger" onClick={handleDelete}>Delete</button>
            <button type="button" className="btn" onClick={clearForm}>Clear</button>
            <Link to="/dashboard" className="btn">Exit</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Instructor;
