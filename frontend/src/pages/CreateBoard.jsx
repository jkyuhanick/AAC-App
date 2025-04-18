import { useState, useEffect } from "react";
import { createBoard, getBoardChoices, getCurrentUser, fetchFirstBoard } from "../services/api";
import { useNavigate } from "react-router-dom";
import Tile from "../components/Tile";
import CustomTileModal from "../components/CustomTileModal"; // Import the modal component
import "../styles/Board.css"; 
import "../styles/CreateBoard.css";

function CreateBoard() {
  const [choices, setChoices] = useState([]);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [boardName, setBoardName] = useState("");
  const [createdBoard, setCreatedBoard] = useState(null);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // Modal state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData && userData._id) {
          setUser(userData);
          const choicesData = await getBoardChoices(userData._id);
          setChoices(choicesData);
        } else {
          console.log("User not found");
        }
      } catch (err) {
        console.error("Error fetching user or choices:", err);
      }
    };
  
    fetchData();
  
    // Restore board name if it was previously entered
    const savedBoardName = localStorage.getItem("boardName");
    if (savedBoardName) {
      setBoardName(savedBoardName);
    }
  }, []);
  
  

  const handleChoiceSelect = (choiceId) => {
    setSelectedChoices((prev) =>
      prev.includes(choiceId)
        ? prev.filter((id) => id !== choiceId) // Remove if already selected
        : [...prev, choiceId] // Add if not selected
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!boardName) {
      alert("Please enter a board name.");
      return;
    }
  
    try {
      const newBoard = await createBoard(user._id, boardName, selectedChoices);
      localStorage.setItem("lastViewedBoardId", newBoard.board._id);
      localStorage.removeItem("boardName"); // Clear saved name after board creation
      navigate("/"); // Redirect to homepage
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Error creating board. Please try again.");
    }
  };
  
  

  return (
    <div className="board-container">
      <h1>Create New Board</h1>
      <form onSubmit={handleSubmit} className="board-form">
        <div className="board-name-container">
          <label htmlFor="boardName">Board Name:</label>
          <input
            id="boardName"
            type="text"
            value={boardName}
            onChange={(e) => {
              setBoardName(e.target.value);
              localStorage.setItem("boardName", e.target.value);
            }}
            required
          />
        </div>

        <div className="choices-container">
          {choices.length > 0 ? (
            choices.map((choice) => (
              <Tile
                key={choice._id}
                choice={choice}
                onClick={() => handleChoiceSelect(choice._id)}
                isSelected={selectedChoices.includes(choice._id)}
              />
            ))
          ) : (
            <p>Loading choices...</p>
          )}
        </div>

        <button type="button" onClick={() => setModalOpen(true)} className="create-your-own-button">
          + Create your own
        </button>

        <button type="submit" className="create-button">Create Board</button>
      </form>

      {modalOpen && (
        <CustomTileModal
          userId={user._id} // Pass user ID for associating the tile
          onClose={() => setModalOpen(false)}
          onCustomTileAdded={(newChoice) => setChoices((prev) => [...prev, newChoice])} // Update choices list
        />
      )}
    </div>
  );
}

export default CreateBoard;
