import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // for redirect after login
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // hook to redirect

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save JWT token to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        alert("Login successful!");
        navigate("/dashboard"); // redirect to dashboard page
      } else {
        alert(data.message); // show error from backend
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="app-wrapper">
      <div className="login-container">
        <h2 className="login-title">Log In</h2>

        <form className="form-fields" onSubmit={handleLogin}>
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="login-button" type="submit">
            Sign In
          </button>
        </form>

        <p style={{ marginTop: "12px" }}>
          Don't have an account?{" "}
          <span
            style={{ color: "#1677FF", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
