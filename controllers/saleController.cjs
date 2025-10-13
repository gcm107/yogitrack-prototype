// saleController.cjs - records sales and updates customer clas balances
// 

const Sale = require("../models/saleModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Package = require("../models/packageModel.cjs");

// search for sales by customer ID
exports.search = async (req, res) => {

  try {

    const { customerId } = req.query;

    // search by customer ID
    const sales = await Sale.find({ customerId: customerId });

    if (!sales || sales.length == 0) {

      return res.status(404).json({ message: "No sales found" });

    } else {
      res.json(sales);
    }

  } catch (e) {
    res.status(400).json({error: e.message});
  }
};

// find a sale by its ID

exports.getSale = async (req, res) => {

  try {

    const saleId = req.query.saleId;

    const saleDetail = await Sale.findOne({ saleId: parseInt(saleId) });

    res.json(saleDetail);

  } catch (e) {

    res.status(400).json({ error: e.message });
  }
};

// get all sale IDs for dropdown lists
exports.getSaleIds = async (req, res) => {

  try {

    const sales = await Sale.find(
      {},
      { saleId: 1, customerId: 1, _id: 0 }).sort({ saleId: -1 });

    res.json(sales);

  } catch (e) {

    res.status(400).json({ error: e.message });
  }
};

// generate the next sale ID
exports.getNextId = async (req, res) => {

  const lastSale = await Sale.find({})

    .sort({ saleId: -1 })

    .limit(1);

  let maxNumber = 1;

  if (lastSale.length > 0) {

    maxNumber = lastSale[0].saleId + 1;
  }

  res.json({ nextId: maxNumber });
};

// record a new sale and update customer balance
exports.add = async (req, res) => {
  try {
    const {
      customerId,
      packageId,
      amountPaid,
      modeOfPayment
    } = req.body;

    // basic validation - required fields
    if (!customerId || !packageId || !amountPaid || !modeOfPayment) {

      return res.status(400).json({ message: "Missing required fields" });
    }

    // get the package details
    const packageInfo = await Package.findOne({ packageId: packageId });

    if (!packageInfo) {

      return res.status(404).json({ message: "Package not found" });
    }

    // get the customer
    const customer = await Customer.findOne({ customerId: customerId });

    if (!customer) {

      return res.status(404).json({ message: "Customer not found" });
    }

    // calculate start and end dates based on package
    const startDate = new Date();
    const endDate = new Date();

    // parse validity period from description (e.g., "Valid for 1 month", "Valid for 3 months")
    const validityMatch = packageInfo.description.match(/Valid for (\d+) month/);
    const monthsValid = validityMatch ? parseInt(validityMatch[1]) : 1;
    endDate.setMonth(endDate.getMonth() + monthsValid);

    // generate next sale ID
    const lastSale = await Sale.find({})
      .sort({ saleId: -1 })
      .limit(1);

    let nextId = 1;

    if (lastSale.length > 0) {

      nextId = lastSale[0].saleId + 1;
    }

    // calculate classes to add based on package
    let classesToAdd = 0;

    switch (packageInfo.numberOfClasses) {

      case '1':
        classesToAdd = 1;
        break;

      case '4':
        classesToAdd = 4;
        break;

      case '10':
        classesToAdd = 10;
        break;

      case 'unlimited':
        classesToAdd = 999; // large number for unlimited
        break;

      default:
        classesToAdd = 0;
    }

    // create the new sale
    const newSale = new Sale({

      saleId: nextId,
      customerId,
      Package: {
        packageId,
        startDate: startDate,
        endDate: endDate,
        amountPaid: parseFloat(amountPaid)
      },

      modeOfPayment,
      paymentDateTime: new Date()
    });

    // save the sale
    await newSale.save();

    // update customer class balance
    const newBalance = customer.classBalance + classesToAdd;
    await Customer.updateOne(

      { customerId: customerId },
      { classBalance: newBalance }

    );

    res.status(201).json({

      message: `Sale recorded successfully. Customer ${customerId} new balance: ${newBalance} classes.`,
      sale: newSale,

      newBalance: newBalance
    });

  } catch (err) {

    console.error("Error recording sale:", err.message);

    res.status(500).json({ message: "Failed to record sale", error: err.message });
  }
};

// delete a sale from the database
exports.deleteSale = async (req, res) => {

  try {

    const { saleId } = req.query;

    const result = await Sale.findOneAndDelete({ saleId: parseInt(saleId) });

    if (!result) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.json({ message: "Sale deleted", saleId });

  } catch (err) {
    
    res.status(500).json({ error: err.message });
  }
};
