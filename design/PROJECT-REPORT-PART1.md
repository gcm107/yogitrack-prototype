# **Cale McDowell**

___

# YOGITRACK PROJECT REPORT - PART 1

**Course:** ACS-5423-999 Software Development for Web  
**Application:** YogiTrack - Yoga Studio Management System for Yoga H'om

**Application URL:** [Yogitrack-Prototype App](https://yogitrack-proto-d9cd07d35267.herokuapp.com/)

**Repository:** https://github.com/gcm107/yogitrack-prototype  

---

## SUMMARY

YogiTrack is a web-based management system designed for Yoga H'om to streamline operations. **Part 1** includes features for instructor management and class scheduling. **Future releases** will incorporate more features such as customer tracking, attendance monitoring, and report generation to line up with Yoga H'om's business needs. 

---

## USE CASES IMPLEMENTED

### USE CASE 1: ADD INSTRUCTOR - COMPLETED

**Actor:** Manager  
**Description:** Manager adds new instructor to the system with demographic and contact information

**Implementation Details:**
- **Form Validation:** Required fields checking (first name, last name, email, phone)
- **Duplicate Detection:** Checks for existing instructors with same name and prompts for confirmation
- **ID Generation:** Automatic instructor ID assignment with "I" prefix (I00001, I00002...)
- **Contact Preferences:** Radio button selection for phone or email communication
- **Data:** Data is stored in MongoDB

**Technical Features:**
- Frontend form with search/add/delete modes
- Backend API endpoints for CRUD operations
- Database model with proper schema validation
- Checks for duplicate names before adding new isntructors. 

### USE CASE 2: ADD CLASS - COMPLETED

**Actor:** Manager  
**Description:** Manager creates new yoga class with schedule, instructor assignment, and class details

**Implementation Details:**
- **Class Information:** Name, description, type (General/Special), pay rate
- **Instructor Assignment:** Dropdown selection from existing instructors
- **Schedule Management:** Day, time, duration with conflict detection
- **ID Generation:** Automatic class ID is generated
- **Conflict Prevention:** Checks for schedule overlaps and prevents double-booking


---

## DATA MODEL DESIGN

### ENTITY RELATIONSHIP DIAGRAM
![Part 1 Entity Relationship Diagram](ER-DIAGRAM-PART1.png)

### DATABASE SCHEMAS

**Instructor Schema:**
```javascript
{
  instructorId: String,    // Primary key: I00001, I00002...
  firstName: String,       // Required
  lastName: String,        // Required  
  email: String,          // Required, contact information
  phone: String,          // Required, contact information
  address: String,        // Physical address
  preferredContact: String // "phone" or "email"
}
```

**Class Schema:**
```javascript
{
  classId: String,        // Primary key: A001, A002...
  className: String,      // Required, e.g. "Morning Yoga"
  instructorId: String,   // Foreign key reference
  classType: String,      // "General" or "Special"
  description: String,    // Class details
  daytime: [{            // Embedded schedule array
    day: String,         // Monday, Tuesday, etc.
    time: String,        // 24-hour format HH:MM
    duration: Number     // Minutes (default: 60)
  }],
  payRate: Number        // Instructor compensation per class
}
```

---

## UI DESIGN

### DESIGN PRINCIPLES
- **Consistent:** Uniform styling across all forms and pages
- **Simple:** Very simple so its intuitive.

**Form Design:** 
- Separation of buttons
- Required fields
- Dropdown selections populated from database
- Form validation
- Success/error messaging

---

### ADDITIONAL TOOLS
- **Heroku:** Cloud deployment platform with automatic CI/CD
- **Git/GitHub:** Version control and repository management
- **Procfile:** Heroku deployment configuration

---

## KEY CHALLENGES AND LEARNINGS

### TECHNICAL CHALLENGES OVERCOME

**1. Intuitive Forms**
- Button layout and correct order of when to use buttons was confusing.
- Learned that changing button location makes it more intuitive.

**2. Field Naming Consistency**
- Establishing naming conventions early in development

---

## NEXT STEPS - PART 2

### ADDITIONAL USE CASES TO IMPLEMENT
1. **Customer Management:** Add/edit customer profiles and package purchases
2. **Package Management:** Create and manage class packages and pricing
3. **Attendance Tracking:** Check-in system for class attendance
4. **Sale Tracking:** Tracking sales of packages
5. **Reporting:** Generate Studio Reports

