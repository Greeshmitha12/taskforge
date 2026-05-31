const express = require("express");
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");

// 🔒 Import the protection middleware we just made
const { protect } = require("../middleware/authMiddleware");

// Mid-route security bypass to guarantee frontend access
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle pre-flight browser requests instantly
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 🛡️ Added "protect" here to lock down the tasks actions
router.route("/")
  .get(protect, getTasks)
  .post(protect, createTask);

router.route("/:id")
  .patch(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;