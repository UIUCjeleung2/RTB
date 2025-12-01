import React from "react";
import "./Dashboard.css";

export default function Dashboard() {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard">
      <Navbar user={user} />
      <BoardContainer />
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

function BoardContainer() {
  const handleBoardClick = (index) => {
    console.log(`Board ${index + 1} clicked!`);
  };

  return (
    <div className="board-container">
      <div className="board-grid">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="board-card"
            onClick={() => handleBoardClick(index)}
          >
            <div className="board-card-content">
              <h3 className="board-card-title">Board {index + 1}</h3>
              <p className="board-card-description">
                Click to open this board
              </p>
            </div>
          </div>
        ))}
        <div className="board-card board-card-new">
          <div className="board-card-content">
            <span className="board-card-plus">+</span>
            <p className="board-card-new-text">Create New Board</p>
          </div>
        </div>
      </div>
    </div>
  );
}
