// dashboardController.cjs - 
// statistics for the dashboard page

const Instructor = require("../models/instructorModel.cjs");
const Class = require("../models/classModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Sale = require("../models/saleModel.cjs");

// get all the main stats for the dashboard
exports.getStats = async (req, res) => {
  try {
    // total instructors
    const totalInstructors = await Instructor.countDocuments({});
    
    //total classes
    const totalClasses = await Class.countDocuments({});
    
    //  total customers
    const totalCustomers = await Customer.countDocuments({});
    
    // monthly rev
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const sales = await Sale.find({
      paymentDateTime: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    
    // summing payments
    let monthlyRevenue = 0;
    sales.forEach(sale => {
      monthlyRevenue += sale.Package.amountPaid || 0;
    });
    
    // all the stats
    res.json({
      totalInstructors,
      totalClasses,
      totalCustomers,
      monthlyRevenue: monthlyRevenue.toFixed(2)
    });
    
  } catch (err) {
    console.error("Error getting dashboard stats:", err.message);
    res.status(500).json({ message: "Failed to get stats", error: err.message });
  }
};

