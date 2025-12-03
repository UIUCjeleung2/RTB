// Subtask card within the board card. This is just a copy
// of MUI's Card component, so it is subject to change.

import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {Menu, MenuItem} from "@mui/material";


interface TaskProps {
  title: string;
}

export default function Task({title} : TaskProps) {

  // const [isEditing, setIsEditing] = React.useState(false);

  // Handles the opening and closing of the Menu on the three dots
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorElement);

  // Handlers for those actions
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  }

  return (
    // The actual card
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        action={
          <>
          <IconButton aria-label="settings" onClick={handleOpen}>
            <MoreVertIcon />
          </IconButton>
          
          {/* A bunch of menu items */}
          <Menu
            anchorEl={anchorElement}
            open = {open}
            onClose = {handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left"
            }}>
            <MenuItem onClick={handleClose}>Rename</MenuItem>
            <MenuItem onClick={handleClose}>Add Step</MenuItem>
            <MenuItem onClick={handleClose}>Delete Step</MenuItem>
            <MenuItem onClick={handleClose}>Change Color</MenuItem>
          </Menu>
          </>

        }
        title={title}
      />
    </Card>
  );
}