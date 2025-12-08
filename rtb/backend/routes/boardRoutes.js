import express from "express";
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
