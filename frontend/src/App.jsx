import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from 'axios';
import Header from './components/Header';
import HomePage from "./pages/HomePage";
import CreateBoard from "./pages/CreateBoard";
import EditBoard from "./pages/EditBoard";
import './styles/styles.css';

// Import API functions
import { loginUser, logoutUser, getCurrentUser, getBoards } from './services/api'; // Import from api.js

function App() {
  const [user, setUser] = useState(null);
  const [allBoards, setAllBoards] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    const fetchUserAndBoards = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        if (userData && userData._id) {
          const boardsResponse = await getBoards();
          setAllBoards(boardsResponse.boards || []);
        }
      } catch (error) {
        console.error("Error fetching user and boards:", error);
      }
    };
    fetchUserAndBoards();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
  
      // Fetch boards after logging in
      const boardsResponse = await getBoards();
      const boards = boardsResponse.boards || [];
      setAllBoards(boards);
  
      // If user has boards, store the first one in localStorage
      if (boards.length > 0) {
        localStorage.setItem("lastViewedBoardId", boards[0]._id);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
  

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("user");
      localStorage.removeItem("lastViewedBoardId");
      localStorage.removeItem("boardName"); // Clear saved name after board creation
      setUser(null); // Clear the user from state on logout
      setAllBoards([]);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} onLogin={handleLogin} />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage user={user} allBoards={allBoards} />} />
          <Route path="/create-board" element={<CreateBoard />} />
          <Route path="/edit-board/:boardId" element={<EditBoard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
