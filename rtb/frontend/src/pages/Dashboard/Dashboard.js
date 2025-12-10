import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://rtbbackend-ng6n.onrender.com/api/boards", {
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
      const response = await fetch("https://rtbbackend-ng6n.onrender.com/api/boards", {
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

      const response = await fetch(`https://rtbbackend-ng6n.onrender.com/api/boards/${boardToDelete._id}`, {
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

  const handleEditBoard = (boardId) => {
    const board = boards.find(b => b._id === boardId);
    setBoardToEdit(board);
    setEditModalOpen(true);
  };

  const confirmEditBoard = async (newTitle) => {
    if (!boardToEdit || !newTitle.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authorization token not found.");
        return;
      }

      const response = await fetch(`https://rtbbackend-ng6n.onrender.com/api/boards/${boardToEdit._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedBoards = boards.map(board =>
          board._id === boardToEdit._id ? { ...board, title: data.board.title } : board
        );
        setBoards(updatedBoards);
        console.log(`Board with ID ${boardToEdit._id} successfully renamed.`);
      } else {
        const errorData = await response.json().catch(() => ({ message: "Server error" }));
        console.error("Failed to update board:", errorData.message);
        alert(`Failed to update board: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Network or unexpected error updating board:", error);
      alert("Network error occurred while updating board.");
    } finally {
      setEditModalOpen(false);
      setBoardToEdit(null);
    }
  };

  const cancelEdit = () => {
    setEditModalOpen(false);
    setBoardToEdit(null);
  };

  return (
    <div className="dashboard">
      <Navbar user={user} />
      <BoardContainer
        boards={boards}
        loading={loading}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
        onEditBoard={handleEditBoard}
      />
      {deleteModalOpen && boardToDelete && (
        <DeleteConfirmationModal
          board={boardToDelete}
          onConfirm={confirmDeleteBoard}
          onCancel={cancelDelete}
        />
      )}
      {editModalOpen && boardToEdit && (
        <EditBoardModal
          board={boardToEdit}
          onConfirm={confirmEditBoard}
          onCancel={cancelEdit}
        />
      )}
    </div>
  );
}

function EditBoardModal({ board, onConfirm, onCancel }) {
  const [inputValue, setInputValue] = useState(board.title);

  const handleConfirm = () => {
    if (inputValue.trim() && inputValue.trim() !== board.title) {
      onConfirm(inputValue);
    } else if (inputValue.trim() === board.title) {
      onCancel(); // No changes made
    }
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
          <h2>Edit Board Name</h2>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-description">
            Enter a new name for this board:
          </p>
          <input
            type="text"
            className="modal-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Board name"
            autoFocus
          />
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="modal-btn modal-btn-confirm"
            onClick={handleConfirm}
            disabled={!inputValue.trim() || inputValue.trim() === board.title}
          >
            Save
          </button>
        </div>
      </div>
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

function BoardContainer({ boards, loading, onCreateBoard, onDeleteBoard, onEditBoard }) {
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
            <div className="board-actions">
              <button
                className="board-action-btn board-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBoard(board._id);
                }}
              >
                Edit
              </button>
              <button
                className="board-action-btn board-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBoard(board._id);
                }}
              >
                Delete
              </button>
            </div>
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
