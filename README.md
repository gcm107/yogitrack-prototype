# YOGITRACK PROTOTYPE

Simple yoga studio management app

## PART 1: CORE FUNCTIONALITY

### USE CASE 1: ADD INSTRUCTOR - COMPLETED

**Description:** Manager adds new instructor to the MongoDB collection

**Requirements Implemented:**
- Manager can add new instructor and their information (Name, email, phone, address, preferred contact method)
- Checks for duplicate instructor names before adding
- Validates to make sure required fields are filled out before saving
- A unique ID is assigned to the instructor when saved
- System displays a message and the instructor id
- Instructor id is added to the dropdown of instructors

___
_**Status:**_ Working

---

### USE CASE 2: ADD CLASS - IN PROGRESS

**Description:** The manager adds a new class to the schedule with the following data:
- **Actor:** Manager
- **Description:** The manager adds a new class to the schedule with the following data:
  - Instructor Id
  - Day, time
  - Class type (General or Special)
    - A General class is open to any customer with a package of 'General' classes
    - A Special series of classes needs a package with 'Special' class type, e.g. 'Yoga with weights'
  - Pay rate

Basic Flow:
1. The manager chooses the option to create a new class and enters the required data
2. YogiTrack checks if there is a conflict in the schedule, as only one class can be held at any given time
    - If a conflict exists, YogiTrack suggests alternative options in the calendar
    - The manager selects one of the suggested options
3. The manager confirms and publishes the schedule
4. YogiTrack sends a confirmation message to both the manager and the instructor, indicating that a new class has been successfully scheduled

**Requirements Implemented:**
- 
- Manager can add a new class.
- Assigns instructor, payrate, and class description (if class is not general) to new class.
- Checks ensure there is not a schedule conflict. 
- Confirmation message is displayed. 



___
_**Status:**_ Working

---

## PART 2: USE CASES

- Customer management
- Package management
- Attendance tracking
- Payment processing
- Report Generation
