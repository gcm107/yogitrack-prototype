// authRoutes.cjs - api routes for user authentication

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.cjs");

// login route
router.post("/login", authController.login);

// default user -- for easy showing and testinog
router.post("/create-default-user", authController.createDefaultUser);

module.exports = router;

