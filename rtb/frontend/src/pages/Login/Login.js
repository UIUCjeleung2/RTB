import React from "react";
import GoogleLogin from "../../components/GoogleLogin";
import "./Login.css";

export default function Login() {
  return (
    <div className="app-wrapper">
      <div className="login-container">
        <h2 className="login-title">Welcome to RTB</h2>
        <p className="login-subtitle">Recursive Trello Board</p>

        <div className="google-login-wrapper">
          <GoogleLogin />
        </div>

        <p className="login-info">
          Sign in with your Google account to get started
        </p>
      </div>
    </div>
  );
}
