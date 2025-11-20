import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import "./App.css"; // import global styles

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
