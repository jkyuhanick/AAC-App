import { useState } from "react";
import { registerUser } from "../services/api";

function RegisterForm({ onClose, onSwitch, onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await registerUser(email, password);
      onRegisterSuccess(); // Switch to login form after successful registration
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      /> <br /> <br />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      /> <br/> <br/>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit">Register</button>
      <p 
        onClick={onSwitch} 
        style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
      >
        Already have an account? Login
      </p>
    </form>
  );
}

export default RegisterForm;
