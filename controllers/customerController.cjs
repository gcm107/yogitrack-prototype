// customerController.cjs - handles customer management
// similar to instructorController.cjs but for customers

const Customer = require("../models/customerModel.cjs");

// search for customers by first and last name
exports.search = async (req, res) => {
  try {
    const { firstName, lastName } = req.query;

    // search by both names if provided
    if (firstName && lastName) {
      const customer = await Customer.findOne({
        firstName: { $regex: firstName, $options: "i" },
        lastName: { $regex: lastName, $options: "i" },
      });

      if (!customer) {
        return res.status(404).json({ message: "no customer found" });
      }
      return res.json(customer);
    }

    //  just first name search as a fallbacl
    const searchString = firstName;
    const customer = await Customer.find({
      firstName: { $regex: searchString, $options: "i" },
    });

    if (!customer || customer.length == 0) {
      return res.status(404).json({ message: "No customer found" });
    } else {
      res.json(customer[0]);
    }
  } catch (e) {
    res.status(400).json({error: e.message});
  }
};

// find a customer by their ID
exports.getCustomer = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    const customerDetail = await Customer.findOne({ customerId: customerId });

    res.json(customerDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// gets all customer IDs for dropdown lists
exports.getCustomerIds = async (req, res) => {
  try {
    const customers = await Customer.find(
      {},
      { customerId: 1, firstName: 1, lastName: 1, _id: 0 }
    ).sort();

    res.json(customers);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// generates the next customer ID
exports.getNextId = async (req, res) => {
  const lastCustomer = await Customer.find({})
    .sort({ customerId: -1 })
    .limit(1);

  let maxNumber = 1;
  if (lastCustomer.length > 0) {
    const lastId = lastCustomer[0].customerId;
    const match = lastId.match(/\d+$/);
    if (match) {
      maxNumber = parseInt(match[0]) + 1;
    }
  }

  // cust IDS start with 'C' like the use case example
  const nextId = `C${maxNumber.toString().padStart(5, '0')}`;
  res.json({ nextId });
};

// add  new customer to the database
exports.add = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      preferredContact,
      senior
    } = req.body;

    // basic validation - these fields are required
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // generate next customer ID
    const lastCustomer = await Customer.find({
      customerId: { $exists: true, $ne: null }
    })
      .sort({ customerId: -1 })
      .limit(1);

    let maxNumber = 1;
    if (lastCustomer.length > 0 && lastCustomer[0].customerId) {
      const lastId = lastCustomer[0].customerId;
      const match = lastId.match(/\d+$/);
      if (match) {
        maxNumber = parseInt(match[0]) + 1;
      }
    }
    const nextId = `Y${maxNumber.toString().padStart(3, '0')}`;

    // create the new customer
    const newCustomer = new Customer({
      customerId: nextId,
      firstName,
      lastName,
      address,
      phone,
      email,
      preferredContact,
      senior: senior || false, // default to false if not provided
      classBalance: 0 // start with 0 classes
    });

    // save to database
    await newCustomer.save();
    res.status(201).json({
      message: `Customer added successfully. Welcome to Yoga'Hom! Your customer id is ${nextId}.`,
      customer: newCustomer
    });
  } catch (err) {
    console.error("Error adding customer:", err.message);
    res.status(500).json({ message: "Failed to add customer", error: err.message });
  }
};

// delete a customer from the database
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.query;
    const result = await Customer.findOneAndDelete({ customerId });

    if (!result) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer deleted", customerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
