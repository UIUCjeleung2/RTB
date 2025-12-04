import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

router.patch("/:id/toggle-complete", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("Toggle complete error:", err);
    res.status(500).json({ message: "Server error toggling task complete" });
  }
});

export default router;
