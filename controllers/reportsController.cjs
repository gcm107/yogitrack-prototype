// reportsController.cjs - generates reports for managers
//

const Sale = require("../models/saleModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Instructor = require("../models/instructorModel.cjs");
const Class = require("../models/classModel.cjs");
const Attendance = require("../models/attendanceModel.cjs");
const Package = require("../models/packageModel.cjs");

// package sales report - shows sales data by package
exports.getPackageSalesReport = async (req, res) => {

  try {

    const { startDate, endDate } = req.query;

    // build date filter
    let dateFilter = {};

    if (startDate || endDate) {

      dateFilter.paymentDateTime = {};
      if (startDate) dateFilter.paymentDateTime.$gte = new Date(startDate);
      if (endDate) dateFilter.paymentDateTime.$lte = new Date(endDate);
    }

    // get all sales
    const sales = await Sale.find(dateFilter);

    // group by package and calculate totals
    const packageStats = {};

    for (const sale of sales) {
      const packageId = sale.Package.packageId;

      if (!packageStats[packageId]) {

        // get package details
        const packageInfo = await Package.findOne({ packageId: packageId });

        packageStats[packageId] = {

          packageId,
          packageName: packageInfo ? packageInfo.packageName : 'Unknown',
          totalSales: 0,
          totalRevenue: 0,
          customers: []
        };
      }

      packageStats[packageId].totalSales++;
      packageStats[packageId].totalRevenue += sale.Package.amountPaid;
      packageStats[packageId].customers.push(sale.customerId);
    }

    const report = {

      period: { startDate, endDate },
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.Package.amountPaid, 0),
      packages: Object.values(packageStats)
    };

    res.json(report);

  } catch (err) {
    
    console.error("Error generating package sales report:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// instructor performance report - shows instructors with classes and check-ins
exports.getInstructorPerformanceReport = async (req, res) => {

  try {

    const { month, year } = req.query;

    // get all instructors
    const instructors = await Instructor.find({});

    const report = [];

    for (const instructor of instructors) {

      // get classes for this instructor
      const classes = await Class.find({ instructorId: instructor.instructorId });

      // count check-ins for instructor's classes
      const classIds = classes.map(c => c.classId);

      const attendanceCount = await Attendance.countDocuments({

        classId: { $in: classIds }

      });

      report.push({
        instructorId: instructor.instructorId,
        instructorName: `${instructor.firstName} ${instructor.lastName}`,
        totalClasses: classes.length,
        totalCheckIns: attendanceCount,
        classes: classes.map(c => ({
          classId: c.classId,
          className: c.className,
          payRate: c.payRate
        }))
      });
    }

    res.json({

      period: { month, year },
      instructors: report
    });

  } catch (err) {

    console.error("Error generating instructor performance report:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// customer packages report - shows customers and  their packages bought
exports.getCustomerPackageReport = async (req, res) => {
  try {
    // get all customers
    const customers = await Customer.find({});

    const report = [];

    for (const customer of customers) {

      // get sales for this customer
      const sales = await Sale.find({ customerId: customer.customerId });

      const packages = [];

      for (const sale of sales) {

        const packageInfo = await Package.findOne({ packageId: sale.Package.packageId });

        if (packageInfo) {

          const now = new Date();
          const startDate = new Date(sale.Package.startDate);
          const endDate = new Date(sale.Package.endDate);

          let status = 'expired';

          if (now >= startDate && now <= endDate) {

            status = 'active';

          } else if (now < startDate) {
            status = 'future';
          }

          packages.push({
            packageId: sale.Package.packageId,
            packageName: packageInfo.packageName,
            purchaseDate: sale.paymentDateTime,
            startDate: sale.Package.startDate,
            endDate: sale.Package.endDate,
            amountPaid: sale.Package.amountPaid,
            status: status
          });
        }
      }

      report.push({
        customerId: customer.customerId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        classBalance: customer.classBalance,
        packages: packages
      });
    }

    res.json({

      customers: report,
      summary: {

        totalCustomers: customers.length,
        totalActivePackages: report.reduce((sum, customer) =>
          sum + customer.packages.filter(p => p.status === 'active').length, 0)
      }
    });

  } catch (err) {
    console.error("Error generating customer package report:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// teacher payment report - calculates monthly payments for instructors
exports.getTeacherPaymentReport = async (req, res) => {

  try {

    const { month, year } = req.query;

    // default to current mon
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // get all instructors
    const instructors = await Instructor.find({});

    const report = [];

    for (const instructor of instructors) {

      // get classes for this instructor
      const classes = await Class.find({ instructorId: instructor.instructorId });

      let totalPayment = 0;
      const classDetails = [];

      for (const classInfo of classes) {
        // count check-ins for this class in the target month
        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        const checkIns = await Attendance.countDocuments({

          classId: classInfo.classId,
          datetime: {

            $gte: startOfMonth,
            $lte: endOfMonth
          }

        });

        const classPayment = checkIns * classInfo.payRate;

        totalPayment += classPayment;

        classDetails.push({
          classId: classInfo.classId,
          className: classInfo.className,
          payRate: classInfo.payRate,
          checkIns: checkIns,
          payment: classPayment
        });
      }

      report.push({
        instructorId: instructor.instructorId,
        instructorName: `${instructor.firstName} ${instructor.lastName}`,
        totalPayment: totalPayment,
        classes: classDetails
      });
    }

    res.json({

      period: {

        month: targetMonth + 1,
        year: targetYear,
        monthName: new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long' })
      },
      instructors: report,
      totalPayroll: report.reduce((sum, instructor) => sum + instructor.totalPayment, 0)
    });

  } catch (err) {
    console.error("Error generating teacher payment report:", err.message);
    res.status(500).json({ error: err.message });
  }
};
