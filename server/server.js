require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const session = require("express-session");
require("dotenv").config();
const cors = require("cors");
// Initialize Express
const app = express();
// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:5173", // Allow all origins, adjust as needed for security
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow credentials if needed
  })
);

// Set security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Middleware
app.use(express.json({ limit: "2mb" })); // Increased payload size limit
app.use(express.urlencoded({ extended: true, limit: "2mb" })); // Increased payload size limit for URL-encoded data
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Request body:", req.body);
  next();
});

// Import routes
const authRoutes = require("./routes/auth");
const invoiceRoutes = require("./routes/invoices");
const expenseInvoiceRoutes = require("./routes/expense-invoices");
const userRoutes = require("./routes/users");
const scanInvoiceRoutes = require("./routes/scanInvoice");
const inventoryRoutes = require("./routes/inventory");

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expense-invoices", expenseInvoiceRoutes);
app.use("/api/users", userRoutes);
app.use("/api", scanInvoiceRoutes);
app.use("/api/inventory", inventoryRoutes);

// Serve static files
app.use(express.static("public"));

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve the scan page
app.get("/scan", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "scan.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
