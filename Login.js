import { useState } from "react";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      // 🔐 Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Login successful!");
      navigate("/dashboard"); // 🔁 Everyone goes to dashboard now
    } catch (err) {
      alert("❌ Login failed: " + err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={loginUser}>
        <h2>Login to Innoworq</h2>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">🔐 Login</button>
      </form>
    </div>
  );
}
