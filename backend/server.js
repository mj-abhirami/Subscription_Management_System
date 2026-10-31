require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./config/db");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in .env");
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, message: "SUBSIGHT API and PostgreSQL are healthy", data: { database: "connected" } });
  } catch {
    res.status(503).json({ success: false, message: "Database unavailable", data: null });
  }
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/plans", require("./routes/planRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/discounts", require("./routes/discountRoutes"));

app.use((req, res) => res.status(404).json({
  success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, data: null
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === "23505") {
    return res.status(409).json({ success: false, message: "A record with this unique value already exists", data: null });
  }
  if (err.code === "23503") {
    return res.status(400).json({ success: false, message: "Referenced record does not exist or is still in use", data: null });
  }
  if (err.code === "23514" || err.code === "22P02") {
    return res.status(400).json({ success: false, message: "Invalid field value", data: null });
  }
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    data: null
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`SUBSIGHT API running at http://localhost:${port}`));
