// dashboardRoutes.cjs - api routes for dashboard statistics

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController.cjs");

// get dashboard statistics
router.get("/stats", dashboardController.getStats);

module.exports = router;

