# YOGITRACK PROTOTYPE
MERN based full stack web app for managing yoga studios

## TODO
- Fix dashboard statistics to show real data
- Add user login and authentication
- Add customer and package search functionality

## USE CASES

### USE CASE 1: ADD INSTRUCTOR
Manager can add yoga instructors with name, email, phone, address, and preferred contact. System auto-generates instructor IDs (I001, I002, etc.).

### USE CASE 2: ADD CLASS
Manager can schedule yoga classes and assign instructors. System auto-generates class IDs (A001, A002, etc.) and checks for schedule conflicts.

### USE CASE 3: ADD CUSTOMER
Manager adds customers with contact info. System generates customer IDs starting with Y (Y001, Y002, etc.). Customers start with 0 class balance.

### USE CASE 4: ADD PACKAGE
Manager creates class packages with pricing. System generates package IDs (P001 for general, S001 for senior). Packages can be for 1, 4, 10, or unlimited classes.

### USE CASE 5: RECORD SALE
Manager records package sales to customers. System automatically calculates validity dates and updates customer class balance.

### USE CASE 6: RECORD ATTENDANCE
Instructors mark customer attendance for classes. System automatically decrements customer class balance by 1 per class attended.

### USE CASE 7: GENERATE REPORTS
Manager generates business reports including package sales, instructor performance, customer packages, and teacher payments.

## TECHNICAL IMPLEMENTATION

**Backend:**
- Node.js with Express server
- MongoDB database
- RESTful API endpoints
- Automatic ID generation and validation

**Frontend:**
- React application with modern UI
- Form validation and error handling


**Database:**
- Separate collections for customers, packages, sales, attendance, instructors, classes
- Automatic balance tracking for customer class credits
- Relationship management between entities
