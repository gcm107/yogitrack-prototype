# YOGITRACK PROTOTYPE

Simple yoga studio management app

## PART 1: CORE FUNCTIONALITY

### USE CASE 1: ADD INSTRUCTOR - COMPLETED

**Description:** Manager adds new instructor to the MongoDB collection

**Requirements Implemented:**
- Manager can add new instructor and their information (Name, email, phone, address, preferred contact method)
- Yogitrack checks for duplicate instructor names before adding
- Yogitrack validates to make sure required fields are filled out before saving
- Yogitrack generates a unique ID is assigned to the instructor when saved
- Yogitrack displays a message and the instructor id
- Yogitrack adds the new Instructor to the dropdown of instructors

___
_**Status:**_ Working

---

### USE CASE 2: ADD CLASS - COMPLETED

**Description:** The manager adds a new class to the schedule with the following data:
- **Actor:** Manager
- **Description:** The manager adds a new class to the schedule with the following data:
  - Instructor Id
  - Day, time
  - Class type (General or Special)
    - A General class is open to any customer with a package of 'General' classes
    - A Special series of classes needs a package with 'Special' class type, e.g. 'Yoga with weights'
  - Pay rate


**Requirements Implemented:**
- Manager can create new class with instructor assignment, schedule, and class details
- Yogitrack checks for schedule conflicts and prevents double-booking of time slots
- Yogitrack generates unique class IDs with "A" prefix (A001, A002, A003...)
- Yogitrack validates all required fields before saving
- Yogitrack confirms successful class creation with message

**Files Created:** (used the provided instructor files as reference for these new files)
- `public/htmls/class.html` - class form interface
- `public/js/class.js` - form logic with conflict detection (used the instructor.js as reference)
- `controllers/classController.cjs` - class management and conflict checking
- `routes/classRoutes.cjs` - class API endpoints
- `models/classModel.cjs` - class database schema

___
_**Status:**_ Working

---

## PART 2: USE CASES

- Customer management - implemented (add customer)
- Package management 
- Attendance tracking
- Payment processing
- Report Generation
