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
  onClickSubtask: (taskId: string) => void;
  taskId: string;
  isRoot: boolean;
}

// The TaskList holds all the task cards in a scrollable area
// and fixes the Add Task button at the bottom.

export default function TaskList({ boardId, tasks = [], onClickSubtask, taskId, isRoot}: TaskListProps) {
    const [localTasks, setLocalTasks] = useState<TaskItem[]>(tasks);
    const [numberOfSubtasks, setNumberOfSubtasks] = useState(0);
    const [completed, setCompleted] = useState(0);
    const token = localStorage.getItem("token");

    useEffect(() => {
        setLocalTasks(tasks);
        calculateProgress(tasks);
    }, [tasks]);

    // Helper: Apply cascading completion logic locally
    const applyCascadeLocally = (taskList: TaskItem[], taskId: string, newCompleted: boolean): TaskItem[] => {
        const cascadeToChildren = (task: TaskItem, completed: boolean): TaskItem => {
            const updatedSubtasks = task.subtasks?.map(st => cascadeToChildren(st, completed)) || [];
            return { ...task, completed, subtasks: updatedSubtasks };
        };

        const updateTaskRecursively = (taskList: TaskItem[]): TaskItem[] => {
            return taskList.map(task => {
                if (task._id === taskId) {
                    // Found the toggled task - cascade to children
                    return cascadeToChildren(task, newCompleted);
                }

                // Check subtasks recursively
                if (task.subtasks && task.subtasks.length > 0) {
                    const updatedSubtasks = updateTaskRecursively(task.subtasks);

                    // Check if all subtasks are complete
                    const allComplete = updatedSubtasks.every(st => st.completed);

                    return {
                        ...task,
                        completed: allComplete,
                        subtasks: updatedSubtasks
                    };
                }

                return task;
            });
        };

        return updateTaskRecursively(taskList);
    };

    // Optimistic task toggle update
    const handleOptimisticToggle = (taskId: string, currentCompleted: boolean) => {
        const newCompleted = !currentCompleted;
        const updatedTasks = applyCascadeLocally(localTasks, taskId, newCompleted);
        setLocalTasks(updatedTasks);
        calculateProgress(updatedTasks);
    };

    const calculateProgress = (taskList: TaskItem[]) => {
        const totalRootTasks = taskList.length;

        if (totalRootTasks === 0) {
            setNumberOfSubtasks(0);
            setCompleted(0);
            return;
        }

        // Calculate completion weight for a task (0 to 1)
        const getTaskCompletionWeight = (task: TaskItem): number => {
            if (!task.subtasks || task.subtasks.length === 0) {
                // Leaf task - either complete (1) or incomplete (0)
                return task.completed ? 1 : 0;
            }

            // Task with subtasks - weighted average of subtask completion
            const subtaskWeights = task.subtasks.map(st => getTaskCompletionWeight(st));
            const totalWeight = subtaskWeights.reduce((sum, w) => sum + w, 0);
            return totalWeight / subtaskWeights.length;
        };

        // Sum up completion weights for all root tasks
        let totalCompletionWeight = 0;
        taskList.forEach(task => {
            totalCompletionWeight += getTaskCompletionWeight(task);
        });

        // Progress is based on root tasks only
        // Each root task contributes equally (1/totalRootTasks)
        const percentage = (totalCompletionWeight / totalRootTasks) * 100;

        // For display purposes, we show it as completed/total
        setNumberOfSubtasks(totalRootTasks);
        setCompleted(totalCompletionWeight);
    };

    // Add a new root task
    const addTask = async () => {
        if (!boardId) return;

        console.log("Creating task: ", isRoot, taskId);
        try {
            const response = await fetch(
                `http://localhost:5001/api/tasks/board/${boardId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                    body: isRoot ? 
                        JSON.stringify({
                            title: "New Task",
                        })
                        : JSON.stringify({
                            title: "New Subtask",
                            parentTaskId: taskId,
                        })
                }
            );

            if (response.ok) {
                const data = await response.json();
                const newTasks = [...localTasks, data.task];
                setLocalTasks(newTasks);
                handleTasksRefresh();
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

    // Refresh tasks when a subtask is added/deleted
    const handleTasksRefresh = async () => {
        if (!boardId) return;

        try {
            const response = await fetch(
                isRoot ? `http://localhost:5001/api/tasks/board/${boardId}` : `http://localhost:5001/api/tasks/${taskId}`,
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log("Refresh data:", data);
                let tasks = isRoot ? data.tasks : data.task.subtasks;
                
                setLocalTasks(tasks);
                calculateProgress(tasks);
            }
        } catch (error) {
            console.error("Error refreshing tasks:", error);
        }
    };

    // Removed manual increment/decrement callbacks
    // Progress is now calculated from actual task data after server refresh

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
                        onTasksChange={handleTasksRefresh}
                        onOptimisticToggle={handleOptimisticToggle}
                        onClickSubtask={() => onClickSubtask(task._id)}
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