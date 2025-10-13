// reportsRoutes.cjs - routes for studio report generation
// same format as instructorRoutes.cjs
// handles all studio management reports

const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController.cjs");

// report generation routes
router.get("/packageSales", reportsController.getPackageSalesReport);
router.get("/instructorPerformance", reportsController.getInstructorPerformanceReport);
router.get("/customerPackages", reportsController.getCustomerPackageReport);
router.get("/teacherPayments", reportsController.getTeacherPaymentReport);

module.exports = router;
