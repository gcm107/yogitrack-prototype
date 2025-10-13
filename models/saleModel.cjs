// model for package sales to customers
const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");


// details of the package being purchased
const packageSaleSchema = new mongoose.Schema({
    packageId: String,
    startDate: {type: Date, required: true},
    endDate: { type: Date, required: true},
    amountPaid: Number
},

 { _id: false }
 
);

// purchases and payment info storing
const saleModel = new mongoose.Schema({
    saleId: Number,
    customerId: String,
    Package: packageSaleSchema,
    modeOfPayment: {type: String,enum: ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Online']},
    paymentDateTime: {type: Date,default: Date.now}
}, 
{collection:"sale"}
);

module.exports = mongoose.model("Sale", saleModel);
