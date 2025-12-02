import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BoardView.css";
import BoardCard from "../../components/BoardCard.tsx";
import Button from "@mui/material/Button";
import { Typography, Box } from "@mui/material";
import Task from "../../components/Task.tsx";
import AddTask from "../../components/AddTask.tsx";

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
    <div className="board-view">

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

      <BoardCard>
        <Box 
          sx={{
            display: 'flex',            // 1. Enable Flexbox
            flexDirection: 'row',       // (Optional but explicit) Arrange children in a row
            alignItems: 'center',       // Vertically centers the items (button, text, button)
            gap: 1,                     // Adds spacing between the children (equivalent to theme.spacing(1))
            p: 1,                       // Adds a little padding around the whole group
            border: '1px solid #ccc'    // Just to visualize the container boundaries
          }}
        >
            <Button variant="outlined">Button</Button>
            <Typography variant="h6" component="h2">Task Name</Typography>
            <Button variant="outlined">Checkmark</Button>
        </Box>
        
        <Task/>
        <AddTask>
          <Typography variant="body1" color="black">+ Add Task</Typography>
        </AddTask>

      </BoardCard>

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