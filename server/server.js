const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// 1. Load our secret environment variables first
dotenv.config();

// 2. Initialize our Express application
const app = express();

// 3. Fire up the connection to our MongoDB Cloud Database
connectDB();

// 4. Middleware to handle data sharing and parsing incoming JSON data
app.use(cors({
  origin: true,
  credentials: true
}));
app.options("*", cors());

app.use(express.json());

// 5. Mount our API Doorway Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// Main test route
app.get("/", (req, res) => {
  res.send("API Running");
});

// 6. Define our network port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});