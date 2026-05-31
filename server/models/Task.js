const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  status: { type: String, default: "todo" }, // "todo", "in-progress", "done"
  tag: { type: String, default: "General" }, // "Frontend", "Backend", "Bug", "General"
  dueDate: { type: String, default: "" },    // Stores deadline string YYYY-MM-DD
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);