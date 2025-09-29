const Instructor = require("../models/instructorModel.cjs");

exports.search = async (req, res) => {
  try {
    const { firstName, lastName } = req.query;
    
    // if both names provided, search for both
    if (firstName && lastName) {
      const instructor = await Instructor.findOne({
        firstName: { $regex: firstName, $options: "i" },
        lastName: { $regex: lastName, $options: "i" },
      });
      
      if (!instructor) {
        return res.status(404).json({ message: "no instructor found" });
      }
      return res.json(instructor);
    }
    
    // fallback to just first name search
    const searchString = firstName;
    const instructor = await Instructor.find({
      firstName: { $regex: searchString, $options: "i" },
    });

    if (!instructor || instructor.length == 0) {
      return res.status(404).json({ message: "No instructor found" });
    } else {
      res.json(instructor[0]);
    }
  } catch (e) {
    res.status(400).json({error: e.message});
  }
};

//Find the package selected in the dropdown
exports.getInstructor = async (req, res) => {
  try {
    const instructorId = req.query.instructorId;
    const instructorDetail = await Instructor.findOne({ instructorId: instructorId });

    res.json(instructorDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};


// names changed to camelCase
exports.add = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      preferredContact
    } = req.body;

    // Basic validation - changed to camelCase
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Generate next instructor ID
    const lastInstructor = await Instructor.find({
      instructorId: { $exists: true, $ne: null }
    })
      .sort({ instructorId: -1 })
      .limit(1);
    
    let maxNumber = 1;
    if (lastInstructor.length > 0 && lastInstructor[0].instructorId) {
      const lastId = lastInstructor[0].instructorId;
      const match = lastId.match(/\d+$/);
      if (match) {
        maxNumber = parseInt(match[0]) + 1;
      }
    }
    const nextId = `I${maxNumber.toString().padStart(5, '0')}`;

    // Create a new instructor document, using nextId
    const newInstructor = new Instructor({
      instructorId: nextId,
      firstName,
      lastName,
      address,
      phone,
      email,
      preferredContact
    });

    // Save to database
    await newInstructor.save();
    res.status(201).json({ 
      message: `Instructor added successfully. Welcome to Yoga'Hom! Your instructor id is ${nextId}.`,
      instructor: newInstructor 
    });
  } catch (err) {
    console.error("Error adding instructor:", err.message);
    res.status(500).json({ message: "Failed to add instructor", error: err.message });
  }
};

//Populate the instructorId dropdown
exports.getInstructorIds = async (req, res) => {
  try {
    const instructors = await Instructor.find(
      {},
      { instructorId: 1, firstName: 1, lastName: 1, _id: 0 }
    ).sort();

    res.json(instructors);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getNextId = async (req, res) => {
  const lastInstructor = await Instructor.find({})
    .sort({ instructorId: -1 })
    .limit(1);

  let maxNumber = 1;
  if (lastInstructor.length > 0) {
    const lastId = lastInstructor[0].instructorId;
    const match = lastId.match(/\d+$/);
    if (match) {
      maxNumber = parseInt(match[0]) + 1;
    }
  }

  // patdding to match example id shown in canvas 
  const nextId = `I${maxNumber.toString().padStart(5, '0')}`;
  res.json({ nextId });
};

exports.deleteInstructor = async (req, res) => {
  try {
     const {instructorId} = req.query;
     const result = await Instructor.findOneAndDelete({ instructorId });
     if (!result) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    res.json({ message: "Instructor deleted", instructorId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
