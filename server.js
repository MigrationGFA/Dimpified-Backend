require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 7070;
const { connectDB } = require("./src/config/dbConnect");
const db = require("./src/config/db.js");
const corsOptions = require("./src/config/corsOptions.js");
const path = require("path");
const { limiter } = require("./src/middleware/RateLimiter");

connectDB();
db();

//cross origin resource sharing
app.use(cors(corsOptions));

// to handle url encoded
app.use(express.urlencoded({ extended: false }));

// build in middleware for json
app.use(express.json({ limit: "10mb" }));

// Set Cache-Control headers globally for all routes
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0
  res.setHeader("Expires", "0"); // Proxies
  next();
});

app.set("trust proxy", 1);

//webhook
app.use(express.raw({ type: "application/json" }));

// Set the static folder for serving HTML, CSS, JS, etc.
app.use(express.static(path.join(__dirname, "src")));
app.use("/uploads", express.static("uploads"));

app.get("/files/ms14991499.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "uploads", "ms14991499.txt.json"));
});

app.use(limiter);
//user routes
app.use("/api/v1", require("./src/routes/authentication"));
app.use("/api/v1", require("./src/routes/creatorProducts"));
app.use("/api/v1", require("./src/routes/customerCare"));
app.use("/api/v1", require("./src/routes/ecosystem"));
app.use("/api/v1/", require("./src/routes/ratingRoutes"));
app.use("/api/v1/", require("./src/routes/domainCheck"));
app.use("/api/v1/", require("./src/routes/templates"));
app.use("/api/v1/", require("./src/routes/forms"));
app.use("/api/v1/", require("./src/routes/creatorDashboard"));
app.use("/api/v1/", require("./src/routes/EcosystemConflictResolution.js"));
app.use("/api/v1/", require("./src/routes/payment"));
app.use("/api/v1/", require("./src/routes/setting"));
app.use("/api/v1/", require("./src/routes/serviceRequest"));
app.use("/api/v1/", require("./src/routes/booking"));
app.use("/api/v1/", require("./src/routes/admin.js"));
app.use("/api/v1/", require("./src/routes/affiliate.js"));
app.use("/api/v1/", require("./src/routes/newCreator.js"));

app.use("/api/v1/", require("./src/routes/community"));
app.use("/api/v1/", require("./src/routes/gfa"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
