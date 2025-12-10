import Board from "../models/Board.js";
import Task from "../models/Task.js";

// Get all boards for logged-in user
export const getAllBoards = async (req, res) => {
  try {
    const userId = req.user.id;

    const boards = await Board.find({ owner: userId, isArchived: false })
      .sort({ lastAccessedAt: -1 })
      .select("title description color createdAt updatedAt");

    // Get task count for each board
    const boardsWithTaskCount = await Promise.all(
      boards.map(async (board) => {
        const taskCount = await Task.countDocuments({ board: board._id });
        return {
          ...board.toObject(),
          taskCount,
        };
      })
    );

    res.json({ boards: boardsWithTaskCount });
  } catch (err) {
    console.error("Get boards error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single board by ID
export const getBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    const board = await Board.findOne({ _id: boardId, owner: userId });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Update last accessed time
    board.lastAccessedAt = new Date();
    await board.save();

    // Get tasks for this board

    // FOUND THE PROBLEM
    const tasks = await Task.find({ board: boardId }).sort({ position: 1 });

    res.json({ board, tasks });
  } catch (err) {
    console.error("Get board error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new board
export const createBoard = async (req, res) => {
  try {
    const { title, description, color } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Board title is required" });
    }

    const board = await Board.create({
      title: title.trim(),
      description: description || "",
      color: color || "#1677FF",
      owner: userId,
    });

    console.log("Board created:", board.title, "by user:", userId);

    res.status(201).json({ board });
  } catch (err) {
    console.error("Create board error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update board
export const updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, color } = req.body;
    const userId = req.user.id;

    const board = await Board.findOne({ _id: boardId, owner: userId });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (title !== undefined) board.title = title.trim();
    if (description !== undefined) board.description = description;
    if (color !== undefined) board.color = color;

    await board.save();

    console.log("Board updated:", board.title);

    res.json({ board });
  } catch (err) {
    console.error("Update board error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete board (and all its tasks)
export const deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    const board = await Board.findOne({ _id: boardId, owner: userId });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Delete all tasks in this board
    const deleteResult = await Task.deleteMany({ board: boardId });

    // Delete the board
    await Board.findByIdAndDelete(boardId);

    console.log(
      `Board deleted: ${board.title} (${deleteResult.deletedCount} tasks removed)`
    );

    res.json({
      message: "Board deleted successfully",
      tasksDeleted: deleteResult.deletedCount,
    });
  } catch (err) {
    console.error("Delete board error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Archive/Unarchive board
export const toggleArchiveBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    const board = await Board.findOne({ _id: boardId, owner: userId });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    board.isArchived = !board.isArchived;
    await board.save();

    console.log(
      `Board ${board.isArchived ? "archived" : "unarchived"}:`,
      board.title
    );

    res.json({ board });
  } catch (err) {
    console.error("Archive board error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Add task to board
export const addTaskToBoard = async (req, res) => {
  try {
    const {boardId} = req.params;
    const userId = req.user.id;

    const board = await Board.findOne({_id: boardId, owner: userId});

    if (!board) {
      return res.status(404).json({message: "Board not found"});
    }

    const task = await Task.create({
      title: `Subtask ${board.tasks.length}`,
      board: boardId,
      status: "todo",
      position: board.tasks.length,
      completed: false
    });

    board.tasks.push(task._id);
    await board.save();

    res.status(201).json(task);

  } catch (err) {
    console.error("Add task error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}