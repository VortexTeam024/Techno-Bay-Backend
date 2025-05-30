require("dotenv").config();
const express = require("express");
const hpp = require("hpp");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimiting = require("express-rate-limit");
const helmet = require("helmet");
const connectDB = require("./config/connectDB");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/error.middleware");

const port = process.env.PORT || 7777;

// Routes
const mountRoutes = require("./routes/main");

//** Connect to MongoDB
connectDB();

const app = express();

//** Middleware for parsing JSON requests
app.use(express.json({'limit' : '20kb'}));

app.set('trust proxy', 1);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

//** Prevent Http Param Pollution
app.use(hpp());
//** Security Headers (helmet)
app.use(helmet());
//** cors middleware
app.use(cors("*"));
//** Compression middleware (compression)
app.use(compression("*"));
//** Rate Limiting
app.use(
  rateLimiting({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200,
  })
);

// Mount routes
mountRoutes(app);

// ➡️ Add this error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: "error",
      message: `Multer error: ${err.message}`,
      field: err.field // This will show the problematic field
    });
  }
  next(err);
});

// 404 Handler
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalError);

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled rejection : ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`App shut down...`);
    process.exit(1);
  });
});