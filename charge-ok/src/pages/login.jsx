// src/pages/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseAuth } from "../utils/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Reset error state before submission

    try {
      // Firebase sign-in with email and password
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      alert("Login successful!");
      navigate("/"); // Redirect to main page after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Sign In</button>
      </form>
    </div>
  );
}

export default Login;
