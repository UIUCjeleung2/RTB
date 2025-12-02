import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/boards", {
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBoards(data.boards);
      } else {
        console.error("Failed to fetch boards");
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    const title = prompt("Enter board name:");
    if (!title || title.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: "",
          color: "#1677FF",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBoards([...boards, { ...data.board, taskCount: 0 }]);
        console.log("Board created:", data.board);
      } else {
        alert("Failed to create board");
      }
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Error creating board");
    }
  };

  const handleDeleteBoard = async (boardId) => {
    // IMPORTANT: Replace this with a custom confirmation modal in your UI
    const isConfirmed = window.confirm(
      "Are you sure you want to permanently delete this board? This cannot be undone."
    );
    
    if (!isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Replace with custom notification/redirect
        console.error("Authorization token not found.");
        return; 
      }

      // Use DELETE method and include the board ID in the URL for the RESTful endpoint
      const response = await fetch(`http://localhost:5001/api/boards/${boardId}`, {
        method: "DELETE",
        headers: {
          Authorization: token, // Pass the authentication token
        },
      });

      if (response.ok) {
        // Filter out the deleted board from the local state list
        const updatedBoards = boards.filter(board => board._id !== boardId);
        setBoards(updatedBoards);
        
        console.log(`Board with ID ${boardId} successfully deleted.`);
        // Replace with custom success toast/notification UI
        // showSuccessNotification("Board deleted successfully!");
      } else {
        // Handle non-200 responses (e.g., 404 Not Found, 401 Unauthorized)
        const errorData = await response.json().catch(() => ({ message: "Server error" }));
        console.error("Failed to delete board:", errorData.message);
        // Replace with custom error notification UI
        // showErrorNotification(`Failed to delete board: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Network or unexpected error deleting board:", error);
      // Replace with custom error notification UI
      // showErrorNotification("Network error occurred while deleting board.");
    }
  };

  return (
    <div className="dashboard">
      <Navbar user={user} />
      <BoardContainer
        boards={boards}
        loading={loading}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
      />
    </div>
  );
}

function Navbar({ user }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">RTB</h1>
        <span className="navbar-subtitle">Recursive Trello Board</span>
      </div>
      <div className="navbar-right">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name}
            className="navbar-profile-pic"
          />
        )}
        <span className="navbar-username">{user.name}</span>
        <button className="navbar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

function BoardContainer({ boards, loading, onCreateBoard, onDeleteBoard }) {
  const navigate = useNavigate();

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  if (loading) {
    return (
      <div className="board-container">
        <div className="loading-message">Loading boards...</div>
      </div>
    );
  }

  return (
    <div className="board-container">
      <div className="board-grid">
        {boards.map((board) => (
          <div
            key={board._id}
            className="board-card"
            onClick={() => handleBoardClick(board._id)}
          >
            <div className="board-card-content">
              <h3 className="board-card-title">{board.title}</h3>
              <p className="board-card-description">
                {board.taskCount === 0
                  ? "No tasks yet"
                  : `${board.taskCount} task${board.taskCount !== 1 ? "s" : ""}`}
              </p>
            <p onClick={() => {onDeleteBoard(board._id)}}>Delete board (move to menu later)</p>
            </div>
          </div>
        ))}
        <div className="board-card board-card-new" onClick={onCreateBoard}>
          <div className="board-card-content">
            <span className="board-card-plus">+</span>
            <p className="board-card-new-text">Create New Board</p>
          </div>
        </div>
      </div>
      {boards.length === 0 && (
        <div className="empty-state">
          <p>No boards yet. Click "Create New Board" to get started!</p>
        </div>
      )}
    </div>
  );
}
