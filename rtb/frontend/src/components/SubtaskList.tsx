import * as React from "react";
import {Box, Button, Typography, IconButton} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface SubtaskListProps {
    subtasks: string[];
    completed: boolean[];
    onToggle: (index: number) => void;
}

export default function SubtaskList({subtasks, completed, onToggle}: SubtaskListProps) {

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "88%", width: "100%" }}>
            {/* Task list box, scrollable */}
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%", overflowY: "auto", gap: 1 }}>
                {subtasks.map((task, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton aria-label="toggle complete" onClick={() => onToggle(index)}>
                            {completed[index] ? <CheckCircleIcon color="success"/> : <CheckCircleOutlineIcon />}
                        </IconButton>
                        <Typography variant="body1" color="black">{task}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}
