import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

function Class() {
  const [formMode, setFormMode] = useState('search');
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // form state
  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    instructorId: '',
    classType: 'General',
    description: '',
    day: '',
    time: '',
    duration: 60,
    payRate: 45
  });

  // load dropdowns on component mount
  useEffect(() => {
    loadInstructorDropdown();
    if (formMode === 'search') {
      loadClassDropdown();
    }
  }, [formMode]);

  // fetch all of the  classes for dropdown
  const loadClassDropdown = async () => {
    try {
      const response = await fetch('/api/class/getAllClasses');
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
      alert('Error loading classes: ' + err.message);
    }
  };

  // fetch all the instructors for dropdown
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

  // handle class selection from dropdown
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
        alert('No class found');
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
        payRate: data.payRate || 45
      });
    } catch (err) {
      alert(`Error searching class: ${classId} - ${err.message}`);
    }
  };

  // handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // handle radio button change for class type
  const handleClassTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      classType: e.target.value
    }));
  };

  // checking for schedule conflicts
  const checkScheduleConflict = async (day, time, duration) => {
    try {
      const response = await fetch('/api/class/getAllClasses');
      const allClasses = await response.json();
      
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = hours * 60 + minutes;
      const endTime = startTime + duration;
      
      for (const existingClass of allClasses) {
        // Skip checking against itself when editing
        if (selectedClass && existingClass.classId === selectedClass.classId) {
          continue;
        }
        
        if (existingClass.daytime && existingClass.daytime.length > 0) {
          const schedule = existingClass.daytime[0];
          if (schedule.day === day) {
            const [existingHours, existingMinutes] = schedule.time.split(':').map(Number);
            const existingStart = existingHours * 60 + existingMinutes;
            const existingEnd = existingStart + (schedule.duration || 60);
            
            if ((startTime < existingEnd) && (endTime > existingStart)) {
              return {
                hasConflict: true,
                message: `Conflicts with ${existingClass.className} (${schedule.day} ${schedule.time})`
              };
            }
          }
        }
      }
      
      return { hasConflict: false };
    } catch (err) {
      console.error('Error checking schedule conflict:', err);
      return { hasConflict: false };
    }
  };

  // qwitch to search mode
  const setSearchMode = () => {
    setFormMode('search');
    clearForm();
    loadClassDropdown();
  };

  // switch to add mode
  const setAddMode = () => {
    setFormMode('add');
    clearForm();
  };

  // clear form
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
      payRate: 45
    });
    setSelectedClass(null);
  };

  // ave class
  const handleSave = async () => {
    if (formMode === 'add') {
      try {
        // validation - check required fields
        if (!formData.className || !formData.instructorId || !formData.day || !formData.time) {
          alert('Please fill in all required fields: Class Name, Instructor, Day, Time');
          return;
        }

        // vheck for schedule conflicts
        const conflictResult = await checkScheduleConflict(formData.day, formData.time, parseInt(formData.duration));
        if (conflictResult.hasConflict) {
          if (!window.confirm(`Schedule conflict detected: ${conflictResult.message}. Continue anyway?`)) {
            return;
          }
        }

        // get next class ID
        const idRes = await fetch('/api/class/getNextId');
        const { nextId } = await idRes.json();

        const classData = {
          classId: nextId,
          className: formData.className.trim(),
          instructorId: formData.instructorId.trim(),
          classType: formData.classType,
          description: formData.description.trim(),
          daytime: [{
            day: formData.day,
            time: formData.time,
            duration: parseInt(formData.duration) || 60
          }],
          payRate: parseFloat(formData.payRate) || 45
        };

        console.log('Class data:', classData);

        const addRes = await fetch('/api/class/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(classData)
        });

        const result = await addRes.json();
        if (!addRes.ok) {
          throw new Error(result.message || 'Failed to add class');
        }

        alert(`Class ${classData.classId} added successfully! New class "${classData.className}" scheduled.`);
        setSearchMode();
      } catch (err) {
        console.error('Error in save operation:', err);
        alert('Error: ' + err.message);
      }
    }
  };

  // felete class
  const handleDelete = async () => {
    if (!selectedClass) {
      alert('Please select a class to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete class ${selectedClass.classId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/class/deleteClass?classId=${selectedClass.classId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Class delete failed');
      }

      alert(`Class ${selectedClass.classId} successfully deleted`);
      setSearchMode();
    } catch (err) {
      alert('Error deleting class: ' + err.message);
    }
  };

  return (
    <div className="layout--sidebar">
      <Sidebar />
      <main className="layout--center">
        <form className="card card--class" onSubmit={(e) => e.preventDefault()}>
          <div className="form-header">
            <h2>Class Schedule Details</h2>
            <div className="top-actions">
              <button type="button" className="btn" onClick={setSearchMode}>Search</button>
              <button type="button" className="btn btn--primary" onClick={setAddMode}>Add New</button>
            </div>
          </div>

          {/* class id dropdown in seach */}
          {formMode === 'search' && (
            <label htmlFor="classIdSelect">Class ID
              <select 
                name="classId" 
                id="classIdSelect" 
                className="form-input"
                onChange={handleClassSelect}
                value={selectedClass?.classId || ''}
              >
                <option value="">-- Choose a class to view --</option>
                {classes.map((cls) => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.classId}: {cls.className}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* class id for add */}
          {formMode === 'add' && (
            <label>Class ID
              <input 
                type="text" 
                value="(Auto-generated on save)" 
                readOnly 
                style={{ background: '#f5f5f5' }}
              />
            </label>
          )}

          {/* class name and instructor */}
          <div className="grid-2">
            <label>Class Name
              <input 
                type="text" 
                name="className" 
                value={formData.className}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>Instructor
              <select 
                name="instructorId" 
                id="instructorIdSelect" 
                className="form-input"
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
              </select>
            </label>
          </div>

          {/* class type */}
          <fieldset>
            <legend>Class Type</legend>
            <div className="radio-row">
              <label>
                <input 
                  type="radio" 
                  name="classType" 
                  value="General"
                  checked={formData.classType === 'General'}
                  onChange={handleClassTypeChange}
                  required
                />
                General
              </label>
              <label>
                <input 
                  type="radio" 
                  name="classType" 
                  value="Special"
                  checked={formData.classType === 'Special'}
                  onChange={handleClassTypeChange}
                  required
                />
                Special
              </label>
            </div>
          </fieldset>

          {/* description */}
          <label>Description
            <textarea 
              name="description" 
              rows="2"
              value={formData.description}
              onChange={handleInputChange}
            />
          </label>

          {/* chedule details */}
          <div className="grid-2">
            <label>Day
              <select 
                name="day" 
                className="form-input"
                value={formData.day}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Choose a day --</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </label>
            <label>Time
              <input 
                type="time" 
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          <div className="grid-2">
            <label>Duration (minutes)
              <input 
                type="number" 
                name="duration"
                min="30"
                max="120"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </label>
            <label>Pay Rate ($)
              <input 
                type="number" 
                name="payRate"
                min="20"
                max="100"
                step="5"
                value={formData.payRate}
                onChange={handleInputChange}
              />
            </label>
          </div>

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

export default Class;
