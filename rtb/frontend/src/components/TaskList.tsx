import { useState } from "react";
import { Typography, Button, Box} from "@mui/material";
import Task from "./Task.tsx";

// The TaskList holds all the task cards in a scrollable area
// and fixes the Add Task button at the bottom.

export default function TaskList() {
    const [tasks, setTasks] = useState<string[]>([]);

    // Function that the click button calls
    const addTask = () => {
        setTasks(prev => [...prev, `Subtask ${prev.length + 1}`]);
    };

    const updateTaskTitle = (index: number, newTitle: string) => {
        setTasks(prev => {
            const updatedTasks = [...prev];
            updatedTasks[index] = newTitle;
            return updatedTasks;
        });
    };

    return (
        <Box sx = {{display: "flex", flexDirection: "column", height: "88%", width: "100%"}}>
            
            {/* Task list box, overflowY makes it scrollable */}
            <Box sx = {{display: "flex", flexDirection: "column", width: "100%", overflowY: "auto", gap: 1}}>
                {tasks.map((task, index)=> (
                    <Task key={index} title={task} onTitleChange={(newTitle) => updateTaskTitle(index, newTitle)}/>
                ))}
            </Box>

            {/* Add task button, with the proper callback */}
            <Button onClick={addTask} sx = {{mt: 2, width: "100%"}}>
                <Typography variant="body1" color="black">+ Add Task</Typography>
            </Button>
        </Box>

    )
};