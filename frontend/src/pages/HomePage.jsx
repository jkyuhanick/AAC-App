import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";
import SpeechBox from "../components/SpeechBox";
import Tile from "../components/Tile";
import { getBoardById } from "../services/api";
import "../styles/styles.css";
import "../styles/HomePage.css";

const HomePage = ({ user, allBoards }) => {
  const [currentBoard, setCurrentBoard] = useState(null);
  const [defaultChoices, setDefaultChoices] = useState([]);
  const [speechWords, setSpeechWords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if(!user){
      const fetchDefaultChoices = async () => {
        try {
          const data = await getBoardChoices();
          setDefaultChoices(data.choices || []);
        } catch (error) {
          console.error("Error fetching default choices:", error);
        }
      };

      fetchDefaultChoices();
    } else {
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
    }
  }, [allBoards]);

  if (!user) {
    return (
      <div className="board-container">
        <h3 className="user-alert">Log in to create custom boards.</h3>
        <SpeechBox words={speechWords} setWords={setSpeechWords} />
        <div className="choices-container">
          {defaultChoices.map((choice) => (
            <Tile key={choice._id} choice={choice} onClick={addWord} />
          ))}
        </div>
      </div>
    );
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
