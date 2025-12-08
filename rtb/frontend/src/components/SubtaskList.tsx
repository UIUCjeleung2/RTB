import * as React from "react";
import {Box, Button, Typography, IconButton} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Delete } from "@mui/icons-material";

interface SubtaskListProps {
    subtasks: string[];
    completed: boolean[];
    onToggle: (index: number) => void;
}

export default function SubtaskList({subtasks, completed, onToggle}: SubtaskListProps) {

    return (
        <Box sx={{ display: "flex", bgcolor: "#d6d6d6ff", borderRadius: 5, flexDirection: "column", width: "100%"}}>
        {/* Task list box, scrollable */}
            {subtasks.map((task, index) => (
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", overflowY: "auto", mb: index !== subtasks.length - 1 ? -1 : 0}}>

                    <Box key={`Header ${index}`} sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton aria-label="toggle complete" onClick={() => onToggle(index)}>
                            {completed[index] ? <CheckCircleIcon color="success"/> : <CheckCircleOutlineIcon />}
                        </IconButton>
                        <Typography variant="body1" color="black">{task}</Typography>                        
                    </Box>

                    <Box key={`Tail ${index}`} sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton aria-label="toggle complete" onClick={() => onToggle(index)}>
                            {completed[index] ? <Delete/> : <Delete/>}
                        </IconButton>
                    </Box>


                </Box>

            ))}
        </Box>
    )
}
