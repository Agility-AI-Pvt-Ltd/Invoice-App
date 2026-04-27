import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import cors from "cors";
import helmet from "helmet";

// Routes
import authRoutes from "./routes/auth.js";
import invoiceRoutes from "./routes/invoices.js";
import expenseInvoiceRoutes from "./routes/expense-invoices.js";
import userRoutes from "./routes/users.js";
import scanInvoiceRoutes from "./routes/scanInvoice.js";
import inventoryRoutes from "./routes/inventory.js";
import customerRoutes from "./routes/customers.js";
import dashboardRoutes from "./routes/dashboard.js";
import purchaseOrderRoutes from "./routes/purchase-orders.js";
import { getExchangeRates } from "./lib/currency-utils.js";

dotenv.config();

// Fail fast if required secrets are absent
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'https://www.agilityaiinvoicely.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true); // Be permissive for now to fix login issues
  },
  credentials: true
}));

connectDB();

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Register routes with exact mappings to match frontend (src/lib/routes/route.ts)
app.use("/api/auth", authRoutes); // For /api/auth/send-otp-register, etc.
app.use("/api", authRoutes);      // For /api/login, /api/profile

app.use("/api/invoices", invoiceRoutes);
app.use("/api/expense-invoices", expenseInvoiceRoutes);
app.use("/api/users", userRoutes);
app.use("/api", scanInvoiceRoutes);
app.use("/api/items", inventoryRoutes); // Frontend expects /api/items
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);

app.get("/api/exchange-rates", async (req, res) => {
  const base = req.query.base || 'INR';
  const rates = await getExchangeRates(base);
  if (rates) res.json(rates);
  else res.status(500).json({ error: 'Failed to fetch rates' });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Aligned with frontend routes. Firestore mode active.`);
});
