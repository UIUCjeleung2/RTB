
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
import {Typography, Box, Menu, MenuItem, TextField, ClickAwayListener} from "@mui/material";
import EditableText from './EditableText.tsx';
import SubtaskList from './SubtaskList.tsx';

interface SubtaskItem {
  _id: string;
  title: string;
  completed: boolean;
  status: string;
  subtasks?: SubtaskItem[];
}

interface TaskProps {
  taskId: string;
  title: string;
  completed?: boolean;
  subtasks?: SubtaskItem[];
  onTitleChange: (newTitle: string) => void;
  onTasksChange?: () => void;
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
    // Instant UI toggle for responsiveness
    setIsCompleted((prev) => !prev);

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
        // Refresh all tasks from server to get accurate state
        onTasksChange?.();
      } else {
        // Revert on error
        setIsCompleted(prev => !prev);
      }
    } catch (err) {
      console.error("Error toggling complete:", err);
      // Revert on error
      setIsCompleted(prev => !prev);
    }
  };

  // Handlers for those actions
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
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
        // Refresh all tasks from server to get accurate state
        onTasksChange?.();
      }
    } catch (error) {
      console.error("Error toggling subtask complete:", error);
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

  return (
    // The actual card
    <Card sx={{ maxWidth: 345, p: 1, borderRadius: 5, flexShrink: 0}}>

      <Box id="subtask" sx={{display: 'flex', flexDirection: "column", justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      

          {/* If we wanna rename the Task, a Textfield will appear */}
          <Box id="header" sx= {{display: "flex", justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box
            onClick={() => {
              if (!isEditing) setIsEditing(true);
            }}
            sx={{ cursor: 'pointer', flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleComplete();
              }}
            >
              {isCompleted ? (
                <CheckCircleIcon sx={{ color: "green" }} />
              ) : (
                <CheckCircleOutlineIcon />
              )}
            </IconButton>
            <EditableText
              title={title}
              onTitleChange={onTitleChange}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </Box>

            <IconButton aria-label="settings" onClick={handleOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElement}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
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
                />
              )}

          </Box>


        </Box>
</Card>

  );
}
