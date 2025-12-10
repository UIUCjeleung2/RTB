
import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from "@mui/material/CardActions";
import CardHeader from '@mui/material/CardHeader';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LinearProgress from "@mui/material/LinearProgress";
import { CardContent } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DescriptionIcon from '@mui/icons-material/Description';
import {Typography, Box, Menu, MenuItem, TextField, ClickAwayListener, Tooltip} from "@mui/material";
import EditableText from './EditableText.tsx';
import SubtaskList from './SubtaskList.tsx';

interface SubtaskItem {
  _id: string;
  title: string;
  completed: boolean;
  status: string;
  subtasks?: SubtaskItem[];
  notes?: string;
}

interface TaskProps {
  taskId: string;
  title: string;
  completed?: boolean;
  subtasks?: SubtaskItem[];
  onTitleChange: (newTitle: string) => void;
  onTasksChange?: () => void;
  onOptimisticToggle?: (taskId: string, currentCompleted: boolean) => void;
  onClickSubtask: () => void;
  onTaskSelect?: () => void;
  isSelected?: boolean;
}

declare const process: {
  env: {
    REACT_APP_BACKEND_URL: string;
  };
};

export default function Task({
  taskId,
  title,
  completed = false,
  subtasks = [],
  onTitleChange,
  onTasksChange,
  onOptimisticToggle,
  onClickSubtask,
  onTaskSelect,
  isSelected = false,
}: TaskProps) {

  const DEBUG_BORDER = "1px solid red";
  const token = localStorage.getItem("token");
  const boardId = localStorage.getItem("boardId");

  // Handles the opening and closing of the Menu on the three dots
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(null);
  const [isCompleted, setIsCompleted] = React.useState(completed);
  const open = Boolean(anchorElement);
  const completionPercent = isCompleted ? 100 : 0;

  // Sync isCompleted with completed prop when it changes
  React.useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  const handleToggleComplete = async () => {
    // Optimistic update - instant UI response
    if (onOptimisticToggle) {
      onOptimisticToggle(taskId, completed);
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/${taskId}/toggle-complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        // Refresh all tasks from server to sync with backend state
        onTasksChange?.();
      } else {
        // Revert on error
        console.error("Toggle failed, reverting");
        if (onOptimisticToggle) {
          onOptimisticToggle(taskId, !completed);
        }
      }
    } catch (err) {
      console.error("Error toggling complete:", err);
      // Revert on error
      if (onOptimisticToggle) {
        onOptimisticToggle(taskId, !completed);
      }
    }
  };

  // Handlers for those actions
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorElement(event.currentTarget);
  };

  // Closes the menu
  const handleClose = () => {
    setAnchorElement(null);
  }

  // Handles renaming the tasks
  const [isEditing, setIsEditing] = React.useState(false);

  // Makes the Text go into Edit mode, and closes the menu
  const handleRename = () => {
    setIsEditing(true);
    handleClose();
  }

  // No local subtask state - rely on props and server refresh

  const handleAddStep = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/board/${boardId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            title: "New Subtask",
            parentTaskId: taskId,
          }),
        }
      );

      if (response.ok) {
        // Refresh all tasks from server
        onTasksChange?.();
      }
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        // Task deleted successfully - parent component should refresh
        handleClose();
        onTasksChange?.();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/${subtaskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        // Refresh all tasks from server
        onTasksChange?.();
      }
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  const handleToggleSubtaskComplete = async (subtaskId: string) => {
    // Find subtask to get its current completed state
    const findSubtask = (tasks: SubtaskItem[], id: string): SubtaskItem | null => {
      for (const task of tasks) {
        if (task._id === id) return task;
        if (task.subtasks) {
          const found = findSubtask(task.subtasks, id);
          if (found) return found;
        }
      }
      return null;
    };

    const subtask = findSubtask(subtasks, subtaskId);
    if (subtask && onOptimisticToggle) {
      // Optimistic update
      onOptimisticToggle(subtaskId, subtask.completed);
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/${subtaskId}/toggle-complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        // Refresh all tasks from server to sync
        onTasksChange?.();
      } else {
        // Revert on error
        if (subtask && onOptimisticToggle) {
          onOptimisticToggle(subtaskId, !subtask.completed);
        }
      }
    } catch (error) {
      console.error("Error toggling subtask complete:", error);
      // Revert on error
      if (subtask && onOptimisticToggle) {
        onOptimisticToggle(subtaskId, !subtask.completed);
      }
    }
  };

  const handleRenameSubtask = async (subtaskId: string, newTitle: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/${subtaskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ title: newTitle }),
        }
      );

      if (response.ok) {
        // Refresh all tasks from server
        onTasksChange?.();
      }
    } catch (error) {
      console.error("Error renaming subtask:", error);
    }
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskSelect?.();
  };

  return (
    // The actual card
    <Card
      sx={{
        maxWidth: 345,
        p: 1,
        borderRadius: 5,
        flexShrink: 0,
        cursor: 'pointer',
        border: isSelected ? '3px solid #1976d2' : '1px solid #e0e0e0',
        backgroundColor: isSelected ? '#e3f2fd' : '#ffffff',
        transition: 'all 0.2s ease',
      }}
      onClick={onClickSubtask}
    >

      <Box id="subtask" sx={{display: 'flex', flexDirection: "column", justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      

          {/* If we wanna rename the Task, a Textfield will appear */}
          <Box id="header" sx= {{display: "flex", justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box
            sx={{
              cursor: 'pointer',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 0,
              overflow: 'hidden'
            }}
            onClick={(e) => { if(isEditing) e.stopPropagation(); }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleComplete();
              }}
              sx={{ flexShrink: 0 }}
            >
              {isCompleted ? (
                <CheckCircleIcon sx={{ color: "green" }} />
              ) : (
                <CheckCircleOutlineIcon />
              )}
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <EditableText
                title={title}
                onTitleChange={onTitleChange}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            </Box>
          </Box>

            <Box sx={{ display: 'flex', flexShrink: 0 }}>
              <Tooltip title="View notes">
                <IconButton
                  aria-label="notes"
                  onClick={handleNotesClick}
                  sx={{
                    color: isSelected ? '#1976d2' : 'inherit',
                  }}
                >
                  <DescriptionIcon />
                </IconButton>
              </Tooltip>
              <IconButton aria-label="settings" onClick={handleOpen}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Menu
              anchorEl={anchorElement}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              onClick={(event) => { event.stopPropagation() }}  // Prevents accidental triggering of opening a subtask
            >
              <MenuItem onClick={handleRename}>Rename</MenuItem>
              <MenuItem onClick={handleAddStep}>Add Subtask</MenuItem>
              <MenuItem onClick={handleDeleteTask}>Delete</MenuItem>
              <MenuItem onClick={handleClose}>Change Color</MenuItem>
            </Menu>
          </Box>

          <Box id="subtasklist" sx = {{display: "flex", width: "88%"}}>
              {subtasks.length > 0 && (
                <SubtaskList
                  subtasks={subtasks}
                  onToggle={handleToggleSubtaskComplete}
                  onDelete={handleDeleteSubtask}
                  onRename={handleRenameSubtask}
                  onOptimisticToggle={onOptimisticToggle}
                />
              )}

          </Box>


        </Box>
</Card>

  );
}
