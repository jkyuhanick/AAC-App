import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBoardById, updateBoard, getBoardChoices, deleteBoard, fetchFirstBoard, getCurrentUser } from "../services/api";
import "../styles/EditBoard.css";

const EditBoard = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    const fetchBoard = async () => {
      const data = await getBoardById(boardId);
      if (data) {
        setBoard(data);
        setBoardName(data.name);
        setSelectedChoices(data.choices.map(choice => choice._id));
      }
    };

    const fetchChoices = async () => {
      const data = await getBoardChoices();
      setChoices(data);
    };

    fetchBoard();
    fetchChoices();
  }, [boardId]);

  const handleChoiceToggle = (choiceId) => {
    setSelectedChoices((prev) =>
      prev.includes(choiceId) ? prev.filter(id => id !== choiceId) : [...prev, choiceId]
    );
  };

  const handleSave = async () => {
    try {
      const currentChoiceIds = board.choices.map(c => c._id);
  
      // Determine which choices were added or removed
      const addChoices = selectedChoices.filter(id => !currentChoiceIds.includes(id));
      const removeChoices = currentChoiceIds.filter(id => !selectedChoices.includes(id));
  
      await updateBoard(boardId, boardName, addChoices, removeChoices);
      navigate("/");
    } catch (error) {
      console.error("Error updating board:", error);
    }
  };
  

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        await deleteBoard(boardId);
  
        // Get the current user
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser._id) {
          localStorage.removeItem("lastViewedBoardId");
          navigate("/create-board");
          return;
        }
  
        // Fetch first available board after deletion
        const firstBoard = await fetchFirstBoard(currentUser._id);
  
        if (firstBoard) {
          localStorage.setItem("lastViewedBoardId", firstBoard._id);
          navigate("/"); // Redirect to homepage, which will load the first available board
        } else {
          // No boards left, clear stored lastViewedBoardId and navigate to create board page
          localStorage.removeItem("lastViewedBoardId");
          navigate("/");
        }
      } catch (error) {
        console.error("Error deleting board:", error);
      }
    }
  };
  
  

  if (!board) return <p>Board not found</p>;

  return (
    <div className="edit-board">
      <h1>Edit Board</h1>
      <input
        type="text"
        value={boardName}
        onChange={(e) => setBoardName(e.target.value)}
      />
      <div className="choices-container">
        {choices.map((choice) => (
          <div
            key={choice._id}
            className={`tile ${selectedChoices.includes(choice._id) ? "selected" : ""}`}
            onClick={() => handleChoiceToggle(choice._id)}
          >
            <img src={choice.image} alt={choice.phrase} />
            <p>{choice.phrase}</p>
          </div>
        ))}
      </div>
      <button onClick={handleSave}>Save Changes</button> &nbsp;
      <button onClick={handleDelete} className="delete">Delete Board</button>
    </div>
  );
};

export default EditBoard;