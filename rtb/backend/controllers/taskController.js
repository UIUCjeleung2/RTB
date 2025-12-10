import Task from "../models/Task.js";
import Board from "../models/Board.js";

// Helper function to get task with all nested subtasks recursively
const getTaskWithSubtasks = async (taskId) => {
  try {
    const task = await Task.findById(taskId).lean();
    if (!task) return null;

    const subtasks = await Task.find({ parentTask: taskId }).sort({ position: 1 }).lean();
    const subtasksWithNested = await Promise.all(
      subtasks.map(st => getTaskWithSubtasks(st._id))
    );

    return {
      ...task,
      subtasks: subtasksWithNested
    };
  } catch (err) {
    console.error("Error in getTaskWithSubtasks:", err);
    throw err;
  }
};

// Get all root tasks for a board (tasks without a parent)
export const getBoardTasks = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.id;

    // Verify user owns the board
    const board = await Board.findOne({ _id: boardId, owner: userId });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Get root tasks (no parent)
    const rootTasks = await Task.find({
      board: boardId,
      parentTask: null
    }).sort({ position: 1 });

    // Get full task tree with subtasks for each root task
    const tasksWithSubtasks = await Promise.all(
      rootTasks.map(task => getTaskWithSubtasks(task._id))
    );

    res.json({ tasks: tasksWithSubtasks });
  } catch (err) {
    console.error("Get board tasks error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single task with all its subtasks
export const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user owns the board that contains this task
    const board = await Board.findOne({ _id: task.board, owner: userId });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const taskWithSubtasks = await getTaskWithSubtasks(taskId);
    res.json({ task: taskWithSubtasks });
  } catch (err) {
    console.error("Get task error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new task
export const createTask = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, parentTaskId } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Task title is required" });
    }

    // Verify user owns the board
    const board = await Board.findOne({ _id: boardId, owner: userId });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // If this is a subtask, verify the parent task exists and belongs to the same board
    if (parentTaskId) {
      const parentTask = await Task.findOne({ _id: parentTaskId, board: boardId });
      if (!parentTask) {
        return res.status(404).json({ message: "Parent task not found" });
      }
    }

    // Get the next position for this task level
    const query = { board: boardId };
    if (parentTaskId) {
      query.parentTask = parentTaskId;
    } else {
      query.parentTask = null;
    }

    const maxPosition = await Task.findOne(query).sort({ position: -1 });
    const nextPosition = maxPosition ? maxPosition.position + 1 : 0;

    const task = await Task.create({
      title: title.trim(),
      board: boardId,
      parentTask: parentTaskId || null,
      position: nextPosition,
      status: "todo",
      completed: false
    });

    // If this is a subtask, update parent completion status
    if (parentTaskId) {
      await updateParentCompletion(task._id);
    }

    res.status(201).json({ task });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, status, parentTaskId, position, notes } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user owns the board containing this task
    const board = await Board.findOne({ _id: task.board, owner: userId });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Validate parent task if changing parent
    if (parentTaskId !== undefined && parentTaskId !== task.parentTask?.toString()) {
      if (parentTaskId) {
        const parentTask = await Task.findOne({ _id: parentTaskId, board: task.board });
        if (!parentTask) {
          return res.status(404).json({ message: "Parent task not found" });
        }

        // Prevent circular references (task cannot be parent of itself or ancestors)
        if (parentTaskId === taskId) {
          return res.status(400).json({ message: "A task cannot be its own parent" });
        }
      }

      task.parentTask = parentTaskId || null;
    }

    if (title !== undefined) task.title = title.trim();
    if (status !== undefined && ["todo", "in-progress", "done"].includes(status)) {
      task.status = status;
    }
    if (position !== undefined) task.position = position;
    if (notes !== undefined) task.notes = notes;

    await task.save();
    res.json({ task });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Helper: Recursively mark all subtasks as completed/incompleted
