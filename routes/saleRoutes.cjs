// saleRoutes.cjs - routes for sale management
// I used the instructorRoutes.cjs as reference

const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController.cjs");

// sale routes
router.get("/search", saleController.search);
router.get("/getSale", saleController.getSale);
router.get("/getNextId", saleController.getNextId);
router.post("/add", saleController.add);
router.get("/getSaleIds", saleController.getSaleIds);
router.delete("/deleteSale", saleController.deleteSale);

module.exports = router;
