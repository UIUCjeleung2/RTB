import * as React from "react";
import {Box, Button, Typography, IconButton} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Delete } from "@mui/icons-material";
import EditableText from './EditableText.tsx';

interface SubtaskItem {
  _id: string;
  title: string;
  completed: boolean;
  status: string;
  subtasks?: SubtaskItem[];
}

interface SubtaskListProps {
    subtasks: SubtaskItem[];
    onToggle: (subtaskId: string) => void;
    onDelete: (subtaskId: string) => void;
    onRename: (subtaskId: string, newTitle: string) => void;
    onOptimisticToggle?: (taskId: string, currentCompleted: boolean) => void;
}

export default function SubtaskList({subtasks, onToggle, onDelete, onRename, onOptimisticToggle}: SubtaskListProps) {
    const [editingId, setEditingId] = React.useState<string | null>(null);

    return (
        <Box sx={{ display: "flex", bgcolor: "#d6d6d6ff", borderRadius: 5, flexDirection: "column", width: "100%"}}>
        {/* Task list box, scrollable */}
            {subtasks.map((task) => (
                <Box key={task._id} sx={{ display: "flex", justifyContent: "space-between", width: "100%", overflowY: "auto", mb: 0, alignItems: "center", p: 0.5 }}>

                    <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                        <IconButton 
                          size="small"
                          aria-label="toggle complete" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggle(task._id);
                          }}
                        >
                            {task.completed ? <CheckCircleIcon color="success"/> : <CheckCircleOutlineIcon />}
                        </IconButton>
                        <Box 
                          onClick={(e) => {e.stopPropagation(); setEditingId(task._id); }}
                          sx={{ cursor: 'pointer', flex: 1 }}
                        >
                          <EditableText 
                            title={task.title}
                            onTitleChange={(newTitle) => {
                              onRename(task._id, newTitle);
                              setEditingId(null);
                            }}
                            isEditing={editingId === task._id}
                            setIsEditing={(editing) => {
                              if (editing) {
                                setEditingId(task._id);
                              } else {
                                setEditingId(null);
                              }
                            }}
                          />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton 
                          size="small"
                          aria-label="delete" 
                          onClick={(event) => { event.stopPropagation(); onDelete(task._id); } }
                        >
                            <Delete />
                        </IconButton>
                    </Box>

                </Box>

            ))}
        </Box>
    )
}
