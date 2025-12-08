import { useEffect, useState } from "react";
import { Typography, Button, Box, LinearProgress } from "@mui/material";
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
    
    // State for the progress bar
    const [numberOfSubtasks, setNumberOfSubtasks] = useState(0);
    const [completed, setCompleted] = useState(0);

    useEffect(() => {
        console.log(completed, "updated");
        var yes = numberOfSubtasks === 0 ? 0 : (completed / numberOfSubtasks) * 100;
        console.log(yes, "result");
        console.log(numberOfSubtasks, "numberOfSubtasks");
    }, [completed]);

    // Whenever we create a subtask in SubtaskList, add it
    const onSubtaskCreate = () => {
        setNumberOfSubtasks(numberOfSubtasks + 1);
    }

    // Whenever we check a subtask, add one
    const onSubtaskCheck = () => {
        setCompleted(completed + 1);
    }

    const onSubtaskUncheck = () => {
        setCompleted(completed - 1);
    }

    const onSubtaskDelete = () => {
        setNumberOfSubtasks(numberOfSubtasks - 1);
    }

    return (
        <Box sx = {{display: "flex", flexDirection: "column", height: "88%", width: "100%"}}>
            
            <LinearProgress 
                      variant="determinate" 
                      value={
                        numberOfSubtasks === 0 ? 0 : (completed / numberOfSubtasks) * 100
                      } 
                      sx={{ height: 8, borderRadius: 5, marginBottom: 2 }}
            />
            

            {/* Task list box, overflowY makes it scrollable */}
            <Box sx = {{display: "flex", flexDirection: "column", width: "100%", overflowY: "auto", gap: 1}}>
                {tasks.map((task, index)=> (
                    <Task key={index} title={task} onTitleChange={(newTitle) => updateTaskTitle(index, newTitle)}
                          onSubtaskCreate={() => onSubtaskCreate()} onSubtaskCheck={() => onSubtaskCheck()} 
                          onSubtaskUncheck={() => onSubtaskUncheck()} onSubtaskDelete={() => onSubtaskDelete()}
                    />
                ))}
            </Box>

            {/* We need an onSubtaskCheck function */}

            {/* Add task button, with the proper callback */}
            <Button onClick={addTask} sx = {{mt: 2, width: "100%"}}>
                <Typography variant="body1" color="black">+ Add Task</Typography>
            </Button>
        </Box>

    )
};