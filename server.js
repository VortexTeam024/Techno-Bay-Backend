// Disable Vercel's default body parsing
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
const serverless = require("serverless-http");

// Initialize Express
const app = express();

//** Connect to MongoDB
connectDB();

//** Trust proxy (e.g., when behind Vercel or another load balancer)
app.set('trust proxy', 1);

//** Middleware for parsing JSON requests
app.use(express.json({ limit: '20kb' }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

//** Prevent HTTP Parameter Pollution
app.use(hpp());
//** Security Headers (helmet)
app.use(helmet());
//** CORS middleware
app.use(cors());
//** Compression middleware
app.use(compression());
//** Rate Limiting
const limiter = rateLimiting({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
});
app.use(limiter);

// Routes
const mountRoutes = require("./routes/main");
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});
app.use(globalError);

// Export the handler for Vercel
module.exports = serverless(app);