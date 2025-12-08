
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

interface TaskProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onSubtaskCreate: () => void;
  onSubtaskCheck: () => void;
  onSubtaskUncheck: () => void;
  onSubtaskDelete: () => void;
  onClickSubtask: () => void;
}

// I also have to pass the above functions to the SubtaskList, so that I can activate them

declare const process: {
  env: {
    REACT_APP_BACKEND_URL: string;
  };
};

export default function Task({title, onTitleChange, onSubtaskCreate, onSubtaskCheck, onSubtaskUncheck, onSubtaskDelete, onClickSubtask} : TaskProps) {

  const DEBUG_BORDER = "1px solid red";

  // Handles the opening and closing of the Menu on the three dots
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(null);
  const [completed, setCompleted] = React.useState(false);
  const open = Boolean(anchorElement);
  const completionPercent = completed ? 100 : 0;


  // const handleToggleComplete = async () => {
  //   // Instant UI toggle
  //   setCompleted((prev) => !prev);
    

  //   try {
      
  //     const response = await fetch(
        
  //       `${process.env.REACT_APP_BACKEND_URL}/api/tasks/${taskId}/toggle-complete`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     const updatedTask = await response.json();

  //     // Sync with backend
  //     setCompleted(updatedTask.completed);
  //   } catch (err) {
  //     console.error("Error toggling complete:", err);
  //   }
  // };

  

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

  // Handle adding a step
  const [subtasks, setSubtasks] = React.useState<string[]>([]);
  const [completedSubtasks, setCompletedSubtasks] = React.useState<boolean[]>([]);
  const handleAddStep = () => {
    setSubtasks(prev => [...prev, `Subtask ${subtasks.length}`]);
    setCompletedSubtasks(prev => [...prev, false]);
    onSubtaskCreate();
  }

  React.useEffect(() => {
    console.log(subtasks);
    console.log(completedSubtasks);
  }, [subtasks, completedSubtasks]);

  return (
    // The actual card
    <Card sx={{ maxWidth: 345, p: 1, borderRadius: 5, flexShrink: 0}} onClick={onClickSubtask}>

      <Box id="subtask" sx={{display: 'flex', flexDirection: "column", justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      

          {/* If we wanna rename the Task, a Textfield will appear */}
          <Box id="header" sx= {{display: "flex", justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <EditableText
            title={title}
            onTitleChange={onTitleChange}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />

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
              <MenuItem onClick={handleAddStep}>Add Step</MenuItem>
              <MenuItem onClick={handleClose}>Delete Step</MenuItem>
              <MenuItem onClick={handleClose}>Change Color</MenuItem>
            </Menu>
          </Box>

          <Box id="subtasklist" sx = {{display: "flex", width: "88%"}}>
              {subtasks.length > 0 && (
                <SubtaskList
                  subtasks={subtasks}
                  completed={completedSubtasks}
                  onToggle={(index: number) => {
                      if (completedSubtasks[index] === false) {
                        onSubtaskCheck();
                      } else {
                        onSubtaskUncheck();                        
                      }
                      setCompletedSubtasks(prev =>
                        prev.map((val, i) => (i === index ? !val : val))
                      );
                    }
                  }
                  onDelete={(index: number) => {
                    setSubtasks(prev => prev.filter((_, i) => i !== index));
                    setCompletedSubtasks(prev => prev.filter((_, i) => i !== index));
                    if (completedSubtasks[index] === true) {
                      onSubtaskUncheck();
                    }
                    onSubtaskDelete();
                  }}
                />
              )}

          </Box>


        </Box>
</Card>

  );
}

function enterSubtask() {
  // TODO:
  // - Spawn new BoardCard with relevant data
  // - Push other things to the back

  console.log("Clicked")
}