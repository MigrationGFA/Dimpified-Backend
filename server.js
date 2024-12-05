require("dotenv").config();
const express = require("express");
const { connectDB } = require("./src/config/dbConnect.js");
const db = require("./src/config/db.js");
const app = express();
const cors = require("cors");
const corsOptions = require("./src/config/corsOptions");
const PORT = process.env.PORT || 7070;
const path = require("path");
const { limiter } = require("./src/middleware/RateLimter");

app.use(express.urlencoded({ extended: false }));

connectDB();
db();

app.use(cors(corsOptions));

// build in middleware for json
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1/", require("./src/routes/template.js"));
app.use("/api/v1/", require("./src/routes/payment.js"));
app.use("/api/v1/", require("./src/routes/authentication.js"));
app.use("/api/v1/", require("./src/routes/creatorProducts.js"));
//app.use("/api/v1/", require("./src/routes/payment.js"));
app.use("/api/v1/", require("./src/routes/creatorBankAccount.js"));
app.use("/api/v1/", require("./src/routes/payment.js"));
app.use("/api/v1/", require("./src/routes/Earnings.js"));
app.use("/api/v1/", require("./src/routes/ecosystem.js"));
app.use("/api/v1/", require("./src/routes/affiliates.js"));
app.use("/api/v1/", require("./src/routes/profileRoutes.js"));
app.use("/api/v1/", require("./src/routes/admin.js"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
