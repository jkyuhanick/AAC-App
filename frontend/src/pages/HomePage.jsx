import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";
import { getBoardById } from "../services/api";
import "../styles/styles.css";
import "../styles/HomePage.css";

const HomePage = ({ user, allBoards }) => {
  const [currentBoard, setCurrentBoard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialBoard = async () => {
      const lastViewedBoardId = localStorage.getItem("lastViewedBoardId");

      if (lastViewedBoardId) {
        const savedBoard = await getBoardById(lastViewedBoardId);
        if (savedBoard) {
          setCurrentBoard(savedBoard);
          return;
        }
      }

      if (allBoards.length > 0) {
        setCurrentBoard(allBoards[0]); // Default board
      }
    };

    fetchInitialBoard();
  }, [allBoards]);

  if (!user) {
    return <h3 className="user-alert">Please log in to view your boards.</h3>;
  }

  if (allBoards.length === 0) {
    return (
      <div className="homePagediv">
        <h3>No boards available. Create a new one!</h3>
        <button onClick={() => navigate("/create-board")} className="create-button">
          <i className="fa-solid fa-plus"></i> &nbsp; Create New Board
        </button>
      </div>
    );
  }

  return (
    <div>
      {currentBoard && <Board board={currentBoard} />}
    </div>
  );
};

export default HomePage;
