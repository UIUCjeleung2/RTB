import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from "@mui/material/CardActions";
import CardHeader from '@mui/material/CardHeader';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Typography, Box, Menu, MenuItem, TextField, ClickAwayListener} from "@mui/material";
import EditableText from './EditableText.tsx';

interface TaskProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
}

export default function Task({title, onTitleChange} : TaskProps) {


  // Handles the opening and closing of the Menu on the three dots
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(null);
  const [completed, setCompleted] = React.useState(false);
  const open = Boolean(anchorElement);

  const handleToggleComplete = () => {
    setCompleted((prev) => !prev);
  };

  // Handlers for those actions
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };

  // Close should handle
  const handleClose = () => {
    setAnchorElement(null);
  }

  // Handles renaming the tasks
  const [isEditing, setIsEditing] = React.useState(false);

  // Makes the Tect go into Edit mode, and closes the menu
  const handleRename = () => {
    setIsEditing(true);
    handleClose();
  }

  return (
    // The actual card
    <Card sx={{ maxWidth: 345, p: 1 }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

          {/* If we wanna rename the Task, a Textfield will appear */}
          <EditableText
            title = {title}
            onTitleChange={onTitleChange}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          ></EditableText>

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
            <MenuItem onClick={handleClose}>Add Step</MenuItem>
            <MenuItem onClick={handleClose}>Delete Step</MenuItem>
            <MenuItem onClick={handleClose}>Change Color</MenuItem>
          </Menu>

          <CardActions disableSpacing>
            <IconButton aria-label="toggle complete" onClick={handleToggleComplete}>
              {completed ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CheckCircleOutlineIcon />
              )}
            </IconButton>
          </CardActions>

        </Box>
</Card>

  );
}
