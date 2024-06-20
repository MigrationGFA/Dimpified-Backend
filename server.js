require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 7070;
const { connectDB } = require("./src/config/dbConnect");
const db = require("./src/config/db.js");
const corsOptions = require("./src/config/corsOptions.js");
const path = require("path");

connectDB();
db();

//cross origin resource sharing
app.use(cors(corsOptions));

// to handle url encoded
app.use(express.urlencoded({ extended: false }));

// build in middleware for json
app.use(express.json());

// Set the static folder for serving HTML, CSS, JS, etc.
app.use(express.static(path.join(__dirname, "src")));

//user routes
app.use("/api/v1", require("./src/routes/authentication"));
app.use("/api/v1", require("./src/routes/creatorCourse"));
app.use("/api/v1", require("./src/routes/customerCare"));
app.use("/api/v1", require("./src/routes/ecosystem"));
app.use("/api/v1/", require("./src/routes/ratingRoutes"));
app.use("/api/v1/", require("./src/routes/domainCheck"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
