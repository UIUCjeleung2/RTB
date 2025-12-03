import { useState } from "react";
import { Typography, Button, Box} from "@mui/material";
import Task from "./Task.tsx";

// The TaskList holds all the task cards in a scrollable area
// and fixes the Add Task button at the bottom.

export default function TaskList() {
    const [tasks, setTasks] = useState<string[]>([]);

    // Function that the click button calls
    const addTask = () => {
        setTasks(prev => [...prev, `Task ${prev.length + 1}`]);
    };

    return (
        <Box sx = {{display: "flex", flexDirection: "column", height: "88%", width: "100%"}}>
            
            {/* Task list box, overflowY makes it scrollable */}
            <Box sx = {{width: "100%", overflowY: "auto"}}>
                {tasks.map((task, index)=> (
                    <Task key={index} />
                ))}
            </Box>

            {/* Add task button, with the proper callback */}
            <Button onClick={addTask} sx = {{mt: 2, width: "100%"}}>
                <Typography variant="body1" color="black">+ Add Task</Typography>
            </Button>
        </Box>

    )
};