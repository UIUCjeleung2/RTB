import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true
  },
  status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: "todo"
  },
  position: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completed: {
  type: Boolean,
  default: false,
  },

});

// Index for querying tasks by board
taskSchema.index({ board: 1, position: 1 });

export default mongoose.model("Task", taskSchema);
