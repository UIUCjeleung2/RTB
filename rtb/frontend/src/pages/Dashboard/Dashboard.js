import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
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

  const handleDeleteBoard = (boardId) => {
    const board = boards.find(b => b._id === boardId);
    setBoardToDelete(board);
    setDeleteModalOpen(true);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authorization token not found.");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/boards/${boardToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (response.ok) {
        const updatedBoards = boards.filter(board => board._id !== boardToDelete._id);
        setBoards(updatedBoards);
        console.log(`Board with ID ${boardToDelete._id} successfully deleted.`);
      } else {
        const errorData = await response.json().catch(() => ({ message: "Server error" }));
        console.error("Failed to delete board:", errorData.message);
        alert(`Failed to delete board: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Network or unexpected error deleting board:", error);
      alert("Network error occurred while deleting board.");
    } finally {
      setDeleteModalOpen(false);
      setBoardToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setBoardToDelete(null);
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
      {deleteModalOpen && boardToDelete && (
        <DeleteConfirmationModal
          board={boardToDelete}
          onConfirm={confirmDeleteBoard}
          onCancel={cancelDelete}
        />
      )}
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
            <button
              className="board-delete-btn"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering parent's board click
                onDeleteBoard(board._id);
              }}
            >
              Delete
            </button>
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

function DeleteConfirmationModal({ board, onConfirm, onCancel }) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (inputValue.trim() === board.title.trim()) {
      onConfirm();
    } else {
      setError("Board name does not match. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Board</h2>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-warning">
            ⚠️ This action is permanent and cannot be undone.
          </p>
          <p className="modal-description">
            All tasks and subtasks in this board will be permanently deleted.
          </p>
          <p className="modal-instruction">
            To confirm, type <strong>{board.title}</strong> below:
          </p>
          <input
            type="text"
            className={`modal-input ${error ? "modal-input-error" : ""}`}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Enter board name"
            autoFocus
          />
          {error && <p className="modal-error">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="modal-btn modal-btn-delete"
            onClick={handleConfirm}
            disabled={!inputValue.trim()}
          >
            Delete Board
          </button>
        </div>
      </div>
    </div>
  );
}
