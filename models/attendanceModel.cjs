// model for tracking class attendance
// same format as instructorModel.cjs
const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

// records when customers attend classes
const attendanceModel = new mongoose.Schema({
    checkinId: Number,
    customerId: String,
    classId: String,
    datetime: {type: Date, default: Date.now}
}, 

{collection:"attendance"}

);

module.exports = mongoose.model("Attendance", attendanceModel);
