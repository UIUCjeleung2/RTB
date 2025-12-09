import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BoardView.css";
import BoardCard from "../../components/BoardCard.tsx";
import Button from "@mui/material/Button";
import { Typography, Box, IconButton, TextField } from "@mui/material";
import Task from "../../components/Task.tsx";
import AddTask from "../../components/AddTask.tsx";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Check from "@mui/icons-material/Check";
import TaskList from "../../components/TaskList.tsx";

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");


  const [boardStack, setBoardStack] = useState([]);

  // Used to spawn a board card with name "title" and at left corner coord "x"
  const spawnBoardCard = (title, left) => {
    const newBoard = {
      id: crypto.randomUUID(),
      title: title,
      currentX: -400,
      targetX: left
    }
    setBoardStack(prev => [...prev, newBoard]);

    // This will animate the boardCard sliding in
    setTimeout(() => {
      setBoardStack((prev) =>
        prev.map((b) =>
          b.id === newBoard.id ? {...b, currentX: b.targetX} : b
        )
      );
    }, 400);
  };

  // When we click on the up arrow, we want to pop the latest
  // boardcard off the stack
  const goUp = () => {
    console.log(boardStack);
    setBoardStack(prev => {
      if (prev.length <= 1) {
        navigate("/dashboard");
        return []; // remove last card
      }
      return prev.slice(0, -1);
    });
  };



  // Define a function named spawnNewBoardCard which will dynamically put in more of them
  // This will spawn a card when the board is opened
const hasSpawnedInitialCard = useRef(false);

useEffect(() => {
  if (!hasSpawnedInitialCard.current) {
    spawnBoardCard("Card1", 100);
    hasSpawnedInitialCard.current = true;
  }
}, []);


  useEffect(() => {
    console.log(boardStack);
  }, [boardStack]);

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/boards/${boardId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBoard(data.board);
        localStorage.setItem("boardId", boardId);
        
        // Fetch tasks for this board
        const tasksResponse = await fetch(
          `http://localhost:5001/api/tasks/board/${boardId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.tasks);
        }
      } else {
        console.error("Failed to fetch board");
        alert("Board not found");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching board:", error);
      alert("Error loading board");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="board-view">
        <div className="loading-message">Loading board...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-view">
        <div className="error-message">Board not found</div>
      </div>
    );
  }



  return (
    <div className="board-view" style={{backgroundColor: "#282c34"}}>

      {/* This is the navbar at the top of the page*/}
      <div className="board-navbar">        
        <button className="back-button" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
        <h1 className="board-title">{board.title}</h1>
        <div className="board-user-info">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="board-profile-pic"
            />
          )}
        </div>
      </div>

      {/* This is the actual board stuff */}

      {boardStack.map(board => (
      <BoardCard sx = {{minWidth: 345, left: board.currentX, transition: "left 0.5s ease"}}>
        <Box 
          sx={{
            display: 'flex',               // 1. Enable Flexbox
            flexDirection: 'row',          // (Optional but explicit) Arrange children in a row
            alignItems: 'stretch',         // Vertically centers the items (button, text, button)
            gap: 1,                        // Adds spacing between the children (equivalent to theme.spacing(1))
            p: 1,                          // Adds a little padding around the whole group
            border: '1px solid #ccc',    // Just to visualize the container boundaries
            width: "95%"
          }}
        >
            <IconButton variant="outlined" onClick={()=> goUp()}>
              <ArrowUpward sx={{color:"blue"}}/>
            </IconButton>
            <TextField value = {board.title} fullWidth> </TextField>
            {/* <Typography variant="h6" component="h2" sx={{flex: 1, textAlign: "center"}}>Task Name</Typography> */}
            <IconButton variant="outlined" onClick={() => spawnBoardCard("name", 500)}>
              <Check sx = {{color:"black"}}/>
            </IconButton>
        </Box>
        
        {/* The actual task card */}
        {/* <Task/>
        <AddTask>
          <Typography variant="body1" color="black">+ Add Task</Typography>
        </AddTask> */}

        <TaskList boardId={boardId} tasks={tasks} onTasksChange={setTasks} />

      </BoardCard>      
    ))}




      {/* <div className="board-content">
        <div className="board-info-card">
          <h2>Board Information</h2>
          <div className="info-row">
            <span className="info-label">Board ID:</span>
            <span className="info-value">{board._id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Title:</span>
            <span className="info-value">{board.title}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Description:</span>
            <span className="info-value">
              {board.description || "(No description)"}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Color:</span>
            <span className="info-value">
              <span
                className="color-preview"
                style={{ backgroundColor: board.color }}
              ></span>
              {board.color}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Created:</span>
            <span className="info-value">
              {new Date(board.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="tasks-placeholder">
          <p className="placeholder-text">
            Tasks will appear here once implemented
          </p>
        </div>
      </div> */}
    </div>
  );
}
