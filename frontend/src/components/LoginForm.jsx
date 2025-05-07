import { useState } from "react";
import { loginUser } from "../services/api"; 

function LoginForm({ onClose, onLogin, onSwitch }) { // Added onSwitch
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userData = await loginUser(email, password);
      onLogin(userData); // Update state in parent with the user data
      document.cookie.split(';').forEach(cookie => console.log(cookie));
      window.location.reload();
      onClose();
    } catch (err) {
      setError(err.message || "Login failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /> <br /> <br />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /> <br />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <br/>
      <button type="submit">Login</button>
      <p onClick={onSwitch} style={{ cursor: "pointer", color: "blue" }}>
        Don't have an account? Register
      </p>
    </form>
  );
}

export default LoginForm;
