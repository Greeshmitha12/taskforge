const Task = require("../models/Task");

// @desc    Get all active blueprint tasks
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a brand new task card
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { text, status } = req.body;
    const task = await Task.create({ text, status });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an item state status position
// @route   PATCH /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a data row task item
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ id: req.params.id, message: "Task removed safely" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};