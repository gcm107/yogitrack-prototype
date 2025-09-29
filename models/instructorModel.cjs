// instructorModel.cjs
const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

// instructor schema - names use camelCase
const instructorModel = new mongoose.Schema({
    instructorId: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    preferredContact: String
}, 
{collection:"instructor"}
);

module.exports = mongoose.model("Instructor", instructorModel);