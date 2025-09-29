// classController.cjs for the class controller. set up like instructorController.cjs was
const Class = require("../models/classModel.cjs");

// gets all yoga classes from the database
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({});
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// finds and returns a specific class by its id
exports.getClass = async (req, res) => {
  try {
    const classId = req.query.classId;
    const classDetail = await Class.findOne({ classId: classId });
    
    if (!classDetail) {
      return res.status(404).json({ error: "Class not found" });
    }
    
    res.json(classDetail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// check for schedule conflicts
exports.checkConflict = async (req, res) => {
  try {
    const { day, time, duration } = req.query;
    
    if (!day || !time) {
      return res.status(400).json({ message: "Day and time are required" });
    }

    const conflict = await checkScheduleConflict(day, time, parseInt(duration) || 60);
    res.json(conflict);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// helper function to check schedule conflicts
async function checkScheduleConflict(day, time, duration) {
  try {
    const classes = await Class.find({});
    
    // convert time to minutes for comparison
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = hours * 60 + minutes;
    const endTime = startTime + duration;
    
    for (const existingClass of classes) {
      if (existingClass.daytime && existingClass.daytime.length > 0) {
        const schedule = existingClass.daytime[0];
        if (schedule.day === day) {
          const [existingHours, existingMinutes] = schedule.time.split(':').map(Number);
          const existingStart = existingHours * 60 + existingMinutes;
          const existingEnd = existingStart + (schedule.duration || 60);
          
          // check for time overlap
          if ((startTime < existingEnd) && (endTime > existingStart)) {
            return {
              hasConflict: true,
              conflictClass: existingClass.className,
              conflictTime: schedule.time,
              message: `Conflicts with "${existingClass.className}" (${schedule.day} ${schedule.time})`
            };
          }
        }
      }
    }
    
    return { hasConflict: false };
  } catch (err) {
    console.error("Error checking schedule conflict:", err);
    return { hasConflict: false };
  }
}

// creates and saves a new yoga class
exports.addClass = async (req, res) => {
  try {
    const {
      className,
      instructorId,
      classType,
      description,
      daytime,
      payRate
    } = req.body;

    // basic validation as use cases defined
    if (!className || !instructorId || !classType || !daytime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check for schedule conflicts before adding
    if (daytime && daytime.length > 0) {
      const conflict = await checkScheduleConflict(daytime[0].day, daytime[0].time, daytime[0].duration || 60);
      if (conflict.hasConflict) {
        return res.status(409).json({ 
          message: "Schedule conflict detected", 
          conflict: conflict 
        });
      }
    }
    
    // Generate next class ID
    const lastClass = await Class.find({
      classId: { $exists: true, $ne: null }
    })
      .sort({ classId: -1 })
      .limit(1);
    
    let maxNumber = 1;
    if (lastClass.length > 0 && lastClass[0].classId) {
      const lastId = lastClass[0].classId;
      const match = lastId.match(/\d+$/);
      if (match) {
        maxNumber = parseInt(match[0]) + 1;
      }
    }
    const nextId = `A${maxNumber.toString().padStart(3, '0')}`;

    // creates a new class document
    const newClass = new Class({
      classId: nextId,
      className,
      instructorId,
      classType,
      description,
      daytime,
      payRate: payRate || 45 // Default pay rate if not provided
    });

    // saves to database
    await newClass.save();
    res.status(201).json({ 
      message: `Class added successfully. New class id is ${nextId}.`, 
      class: newClass 
    });
  } catch (err) {
    console.error("Error adding class:", err.message);
    res.status(500).json({ message: "Failed to add class", error: err.message });
  }
};

// generates the next available class id
exports.getNextId = async (req, res) => {
  const lastClass = await Class.find({})
    .sort({ classId: -1 })
    .limit(1);

  let maxNumber = 1;
  if (lastClass.length > 0) {
    const lastId = lastClass[0].classId;
    const match = lastId.match(/\d+$/);
    if (match) {
      maxNumber = parseInt(match[0]) + 1;
    }
  }
  
  // formats with leading zeros
  const nextId = `A${maxNumber.toString().padStart(3, '0')}`;
  res.json({ nextId });
};

// removes a yoga class from the database
exports.deleteClass = async (req, res) => {
  try {
    const { classId } = req.query;
    const result = await Class.findOneAndDelete({ classId });
    
    if (!result) {
      return res.status(404).json({ error: "Class not found" });
    }
    
    res.json({ message: "Class deleted", classId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
