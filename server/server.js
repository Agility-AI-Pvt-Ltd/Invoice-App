import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import bodyParser from "body-parser";
import session from "express-session";
import cors from "cors";

// Routes (saare .js extension ke saath)
import authRoutes from "./routes/auth.js";
import invoiceRoutes from "./routes/invoices.js";
import expenseInvoiceRoutes from "./routes/expense-invoices.js";
import userRoutes from "./routes/users.js";
import scanInvoiceRoutes from "./routes/scanInvoice.js";
import inventoryRoutes from "./routes/inventory.js";
import customerRoutes from "./routes/customers.js";
import dashboardRoutes from "./routes/dashboard.js";

// __dirname ka ES module version
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

// Enable CORS
const allowedOrigins = [
  "http://localhost:5173", // Development
  "http://localhost:3000", // Alternative development
  "http://localhost:4000", // Alternative development
  "https://api-gateway-914987176295.asia-south1.run.app", // Production API (same origin)
];

// Add Vercel domains dynamically
const vercelPatterns = [
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.netlify\.app$/,
  /^https:\/\/.*\.github\.io$/,
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`🌐 CORS check for origin: ${origin}`);
      
      // Allow requests with no origin (like mobile apps, Postman, or same-origin)
      if (!origin) {
        console.log("✅ CORS: No origin (same-origin or tools)");
        return callback(null, true);
      }
      
      // Check exact matches
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log("✅ CORS: Exact match allowed");
        callback(null, true);
        return;
      }
      
      // Check pattern matches (Vercel, Netlify, etc.)
      const isPatternMatch = vercelPatterns.some(pattern => pattern.test(origin));
      if (isPatternMatch) {
        console.log("✅ CORS: Pattern match allowed");
        callback(null, true);
        return;
      }
      
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Security headers
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
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Debug log
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Request body:", req.body);
  next();
});

// Register routes
app.use("/api", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expense-invoices", expenseInvoiceRoutes);
app.use("/api/users", userRoutes);
app.use("/api", scanInvoiceRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Serve static files
app.use(express.static("public"));

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/scan", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "scan.html"));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
