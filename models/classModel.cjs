// classModel.cjs model for yoga classes
const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

// schema for class schedule times
const daytimeSchema = new mongoose.Schema({
    day: String,
    time: String,
    duration: Number
}, 
{ _id: false }
);

// main yoga class structure
const classModel = new mongoose.Schema({
    classId: String,
    className: String,
    instructorId: String,
    classType: String,
    description: String,
    daytime: [daytimeSchema],
    payRate: Number
}, 
{collection:"class"}
);

module.exports = mongoose.model("Class", classModel);
