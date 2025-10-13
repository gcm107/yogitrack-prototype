const express = require("express");
const path = require("path");
const app = express();

//  static files from   react build folder
app.use(express.static(path.join(__dirname, "client/build")));
app.use(express.json());

// api routes
app.use("/api/instructor", require("./routes/instructorRoutes.cjs"));
app.use("/api/class", require("./routes/classRoutes.cjs"));

app.use("/api/customer", require("./routes/customerRoutes.cjs"));
app.use("/api/package", require("./routes/packageRoutes.cjs"));
app.use("/api/sale", require("./routes/saleRoutes.cjs"));
app.use("/api/attendance", require("./routes/attendanceRoutes.cjs"));
app.use("/api/reports", require("./routes/reportsRoutes.cjs"));

// datch-all route
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  } else {
    next();
  }
});

// start the web server
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}...`);
  console.log('Open http://localhost:8080 in your browser to view the React app.');
});
