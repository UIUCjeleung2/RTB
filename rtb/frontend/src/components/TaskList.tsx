import { useEffect, useState } from "react";
import { Typography, Button, Box, LinearProgress } from "@mui/material";
import Task from "./Task.tsx";

interface TaskItem {
  _id: string;
  title: string;
  completed: boolean;
  status: string;
  subtasks?: TaskItem[];
  board: string;
}

interface TaskListProps {
  boardId?: string;
  tasks?: TaskItem[];
  onTasksChange?: (tasks: TaskItem[]) => void;
}

// The TaskList holds all the task cards in a scrollable area
// and fixes the Add Task button at the bottom.

export default function TaskList({ boardId, tasks = [], onTasksChange }: TaskListProps) {
    const [localTasks, setLocalTasks] = useState<TaskItem[]>(tasks);
    const [numberOfSubtasks, setNumberOfSubtasks] = useState(0);
    const [completed, setCompleted] = useState(0);
    const token = localStorage.getItem("token");

    useEffect(() => {
        setLocalTasks(tasks);
        calculateProgress(tasks);
    }, [tasks]);

    const calculateProgress = (taskList: TaskItem[]) => {
        let totalSubtasks = 0;
        let completedCount = 0;

        const countSubtasks = (task: TaskItem) => {
            if (task.subtasks && task.subtasks.length > 0) {
                task.subtasks.forEach(subtask => {
                    totalSubtasks++;
                    if (subtask.completed) completedCount++;
                    countSubtasks(subtask);
                });
            }
        };

        taskList.forEach(task => {
            countSubtasks(task);
        });

        setNumberOfSubtasks(totalSubtasks);
        setCompleted(completedCount);
    };

    // Add a new root task
    const addTask = async () => {
        if (!boardId) return;

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
                        title: "New Task",
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const newTasks = [...localTasks, data.task];
                setLocalTasks(newTasks);
                onTasksChange?.(newTasks);
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleUpdateTaskTitle = async (taskId: string, newTitle: string) => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/tasks/${taskId}`,
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
                const data = await response.json();
                const updatedTasks = updateTaskInList(localTasks, taskId, data.task);
                setLocalTasks(updatedTasks);
                onTasksChange?.(updatedTasks);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const updateTaskInList = (taskList: TaskItem[], taskId: string, updatedTask: TaskItem): TaskItem[] => {
        return taskList.map(task => {
            if (task._id === taskId) {
                return updatedTask;
            }
            if (task.subtasks) {
                return {
                    ...task,
                    subtasks: updateTaskInList(task.subtasks, taskId, updatedTask),
                };
            }
            return task;
        });
    };

    const onSubtaskCreate = () => {
        setNumberOfSubtasks(numberOfSubtasks + 1);
    };

    const onSubtaskCheck = () => {
        setCompleted(completed + 1);
    };

    const onSubtaskUncheck = () => {
        setCompleted(completed - 1);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "88%", width: "100%" }}>
            <LinearProgress
                variant="determinate"
                value={numberOfSubtasks === 0 ? 0 : (completed / numberOfSubtasks) * 100}
                sx={{ height: 8, borderRadius: 5, marginBottom: 2 }}
            />

            {/* Task list box, overflowY makes it scrollable */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    overflowY: "auto",
                    gap: 1,
                }}
            >
                {localTasks.map((task) => (
                    <Task
                        key={task._id}
                        taskId={task._id}
                        title={task.title}
                        completed={task.completed}
                        subtasks={task.subtasks || []}
                        onTitleChange={(newTitle) => handleUpdateTaskTitle(task._id, newTitle)}
                        onSubtaskCreate={onSubtaskCreate}
                        onSubtaskCheck={onSubtaskCheck}
                        onSubtaskUncheck={onSubtaskUncheck}
                    />
                ))}
            </Box>

            {/* Add task button, with the proper callback */}
            <Button onClick={addTask} sx={{ mt: 2, width: "100%" }}>
                <Typography variant="body1" color="black">
                    + Add Task
                </Typography>
            </Button>
        </Box>
    );
}