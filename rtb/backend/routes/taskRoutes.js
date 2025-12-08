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

// Get all root tasks for a board (with nested subtasks)
router.get("/board/:boardId", getBoardTasks);

// Get single task with all subtasks
router.get("/:taskId", getTask);

// Create new task (can be root or subtask)
router.post("/board/:boardId", createTask);

// Update task
router.patch("/:taskId", updateTask);

// Toggle task complete status
router.patch("/:taskId/toggle-complete", toggleTaskComplete);

// Delete task and all subtasks
router.delete("/:taskId", deleteTask);

// Reorder tasks
router.patch("/reorder", reorderTasks);

export default router;
