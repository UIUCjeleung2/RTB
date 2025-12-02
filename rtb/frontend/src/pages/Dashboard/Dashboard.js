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

  return (
    <div className="dashboard">
      <Navbar user={user} />
      <BoardContainer
        boards={boards}
        loading={loading}
        onCreateBoard={handleCreateBoard}
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

function BoardContainer({ boards, loading, onCreateBoard }) {
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
