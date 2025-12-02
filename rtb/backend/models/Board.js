import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: "#1677FF"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
boardSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for querying user's boards
boardSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("Board", boardSchema);
