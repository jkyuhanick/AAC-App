import { useState } from "react";
import Modal from "./Modal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "../styles/Header.css";

function Header({ user, onLogout, onLogin }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterSuccess = () => {
    setIsRegistering(false);  // Switch to login form after successful registration
  };

  return (
    <header>
      <h1>Home</h1>
      <div className="icons">
        {/* Profile icon - opens modal for login/logout */}
        <p onClick={() => setIsAuthOpen(true)}>
          <i className="fa-solid fa-user"></i> {user?.email} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
        </p>

        {/* Settings Gear Icon 
        <p>
          <i className="fa-solid fa-gear"></i>
        </p> */}
      </div>

      {/* Authentication Modal */}
      {isAuthOpen && (
        <Modal title={user ? "Profile" : isRegistering ? "Register" : "Login"} onClose={() => setIsAuthOpen(false)}>
          {user ? (
            // If logged in, show logout button
            <div>
              <p>User: {user.email}!</p>
              <p>Language: {user.language}</p>
              <button onClick={() => { onLogout(); setIsAuthOpen(false); }}>Logout</button>
            </div>
          ) : (
            // If not logged in, show login/register forms
            isRegistering ? (
              <RegisterForm 
                onClose={() => setIsAuthOpen(false)} 
                onSwitch={() => setIsRegistering(false)} // Switch to login after registration
                onRegisterSuccess={handleRegisterSuccess} // Call handleRegisterSuccess on successful registration
              />
            ) : (
              <LoginForm 
                onClose={() => setIsAuthOpen(false)} 
                onLogin={(userData) => { onLogin(userData); setIsAuthOpen(false); }} 
                onSwitch={() => setIsRegistering(true)} // Switch to registration form
              />
            )
          )}
        </Modal>
      )}
    </header>
  );
}

export default Header;
