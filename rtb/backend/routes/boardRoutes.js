import express from "express";
import Task from "../models/Task.js";

import {
  getAllBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  toggleArchiveBoard,
} from "../controllers/boardController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.patch("/tasks/:id/toggle-complete", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed; // flip value
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("Toggle complete error:", err);
    res.status(500).json({ message: "Server error toggling task complete" });
  }
});
// All routes require authentication
router.use(auth);

// Get all boards for user
router.get("/", getAllBoards);

// Get single board
router.get("/:boardId", getBoard);

// Create new board
router.post("/", createBoard);

// Update board
router.patch("/:boardId", updateBoard);

// Delete board
router.delete("/:boardId", deleteBoard);

// Archive/unarchive board
router.patch("/:boardId/archive", toggleArchiveBoard);

export default router;
