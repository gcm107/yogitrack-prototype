// packageController.cjs - handles all  packages that can be bought


const Package = require("../models/packageModel.cjs");

// search for packages by name
exports.search = async (req, res) => {
  try {
    const { packageName } = req.query;

    // search by package name
    const searchString = packageName;

    const packages = await Package.find({

      packageName: { $regex: searchString, $options: "i" },
    });

    if (!packages || packages.length == 0) {

      return res.status(404).json({ message: "No package found" });

    } else {
      res.json(packages);
    }

  } catch (e) {
    res.status(400).json({error: e.message});
  }
};

// find a package by its ID
exports.getPackage = async (req, res) => {
  try {
    const packageId = req.query.packageId;
    const packageDetail = await Package.findOne({ packageId: packageId });

    res.json(packageDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// get all package IDs for dropdown lists
exports.getPackageIds = async (req, res) => {
  try {
    const packages = await Package.find(
      {},
      { packageId: 1, packageName: 1, _id: 0 }
    ).sort();

    res.json(packages);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// generate the next package ID
exports.getNextId = async (req, res) => {
  const lastPackage = await Package.find({})
    .sort({ packageId: -1 })
    .limit(1);

  let maxNumber = 1;
  if (lastPackage.length > 0) {
    const lastId = lastPackage[0].packageId;
    const match = lastId.match(/\d+$/);
    if (match) {
      maxNumber = parseInt(match[0]) + 1;
    }
  }

  // package IDs start with 'P' following what we did for instructor and customer.
  const nextId = `P${maxNumber.toString().padStart(4, '0')}`;
  res.json({ nextId });
};

// add a new package to the database
exports.add = async (req, res) => {

  try {

    const {

      packageName,
      description,
      packageCategory,
      numberOfClasses,
      classType,
      price
    } = req.body;

    // basic validation - required fields
    if (!packageName || !packageCategory || !numberOfClasses || !classType || !price) {

        return res.status(400).json({ message: "Missing required fields" });
    }

    // generate next package ID
    const lastPackage = await Package.find({

      packageId: { $exists: true, $ne: null }
    })

      .sort({ packageId: -1 })
      .limit(1);

    let maxNumber = 1;

    if (lastPackage.length > 0 && lastPackage[0].packageId) {

      const lastId = lastPackage[0].packageId;

      const match = lastId.match(/\d+$/);

      if (match) {
        maxNumber = parseInt(match[0]) + 1;
      }
    }

    const nextId = `${packageCategory === 'Senior' ? 'S' : 'P'}${maxNumber.toString().padStart(3, '0')}`;

    // create the new package
    const newPackage = new Package({
      packageId: nextId,
      packageName,
      description,
      packageCategory,
      numberOfClasses,
      classType,
      price: parseFloat(price)
    });

    // save to database
    await newPackage.save();
    res.status(201).json({

      message: `Package ${nextId} added successfully.`,
      package: newPackage
    });

  } catch (err) {

    console.error("Error adding package:", err.message);
    res.status(500).json({ message: "Failed to add package", error: err.message });
  }
};

// delete a package from the database
exports.deletePackage = async (req, res) => {
  try {
    const { packageId } = req.query;
    
    const result = await Package.findOneAndDelete({ packageId });

    if (!result) {

      return res.status(404).json({ error: "Package not found" });
    }

    res.json({ message: "Package deleted", packageId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
