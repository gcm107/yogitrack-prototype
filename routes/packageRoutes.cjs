// packageRoutes.cjs - routes for package management
// I used the instructorRoutes.cjs as reference
const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController.cjs");

// package routes
router.get("/search", packageController.search);
router.get("/getPackage", packageController.getPackage);
router.get("/getNextId", packageController.getNextId);
router.post("/add", packageController.add);
router.get("/getPackageIds", packageController.getPackageIds);
router.delete("/deletePackage", packageController.deletePackage);

module.exports = router;
