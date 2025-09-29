// classRoutes.cjs for the class routes. set up like instructorRoutes.cjs was
const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController.cjs");

router.get("/getClass", classController.getClass);
router.get("/getAllClasses", classController.getAllClasses);
router.get("/getNextId", classController.getNextId);
router.get("/checkConflict", classController.checkConflict);
router.post("/add", classController.addClass);
router.delete("/deleteClass", classController.deleteClass);

module.exports = router;
