// packageModel.cjs model for class packages that customers can purchase
const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

// package schema: defines different yoga package offerings
const packageModel = new mongoose.Schema({
    packageId: String,
    packageName: String,
    description: String,
    packageCategory: {type: String, enum: ['General', 'Senior']},
    numberOfClasses: {type: String, enum: ['1', '4', '10', 'unlimited']},
    classType: {type: String, enum: ['General', 'Special']},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    price: Number
}, 

{collection:"package"}

);

module.exports = mongoose.model("Package", packageModel);