const cascadeCompletionToSubtasks = async (taskId, completed) => {
  const subtasks = await Task.find({ parentTask: taskId });

  for (const subtask of subtasks) {
    subtask.completed = completed;
    subtask.status = completed ? "done" : "todo";
    await subtask.save();

    // Recursively cascade to subtasks' subtasks
    await cascadeCompletionToSubtasks(subtask._id, completed);
  }
};

// Helper: Check if all siblings are complete and update parent accordingly
const updateParentCompletion = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task || !task.parentTask) {
    return; // No parent to update
  }

  // Get all siblings (tasks with same parent)
  const siblings = await Task.find({ parentTask: task.parentTask });

  // Check if all siblings are complete
  const allComplete = siblings.every(sibling => sibling.completed);
  const anyComplete = siblings.some(sibling => sibling.completed);

  // Update parent
  const parent = await Task.findById(task.parentTask);
  if (parent) {
    const wasCompleted = parent.completed;
    parent.completed = allComplete;
    parent.status = allComplete ? "done" : (anyComplete ? "in-progress" : "todo");
    await parent.save();

    // Recursively update grandparent
    if (wasCompleted !== allComplete) {
      await updateParentCompletion(parent._id);
    }
  }
};

// Toggle task complete status
export const toggleTaskComplete = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user owns the board
    const board = await Board.findOne({ _id: task.board, owner: userId });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Toggle completion
    task.completed = !task.completed;
    if (task.completed) {
      task.status = "done";
    } else {
      task.status = "todo";
    }
    await task.save();

    // Cascade completion to all subtasks
    await cascadeCompletionToSubtasks(taskId, task.completed);

    // Update parent completion if this task has a parent
    await updateParentCompletion(taskId);

    res.json({ task });
  } catch (err) {
    console.error("Toggle complete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete task and all its subtasks recursively
const deleteTaskRecursive = async (taskId) => {
  try {
    // Get all subtasks
    const subtasks = await Task.find({ parentTask: taskId });

    // Recursively delete all subtasks
    for (const subtask of subtasks) {
      await deleteTaskRecursive(subtask._id);
    }

    // Delete this task
    await Task.findByIdAndDelete(taskId);
  } catch (err) {
    console.error("Error in deleteTaskRecursive:", err);
    throw err;
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user owns the board
    const board = await Board.findOne({ _id: task.board, owner: userId });
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Save parent ID before deletion
    const parentTaskId = task.parentTask;

    await deleteTaskRecursive(taskId);

    // Update parent completion if this was a subtask
    if (parentTaskId) {
      // Get one of the remaining siblings to trigger parent update
      const remainingSibling = await Task.findOne({ parentTask: parentTaskId });
      if (remainingSibling) {
        await updateParentCompletion(remainingSibling._id);
      } else {
        // No siblings left, just update the parent directly
        const parent = await Task.findById(parentTaskId);
        if (parent) {
          parent.completed = false;
          parent.status = "todo";
          await parent.save();
          // Check if grandparent needs updating
          if (parent.parentTask) {
            const grandparentSibling = await Task.findOne({ parentTask: parent.parentTask });
            if (grandparentSibling) {
              await updateParentCompletion(grandparentSibling._id);
            }
          }
        }
      }
    }

    res.json({ message: "Task and all subtasks deleted successfully" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Reorder tasks (change position within same parent)
export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { taskId, position }
    const userId = req.user.id;

    // Verify user owns all boards these tasks belong to
    const taskIds = tasks.map(t => t.taskId);
    const allTasks = await Task.find({ _id: { $in: taskIds } });

    const boardIds = [...new Set(allTasks.map(t => t.board.toString()))];
    const boards = await Board.find({ _id: { $in: boardIds }, owner: userId });

    if (boards.length !== boardIds.length) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update positions
    const updates = await Promise.all(
      tasks.map(({ taskId, position }) =>
        Task.findByIdAndUpdate(taskId, { position }, { new: true })
      )
    );

    res.json({ tasks: updates });
  } catch (err) {
    console.error("Reorder tasks error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};