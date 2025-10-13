// attendanceRoutes.cjs - routes for attendance management
// same format as instructorRoutes.cjs
// instructors marking class attendance
const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController.cjs");

// attendance routes
router.post("/recordAttendance", attendanceController.recordAttendance);
router.get("/getAttendanceHistory", attendanceController.getAttendanceHistory);
router.get("/getClassesByInstructor", attendanceController.getClassesByInstructor);
router.delete("/deleteAttendance", attendanceController.deleteAttendance);
router.get("/getAttendanceStats", attendanceController.getAttendanceStats);

module.exports = router;
