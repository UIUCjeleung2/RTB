import express from "express";
import {
  getBoardTasks,
  getTask,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  reorderTasks
} from "../controllers/taskController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Reorder tasks (must come before /:taskId to avoid route conflict)
router.patch("/reorder", reorderTasks);

// Get all root tasks for a board (with nested subtasks)
router.get("/board/:boardId", getBoardTasks);

// Create new task (can be root or subtask)
router.post("/board/:boardId", createTask);

// Toggle task complete status (must come before /:taskId)
router.patch("/:taskId/toggle-complete", toggleTaskComplete);

// Update task
router.patch("/:taskId", updateTask);

// Get single task with all subtasks
router.get("/:taskId", getTask);

// Delete task and all subtasks
router.delete("/:taskId", deleteTask);

export default router;