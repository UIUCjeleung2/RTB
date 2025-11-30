import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Dashboard route will be added here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
