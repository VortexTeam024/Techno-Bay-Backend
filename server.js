// Disable Vercel's default body parsing so Multer can access raw multipart streams
module.exports.config = {
  api: { bodyParser: false }
};

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

// Initialize Express application
const app = express();

const port = process.env.PORT || 7777;

// Connect to MongoDB at startup
connectDB();
console.log("Connected to DB");

// Trust the first proxy (e.g., Vercel or any forward proxy) so that X-Forwarded-For headers are respected
app.set('trust proxy', 1); // see: https://expressjs.com/en/guide/behind-proxies.html

// Parse JSON bodies up to 20kb for non-multipart routes
app.use(express.json({ limit: '20kb' }));

if (process.env.NODE_ENV === "development") {
  // Log HTTP requests in development mode
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

// Prevent HTTP parameter pollution (security)
app.use(hpp());

// Set various HTTP headers for security
app.use(helmet());

// Enable CORS for all origins (adjust or whitelist in production as needed)
app.use(cors());

// Compress response bodies for all requests to reduce bandwidth
app.use(compression());

// Rate limiting to mitigate brute-force and DDoS attacks
const limiter = rateLimiting({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,                 // limit each IP to 200 requests per windowMs
});
app.use(limiter);

// Mount all application routes
const mountRoutes = require("./routes/main");
mountRoutes(app);

// Handle undefined routes with a 400-level error
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalError);

// Handle unhandled promise rejections to gracefully shut down
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled rejection: ${err.name} | ${err.message}`);
  if (server) {
    server.close(() => {
      console.error(`Shutting down due to unhandled rejection...`);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Start server locally
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export the Express app as the default handler for Vercel
// Vercel will invoke this function for incoming requests
module.exports = app;