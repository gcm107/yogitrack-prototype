// customerModel.cjs model  for customers. used same format as instructorModel.cjs
const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

// tracks customer info and and class balance
const customerModel = new mongoose.Schema({
    customerId: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    preferredContact: String,
    classBalance: { type: Number, default: 0 },
    senior: { type: Boolean, default: false }
}, 
{collection:"customer"}
);

module.exports = mongoose.model("Customer", customerModel);