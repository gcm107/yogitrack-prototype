// attendanceController.cjs - handles class attendance recording
// instructors mark customers as present and  balances update

const Attendance = require("../models/attendanceModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Class = require("../models/classModel.cjs");

// record attendance for customers in a class
exports.recordAttendance = async (req, res) => {

  try {

    const { classId, customerIds } = req.body;

    // basic validation - required fields
    if (!classId || !customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {

      return res.status(400).json({ message: "Class ID and customer IDs are required" });
    }

    // get the class to verify it exists
    const classInfo = await Class.findOne({ classId: classId });

    if (!classInfo) {

      return res.status(404).json({ message: "Class not found" });
    }

    const results = [];
    const errors = [];

    // process each customer
    for (const customerId of customerIds) {

      try {

        // get customer details
        const customer = await Customer.findOne({ customerId: customerId });

        if (!customer) {

          errors.push(`Customer ${customerId} not found`);
          continue;
        }

        // check if customer has enough class balance
        if (customer.classBalance <= 0) {
          errors.push(`Customer ${customerId} has no class balance remaining`);
          continue;
        }

        // generate next attendance ID
        const lastAttendance = await Attendance.find({})
          .sort({ checkinId: -1 })
          .limit(1);

        let nextId = 1;

        if (lastAttendance.length > 0) {

          nextId = lastAttendance[0].checkinId + 1;
        }

        // record the attendance
        const newAttendance = new Attendance({
          checkinId: nextId,
          customerId,
          classId,
          datetime: new Date()
        });

        await newAttendance.save();

        // update customer class balance (decrement by 1)
        const newBalance = customer.classBalance - 1;

        await Customer.updateOne(

          { customerId: customerId },
          { classBalance: newBalance }

        );

        results.push({
          customerId,
          checkinId: nextId,
          newBalance,
          message: `Checked in successfully. New balance: ${newBalance} classes.`
        });

      } catch (err) {
        errors.push(`Error processing customer ${customerId}: ${err.message}`);
      }
    }

    res.status(201).json({

      message: `Attendance recorded for ${results.length} customers`,
      successful: results,
      errors: errors,
      totalProcessed: customerIds.length
    });

  } catch (err) {
    console.error("Error recording attendance:", err.message);
    res.status(500).json({ message: "Failed to record attendance", error: err.message });
  }
};

// get attendance history for a customer
exports.getAttendanceHistory = async (req, res) => {
    
  try {

    const { customerId } = req.query;

    const attendance = await Attendance.find({ customerId: customerId })
      .sort({ datetime: -1 });

    res.json(attendance);

  } catch (e) {

    res.status(400).json({ error: e.message });
  }
};

// get classes assigned to a specific instructor
exports.getClassesByInstructor = async (req, res) => {

  try {

    const { instructorId } = req.query;

    const classes = await Class.find({ instructorId: instructorId });

    res.json(classes);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// delete an attendance record
exports.deleteAttendance = async (req, res) => {

  try {

    const { checkinId } = req.query;
    const result = await Attendance.findOneAndDelete({ checkinId: parseInt(checkinId) });

    if (!result) {

      return res.status(404).json({ error: "Attendance record not found" });
    }

    // optionally restore customer balance
    const customer = await Customer.findOne({ customerId: result.customerId });

    if (customer) {

      const restoredBalance = customer.classBalance + 1;
      await Customer.updateOne(

        { customerId: result.customerId },
        { classBalance: restoredBalance }

      );
    }

    res.json({ message: "Attendance record deleted", checkinId });

  } catch (err) {

    res.status(500).json({ error: err.message });
  }
};

// get attendance statistics
exports.getAttendanceStats = async (req, res) => {

  try {

    const { classId, instructorId } = req.query;

    let query = {};
    if (classId) query.classId = classId;

    if (instructorId) {

      // find classes by this instructor abd get attendance for those classes
      const classes = await Class.find({ instructorId: instructorId });
      const classIds = classes.map(c => c.classId);
      query.classId = { $in: classIds };
    }

    const attendance = await Attendance.find(query)
      .sort({ datetime: -1 })
      .limit(100); // limit for performance

    // group by class and count
    const stats = {};

    attendance.forEach(record => {

      if (!stats[record.classId]) {

        stats[record.classId] = 0;
      }

      stats[record.classId]++;

    });

    res.json({
        
      totalRecords: attendance.length,
      byClass: stats,
      recentAttendance: attendance.slice(0, 10)
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
